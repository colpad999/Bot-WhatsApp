// File: src/core/database.js

import fs from "fs"

const path = "./database/database.json"

let db = { groups: {}, users: {} }

export function loadDB() {
  if (fs.existsSync(path)) {
    db = JSON.parse(fs.readFileSync(path))
  }
}

export function saveDB() {
  fs.writeFileSync(path, JSON.stringify(db, null, 2))
}

export function getGroup(jid) {
  if (!db.groups[jid]) {
    db.groups[jid] = {
      antiLink: false,
      welcome: false,
      antiSpam: false,
      badword: false
    }
  }
  return db.groups[jid]
}

export function getUser(id) {
  if (!db.users[id]) {
    db.users[id] = {
      money: 1000,
      exp: 0,
      level: 1,
      lastDaily: 0
    }
  }
  return db.users[id]
}

export default db
