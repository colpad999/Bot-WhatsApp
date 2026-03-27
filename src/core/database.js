import fs from "fs"

const path = "./database/database.json"

// tambahkan di atas
export function getCaptcha() {
  return db.captcha || (db.captcha = {})
}

export function loadDB() {
  if (!fs.existsSync(path)) {
    fs.writeFileSync(path, JSON.stringify({ users: {}, settings: {} }, null, 2))
  }
  return JSON.parse(fs.readFileSync(path))
}

export function saveDB(db) {
  fs.writeFileSync(path, JSON.stringify(db, null, 2))
}
