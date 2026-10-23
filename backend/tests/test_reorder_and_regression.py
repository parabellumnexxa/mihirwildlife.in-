"""Tests for reorder correctness, auth, seed idempotency, and regression sweep."""
import os
import pytest
import requests
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv("/app/backend/.env")
load_dotenv("/app/frontend/.env")

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
ADMIN_PASSWORD = "Mihir@282878"
MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME")

_mongo = MongoClient(MONGO_URL)[DB_NAME] if MONGO_URL and DB_NAME else None


@pytest.fixture(scope="module")
def token():
    r = requests.post(f"{BASE_URL}/api/admin/login", json={"password": ADMIN_PASSWORD})
    assert r.status_code == 200, r.text
    return r.json()["token"]


@pytest.fixture
def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


# ---------- Reorder ----------
class TestReorder:
    def test_reorder_reverse_then_restore(self, auth_headers):
        photos = requests.get(f"{BASE_URL}/api/photos").json()
        assert len(photos) == 16
        original_ids = [p["id"] for p in photos]
        reversed_ids = list(reversed(original_ids))

        r = requests.put(f"{BASE_URL}/api/photos/reorder",
                         json={"ids": reversed_ids}, headers=auth_headers)
        assert r.status_code == 200, r.text

        after = requests.get(f"{BASE_URL}/api/photos").json()
        after_ids = [p["id"] for p in after]
        assert after_ids == reversed_ids, f"Expected reversed order, got {after_ids}"
        # order fields should be 0..n-1
        for idx, p in enumerate(after):
            assert p.get("order") == idx, f"Photo {p['id']} has order {p.get('order')}, expected {idx}"

        # Restore
        rr = requests.put(f"{BASE_URL}/api/photos/reorder",
                          json={"ids": original_ids}, headers=auth_headers)
        assert rr.status_code == 200
        restored = requests.get(f"{BASE_URL}/api/photos").json()
        assert [p["id"] for p in restored] == original_ids

    def test_reorder_empty_ids(self, auth_headers):
        r = requests.put(f"{BASE_URL}/api/photos/reorder",
                         json={"ids": []}, headers=auth_headers)
        assert r.status_code == 200, r.text

    def test_reorder_requires_auth(self):
        r = requests.put(f"{BASE_URL}/api/photos/reorder", json={"ids": []})
        assert r.status_code == 401


# ---------- Seed idempotency ----------
class TestSeedIdempotency:
    def test_exactly_16_no_dupes(self):
        photos = requests.get(f"{BASE_URL}/api/photos").json()
        assert len(photos) == 16
        public_ids = [p.get("public_id") for p in photos]
        assert len(public_ids) == len(set(public_ids)), f"Dupes: {public_ids}"
        for p in photos:
            assert p.get("collection"), f"Photo {p.get('title')} has no collection"


# ---------- Regression: root + site ----------
class TestRegressionCore:
    def test_root(self):
        r = requests.get(f"{BASE_URL}/api/")
        assert r.status_code == 200

    def test_site_content(self):
        r = requests.get(f"{BASE_URL}/api/site")
        assert r.status_code == 200
        s = r.json()
        assert s.get("contact_email") == "mihirwildlife@gmail.com"
        assert "currency" in s
        assert isinstance(s.get("print_options"), list) and len(s["print_options"]) > 0
        assert "Reptiles" in (s.get("collections") or {})

    def test_share_card_fetchable(self):
        photos = requests.get(f"{BASE_URL}/api/photos").json()
        r = requests.get(f"{BASE_URL}/api/photos/{photos[0]['id']}/share-card")
        assert r.status_code == 200
        url = r.json()["url"]
        assert "res.cloudinary.com" in url
        img = requests.get(url, timeout=30)
        assert img.status_code == 200
        assert img.headers.get("content-type", "").startswith("image/")


# ---------- Contact + Print requests ----------
class TestContactAndPrint:
    def test_contact_create_and_admin_list(self, auth_headers):
        # Unauthenticated list should 401
        no_auth = requests.get(f"{BASE_URL}/api/contact")
        assert no_auth.status_code == 401

        payload = {"name": "TEST_User", "email": "test_regression@example.com",
                   "message": "TEST_regression message"}
        r = requests.post(f"{BASE_URL}/api/contact", json=payload)
        assert r.status_code in (200, 201), r.text
        created = r.json()
        assert "id" in created
        cid = created["id"]

        # Admin list works
        lst = requests.get(f"{BASE_URL}/api/contact", headers=auth_headers)
        assert lst.status_code == 200
        ids = [m.get("id") for m in lst.json()]
        assert cid in ids

        # Cleanup via Mongo (no DELETE endpoint)
        if _mongo is not None:
            _mongo.contact_messages.delete_one({"id": cid})

    def test_print_request_create_and_admin_list(self, auth_headers):
        no_auth = requests.get(f"{BASE_URL}/api/print-requests")
        assert no_auth.status_code == 401

        # Fetch site to pick a valid print option
        s = requests.get(f"{BASE_URL}/api/site").json()
        photos = requests.get(f"{BASE_URL}/api/photos").json()
        opt = s["print_options"][0]
        size_label = opt.get("size") or opt.get("label") or "A3"

        payload = {
            "name": "TEST_Buyer",
            "email": "test_print@example.com",
            "photo_id": photos[0]["id"],
            "photo_title": photos[0]["title"],
            "purpose": "print",
            "print_size": size_label,
            "message": "TEST_print request",
        }
        r = requests.post(f"{BASE_URL}/api/print-requests", json=payload)
        assert r.status_code in (200, 201), r.text
        created = r.json()
        assert "id" in created
        pid = created["id"]

        lst = requests.get(f"{BASE_URL}/api/print-requests", headers=auth_headers)
        assert lst.status_code == 200
        ids = [m.get("id") for m in lst.json()]
        assert pid in ids

        # Cleanup via Mongo (no DELETE endpoint)
        if _mongo is not None:
            _mongo.print_requests.delete_one({"id": pid})
