// File: src/menu/main.js
import { reply } from "../lib/message.js"

export async function handleMain(ctx) {
  const text = ctx.text.toLowerCase()

  if (text.includes("halo")) return reply(ctx, "Halo 👋")
  if (text.includes("menu")) {
    return reply(ctx, `
📌 MENU BOT

🎥 .ytmp3 link
🎥 .ytmp4 link
🎵 .tiktok link
🖼 .stiker (reply media)
`)
  }

  return reply(ctx, "🤖 Ketik .menu")
}