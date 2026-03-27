import { reply } from "../lib/message.js"
import config from "../../config.js"
import { downloadContentFromMessage } from "@whiskeysockets/baileys"
import * as utils from "../utils/utils.js"

export async function handleTools(ctx, cmd, args) {
  try {
    const url = args[0]

    if (cmd === "ytmp4") {
      const file = await utils.downloadYT(url, "mp4")
      return ctx.sock.sendMessage(ctx.sender, {
        video: { url: file }
      })
    }

    if (cmd === "tiktok") {
      const video = await utils.tiktokNoWM(url)
      return ctx.sock.sendMessage(ctx.sender, {
        video: { url: video }
      })
    }

    if (cmd === "stiker") {
      const quoted =
        ctx.msg.message?.extendedTextMessage?.contextInfo?.quotedMessage

      if (!quoted) return reply(ctx, "Reply gambar!")

      const type = Object.keys(quoted)[0]

      const stream = await downloadContentFromMessage(
        quoted[type],
        "image"
      )

      let buffer = Buffer.from([])
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk])
      }

      let sticker = await utils.toSticker(buffer)

      sticker = utils.addExif(
        sticker,
        config.botName,
        config.ownerName
      )

      await ctx.sock.sendMessage(ctx.sender, {
        sticker: sticker
      })
    }

  } catch (e) {
    return reply(ctx, "❌ Error: " + e.message)
  }
}
