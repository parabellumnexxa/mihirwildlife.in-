import json
import asyncio
from pathlib import Path
from copy import deepcopy

class LocalCursor:
    def __init__(self, docs):
        self._docs = docs

    def sort(self, field, direction=1):
        reverse = (direction == -1)
        self._docs.sort(
            key=lambda x: (x.get(field) is None, x.get(field)),
            reverse=reverse
        )
        return self

    async def to_list(self, length=None):
        if length is not None:
            return deepcopy(self._docs[:length])
        return deepcopy(self._docs)


class LocalCollection:
    def __init__(self, db, name):
        self.db = db
        self.name = name

    def _matches(self, doc, filter_dict):
        for k, v in filter_dict.items():
            if k == "$or" and isinstance(v, list):
                if not any(self._matches(doc, cond) for cond in v):
                    return False
            elif doc.get(k) != v:
                return False
        return True

    def find(self, filter_dict=None, projection=None):
        filter_dict = filter_dict or {}
        items = [d for d in self.db._get_data(self.name) if self._matches(d, filter_dict)]
        return LocalCursor(items)

    async def find_one(self, filter_dict=None, projection=None):
        filter_dict = filter_dict or {}
        for d in self.db._get_data(self.name):
            if self._matches(d, filter_dict):
                return deepcopy(d)
        return None

    async def insert_one(self, doc):
        d = deepcopy(doc)
        self.db._get_data(self.name).append(d)
        self.db._save()
        class Result:
            inserted_id = d.get("id")
        return Result()

    async def insert_many(self, docs):
        for doc in docs:
            self.db._get_data(self.name).append(deepcopy(doc))
        self.db._save()

    async def update_one(self, filter_dict, update, upsert=False):
        data = self.db._get_data(self.name)
        set_vals = update.get("$set", update)
        for i, d in enumerate(data):
            if self._matches(d, filter_dict):
                data[i].update(deepcopy(set_vals))
                self.db._save()
                return
        if upsert:
            new_doc = deepcopy(filter_dict)
            new_doc.update(deepcopy(set_vals))
            data.append(new_doc)
            self.db._save()

    async def bulk_write(self, ops):
        for op in ops:
            f = getattr(op, "_filter", None)
            d = getattr(op, "_doc", None)
            if f is not None and d is not None:
                await self.update_one(f, d)
        self.db._save()

    async def delete_one(self, filter_dict):
        data = self.db._get_data(self.name)
        for i, d in enumerate(data):
            if self._matches(d, filter_dict):
                del data[i]
                self.db._save()
                return

    async def distinct(self, key):
        items = self.db._get_data(self.name)
        distinct_vals = set()
        for d in items:
            if key in d and d[key] is not None:
                distinct_vals.add(d[key])
        return list(distinct_vals)


class LocalDatabase:
    def __init__(self, file_path: Path):
        self.file_path = file_path
        self._collections = {}
        self._load()

    def _load(self):
        if self.file_path.exists():
            try:
                with open(self.file_path, "r", encoding="utf-8") as f:
                    self._data = json.load(f)
            except Exception:
                self._data = {}
        else:
            self._data = {}

    def _save(self):
        try:
            with open(self.file_path, "w", encoding="utf-8") as f:
                json.dump(self._data, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"Warning: Failed to save local db: {e}")

    def _get_data(self, name: str):
        if name not in self._data:
            self._data[name] = []
        return self._data[name]

    def __getitem__(self, name: str):
        return getattr(self, name)

    def __getattr__(self, name: str):
        if name not in self._collections:
            self._collections[name] = LocalCollection(self, name)
        return self._collections[name]
