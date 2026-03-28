// File: src/core/router.js

import config from "../../config.js"

// menu
import { handleMain } from "../menu/main.js"
import { handleTools } from "../menu/tools.js"
import { handleGroup, groupProtector } from "../menu/group.js"
import { handleGame } from "../menu/game.js"

export async function router(ctx) {
  try {
    const { text } = ctx

    // ===============================
    // 🔥 PROTECTOR (AUTO RUN)
    // ===============================
    await groupProtector(ctx)

    // ===============================
    // 📌 VALIDASI TEXT
    // ===============================
    if (!text) return

    const prefix = config.prefix || "."
    if (!text.startsWith(prefix)) {
      return handleMain(ctx)
    }

    // ===============================
    // ✂️ PARSE COMMAND
    // ===============================
    const body = text.slice(prefix.length).trim()
    const args = body.split(" ")
    const cmd = args.shift().toLowerCase()

    // ===============================
    // 🎮 GAME
    // ===============================
    if ([
      "tebak",
      "slot",
      "daily",
      "profile",
      "rank"
    ].includes(cmd)) {
      return handleGame(ctx, cmd, args)
    }

    // ===============================
    // 🛠 TOOLS
    // ===============================
    if ([
      "ytmp4",
      "ytmp3",
      "tiktok",
      "stiker"
    ].includes(cmd)) {
      return handleTools(ctx, cmd, args)
    }

    // ===============================
    // 👥 GROUP
    // ===============================
    if ([
      "kick",
      "add",
      "promote",
      "demote",
      "open",
      "close",
      "tagall",
      "hidetag",
      "antilink",
      "antispam",
      "badword",
      "welcome"
    ].includes(cmd)) {
      return handleGroup(ctx, cmd, args)
    }

    // ===============================
    // ❓ UNKNOWN COMMAND
    // ===============================
    return ctx.sock.sendMessage(ctx.sender, {
      text: "❌ Command tidak dikenal"
    })

  } catch (err) {
    console.error("Router Error:", err)
  }
}
