// File: src/menu/group.js

import { reply } from "../lib/message.js"
import { getGroup, saveDB, getCaptcha } from "../core/database.js"

const spam = new Map()
const badwords = ["anjing", "kontol", "memek"]
const linkRegex = /(https?:\/\/|wa\.me|chat\.whatsapp\.com)/i

export async function groupProtector(ctx) {
  try {
    const { sock, msg, sender, text } = ctx
    const jid = msg.key.remoteJid

    if (!jid.endsWith("@g.us")) return

    const metadata = await sock.groupMetadata(jid)
    const participants = metadata.participants

    const isAdmin = participants.find(v => v.id === sender && v.admin)
    const isOwner = sender.includes(process.env.OWNER_NUMBER)

    const group = getGroup(jid)

    // 🛡 WHITELIST
    if (isAdmin || isOwner) return

    // ===============================
    // 🚫 SMART ANTI LINK
    // ===============================
    if (group.antiLink && linkRegex.test(text)) {
      await sock.sendMessage(jid, {
        text: `🚫 Link detected @${sender.split("@")[0]}`,
        mentions: [sender]
      })

      setTimeout(async () => {
        await sock.groupParticipantsUpdate(jid, [sender], "remove")
      }, 2000)
    }

    // ===============================
    // 🔞 BADWORD
    // ===============================
    if (group.badword) {
      for (let word of badwords) {
        if (text.toLowerCase().includes(word)) {
          await sock.groupParticipantsUpdate(jid, [sender], "remove")
        }
      }
    }

    // ===============================
    // 🧠 ANTI SPAM SUPER
    // ===============================
    if (group.antiSpam) {
      const now = Date.now()

      if (!spam.has(sender)) spam.set(sender, [])
      const logs = spam.get(sender).filter(t => now - t < 4000)

      if (logs.length >= 4) {
        await sock.groupParticipantsUpdate(jid, [sender], "remove")
      }

      logs.push(now)
      spam.set(sender, logs)
    }

  } catch (err) {
    console.log("Protector:", err.message)
  }
}

// ===============================
// 🔢 CAPTCHA SYSTEM
// ===============================
export async function handleCaptcha(sock, id, user) {
  const captcha = getCaptcha()

  const a = Math.floor(Math.random() * 10)
  const b = Math.floor(Math.random() * 10)

  captcha[user] = a + b

  await sock.sendMessage(id, {
    text: `🔢 CAPTCHA untuk @${user.split("@")[0]}\n\n${a} + ${b} = ? (reply dalam 30 detik)`,
    mentions: [user]
  })

  setTimeout(async () => {
    if (captcha[user]) {
      delete captcha[user]
      await sock.groupParticipantsUpdate(id, [user], "remove")
    }
  }, 30000)
}

// ===============================
// 🔢 VALIDASI CAPTCHA
// ===============================
export function checkCaptcha(ctx) {
  const captcha = getCaptcha()
  const { sender, text } = ctx

  if (captcha[sender]) {
    if (parseInt(text) === captcha[sender]) {
      delete captcha[sender]
      ctx.sock.sendMessage(ctx.msg.key.remoteJid, {
        text: `✅ Verifikasi berhasil`
      })
    } else {
      ctx.sock.sendMessage(ctx.msg.key.remoteJid, {
        text: `❌ Salah!`
      })
    }
  }
}
