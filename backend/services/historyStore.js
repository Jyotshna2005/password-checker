const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const dataDirectory = path.join(__dirname, "..", "data");
const dataFile = path.join(dataDirectory, "history.json");

function read() {
  try {
    if (!fs.existsSync(dataFile)) return [];
    const parsed = JSON.parse(fs.readFileSync(dataFile, "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(records) {
  fs.mkdirSync(dataDirectory, { recursive: true });
  fs.writeFileSync(dataFile, JSON.stringify(records, null, 2), "utf8");
}

function getAll() {
  return read().sort((a, b) => new Date(b.checkedAt) - new Date(a.checkedAt));
}

function add({ label, pwnedCount, favorite }) {
  const records = read();
  const record = {
    id: crypto.randomUUID(),
    label,
    pwnedCount,
    favorite,
    checkedAt: new Date().toISOString()
  };
  records.push(record);
  write(records);
  return record;
}

function patch(id, changes) {
  const allowed = {};
  if (typeof changes.label === "string" && changes.label.trim()) {
    allowed.label = changes.label.trim().slice(0, 60);
  }
  if (typeof changes.favorite === "boolean") allowed.favorite = changes.favorite;
  if (!Object.keys(allowed).length) return null;

  const records = read();
  const index = records.findIndex(item => item.id === id);
  if (index === -1) return null;
  records[index] = { ...records[index], ...allowed };
  write(records);
  return records[index];
}

function replace(id, representation) {
  const records = read();
  const index = records.findIndex(item => item.id === id);
  if (index === -1) return null;
  records[index] = {
    ...records[index],
    label: representation.label.trim().slice(0, 60) || "Password check",
    favorite: representation.favorite
  };
  write(records);
  return records[index];
}

module.exports = { getAll, add, patch, replace };
