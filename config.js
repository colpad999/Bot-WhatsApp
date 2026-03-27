// File: config.js
import dotenv from "dotenv"
dotenv.config()

export default {
  prefix: ".",
  owner: process.env.OWNER_NUMBER || "6285194593615"
}