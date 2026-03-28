// File: src/menu/group.js

import { reply } from "../lib/message.js"
import { getGroup, saveDB } from "../core/database.js"

const spam = new Map()
const badwords = ["anjing", "kontol", "memek"]

export async function handleGroup(ctx, cmd, args) {
  try {
    const { sock, msg, sender, text } = ctx
    const jid = msg.key.remoteJid

    if (!jid.endsWith("@g.us")) {
      return reply(ctx, "❌ Khusus grup!")
    }

    const metadata = await sock.groupMetadata(jid)
    const participants = metadata.participants

    const isAdmin = participants.find(v => v.id === sender && v.admin)

    if (!isAdmin) return reply(ctx, "❌ Admin only!")

    const group = getGroup(jid)

    // ===============================
    // ⚙️ TOGGLE FITUR
    // ===============================
    if (cmd === "antilink") {
      group.antiLink = args[0] === "on"
      saveDB()
      return reply(ctx, `AntiLink: ${group.antiLink}`)
    }

    if (cmd === "antispam") {
      group.antiSpam = args[0] === "on"
      saveDB()
      return reply(ctx, `AntiSpam: ${group.antiSpam}`)
    }

    if (cmd === "badword") {
      group.badword = args[0] === "on"
      saveDB()
      return reply(ctx, `Badword: ${group.badword}`)
    }

    if (cmd === "welcome") {
      group.welcome = args[0] === "on"
      saveDB()
      return reply(ctx, `Welcome: ${group.welcome}`)
    }

    // ===============================
    // 👥 KICK
    // ===============================
    if (cmd === "kick") {
      const target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid
      if (!target) return reply(ctx, "Tag user!")

      await sock.groupParticipantsUpdate(jid, target, "remove")
      return reply(ctx, "✅ Kick berhasil")
    }

    // ===============================
    // ➕ ADD
    // ===============================
    if (cmd === "add") {
      if (!args[0]) return reply(ctx, "Masukkan nomor!")

      const number = args[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net"

      await sock.groupParticipantsUpdate(jid, [number], "add")
      return reply(ctx, "✅ Berhasil tambah")
    }

    // ===============================
    // ⬆️ PROMOTE
    // ===============================
    if (cmd === "promote") {
      const target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid
      if (!target) return reply(ctx, "Tag user!")

      await sock.groupParticipantsUpdate(jid, target, "promote")
      return reply(ctx, "✅ Jadi admin")
    }

    // ===============================
    // ⬇️ DEMOTE
    // ===============================
    if (cmd === "demote") {
      const target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid
      if (!target) return reply(ctx, "Tag user!")

      await sock.groupParticipantsUpdate(jid, target, "demote")
      return reply(ctx, "✅ Turun admin")
    }

    // ===============================
    // 🔓 OPEN
    // ===============================
    if (cmd === "open") {
      await sock.groupSettingUpdate(jid, "not_announcement")
      return reply(ctx, "✅ Grup dibuka")
    }

    // ===============================
    // 🔒 CLOSE
    // ===============================
    if (cmd === "close") {
      await sock.groupSettingUpdate(jid, "announcement")
      return reply(ctx, "✅ Grup ditutup")
    }

    // ===============================
    // 📢 TAG ALL
    // ===============================
    if (cmd === "tagall") {
      let teks = "📢 Tag All:\n\n"
      const mentions = participants.map(v => v.id)

      participants.forEach((v, i) => {
        teks += `${i + 1}. @${v.id.split("@")[0]}\n`
      })

      await sock.sendMessage(jid, { text: teks, mentions })
    }

    // ===============================
    // 👻 HIDETAG
    // ===============================
    if (cmd === "hidetag") {
      const teks = args.join(" ") || "👻"
      const mentions = participants.map(v => v.id)

      await sock.sendMessage(jid, { text: teks, mentions })
    }

  } catch (err) {
    return reply(ctx, "❌ Error: " + err.message)
  }
}

// ===============================
// 🔥 PROTEKSI AUTO
// ===============================
export async function groupProtector(ctx) {
  try {
    const { sock, msg, sender, text } = ctx
    const jid = msg.key.remoteJid

    if (!jid.endsWith("@g.us")) return

    const metadata = await sock.groupMetadata(jid)
    const participants = metadata.participants

    const isAdmin = participants.find(v => v.id === sender && v.admin)
    if (isAdmin) return

    const group = getGroup(jid)

    // 🚫 ANTI LINK
    if (group.antiLink && text.includes("http")) {
      await sock.groupParticipantsUpdate(jid, [sender], "remove")
    }

    // 🔞 BADWORD
    if (group.badword) {
      for (let word of badwords) {
        if (text.toLowerCase().includes(word)) {
          await sock.groupParticipantsUpdate(jid, [sender], "remove")
        }
      }
    }

    // 🧠 ANTI SPAM
    if (group.antiSpam) {
      const now = Date.now()

      if (!spam.has(sender)) spam.set(sender, [])
      const logs = spam.get(sender).filter(t => now - t < 5000)

      if (logs.length >= 5) {
        await sock.groupParticipantsUpdate(jid, [sender], "remove")
      }

      logs.push(now)
      spam.set(sender, logs)
    }

  } catch (err) {
    console.log("Protector error:", err.message)
  }
}
