// File: src/core/router.js

import config from "../../config.js"
import { handleTools } from "../menu/tools.js"
import { handleOwner } from "../menu/owner.js"
import { handleMain } from "../menu/main.js"

const spam = new Map()

export async function router(ctx) {
  try {
    const { sender, text } = ctx

    if (!text) return

    // ===============================
    // 🚫 ANTI SPAM
    // ===============================
    const now = Date.now()

    if (!spam.has(sender)) spam.set(sender, [])
    const logs = spam.get(sender).filter(t => now - t < 10000)

    if (logs.length >= 3) {
      return ctx.sock.sendMessage(sender, { text: "🚫 Jangan spam!" })
    }

    logs.push(now)
    spam.set(sender, logs)

    // ===============================
    // 🤖 NON COMMAND (AI / AUTO REPLY)
    // ===============================
    if (!text.startsWith(config.prefix)) {
      return handleMain(ctx)
    }

    // ===============================
    // 📌 COMMAND PARSE
    // ===============================
    const args = text.slice(config.prefix.length).trim().split(/ +/)
    const cmd = args.shift().toLowerCase()

    // ===============================
    // 🛠 TOOLS
    // ===============================
    if (["ytmp3", "ytmp4", "tiktok", "stiker"].includes(cmd)) {
      return handleTools(ctx, cmd, args)
    }

    // ===============================
    // 👑 OWNER
    // ===============================
    if (["broadcast"].includes(cmd)) {
      return handleOwner(ctx, cmd, args)
    }

  } catch (err) {
    console.log("❌ Router error:", err.message)
  }
}