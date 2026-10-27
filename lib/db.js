import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'data_local.json');

// Memory cache of data
let memoryData = null;

function loadData() {
  if (memoryData) return memoryData;
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      memoryData = JSON.parse(raw);
    } else {
      memoryData = {
        photos: [],
        site_settings: { id: 'site' },
        blog_posts: [],
        contact_messages: [],
        print_requests: [],
      };
      saveData();
    }
  } catch (err) {
    console.error('Failed to load data_local.json:', err);
    memoryData = {
      photos: [],
      site_settings: { id: 'site' },
      blog_posts: [],
      contact_messages: [],
      print_requests: [],
    };
  }
  return memoryData;
}

function saveData() {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(memoryData, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to write data_local.json:', err);
  }
}

function matchFilter(doc, filter) {
  if (!filter || Object.keys(filter).length === 0) return true;
  for (const [key, value] of Object.entries(filter)) {
    if (key === '$or' && Array.isArray(value)) {
      if (!value.some((cond) => matchFilter(doc, cond))) return false;
    } else if (doc[key] !== value) {
      return false;
    }
  }
  return true;
}

class Collection {
  constructor(name) {
    this.name = name;
  }

  _getItems() {
    const data = loadData();
    if (!data[this.name]) {
      data[this.name] = [];
    }
    return data[this.name];
  }

  async find(filter = {}, sortKey = null, sortDir = 1) {
    const items = this._getItems().filter((d) => matchFilter(d, filter));
    if (sortKey) {
      items.sort((a, b) => {
        const valA = a[sortKey] ?? '';
        const valB = b[sortKey] ?? '';
        if (valA < valB) return -1 * sortDir;
        if (valA > valB) return 1 * sortDir;
        return 0;
      });
    }
    return JSON.parse(JSON.stringify(items));
  }

  async findOne(filter = {}) {
    const items = this._getItems();
    const found = items.find((d) => matchFilter(d, filter));
    return found ? JSON.parse(JSON.stringify(found)) : null;
  }

  async insertOne(doc) {
    const items = this._getItems();
    const copy = JSON.parse(JSON.stringify(doc));
    items.push(copy);
    saveData();
    return { insertedId: copy.id };
  }

  async insertMany(docs) {
    const items = this._getItems();
    for (const doc of docs) {
      items.push(JSON.parse(JSON.stringify(doc)));
    }
    saveData();
    return { insertedCount: docs.length };
  }

  async updateOne(filter, update, options = {}) {
    const items = this._getItems();
    const setVals = update.$set || update;
    const index = items.findIndex((d) => matchFilter(d, filter));
    if (index !== -1) {
      items[index] = { ...items[index], ...JSON.parse(JSON.stringify(setVals)) };
      saveData();
      return { matchedCount: 1, modifiedCount: 1 };
    } else if (options.upsert) {
      const newDoc = { ...filter, ...JSON.parse(JSON.stringify(setVals)) };
      items.push(newDoc);
      saveData();
      return { matchedCount: 0, upsertedCount: 1 };
    }
    return { matchedCount: 0, modifiedCount: 0 };
  }

  async deleteOne(filter) {
    const items = this._getItems();
    const index = items.findIndex((d) => matchFilter(d, filter));
    if (index !== -1) {
      items.splice(index, 1);
      saveData();
      return { deletedCount: 1 };
    }
    return { deletedCount: 0 };
  }

  async bulkWrite(ops) {
    for (const op of ops) {
      if (op.updateOne) {
        await this.updateOne(op.updateOne.filter, op.updateOne.update, {
          upsert: op.updateOne.upsert,
        });
      }
    }
  }
}

export const db = {
  photos: new Collection('photos'),
  site_settings: new Collection('site_settings'),
  blog_posts: new Collection('blog_posts'),
  contact_messages: new Collection('contact_messages'),
  print_requests: new Collection('print_requests'),
};

export default db;
