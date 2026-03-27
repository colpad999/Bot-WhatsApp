// File: index.js

import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} from "@whiskeysockets/baileys"

import pino from "pino"
import qrcode from "qrcode-terminal"
import dotenv from "dotenv"

import { router } from "./src/core/router.js"
import { createContext } from "./src/core/context.js"

dotenv.config()

let reconnectDelay = 3000

async function startBot() {
  try {
    const { state, saveCreds } = await useMultiFileAuthState("./session")
    const { version } = await fetchLatestBaileysVersion()

    const sock = makeWASocket({
      version,
      auth: state,
      logger: pino({ level: "silent" }),
      printQRInTerminal: false,
      browser: ["Colpad Bot Stable", "Chrome", "1.0.0"]
    })

    // ===============================
    // CONNECTION
    // ===============================
    sock.ev.on("connection.update", async (update) => {
      try {
        const { connection, lastDisconnect, qr } = update

        if (qr) {
          console.log("📱 Scan QR ini:")
          qrcode.generate(qr, { small: true })
        }

        if (connection === "open") {
          console.log("✅ BOT CONNECTED")
          reconnectDelay = 3000
        }

        if (connection === "close") {
          const statusCode = lastDisconnect?.error?.output?.statusCode

          console.log("❌ CONNECTION CLOSED:", statusCode)

          // logout → wajib scan ulang
          if (statusCode === DisconnectReason.loggedOut) {
            console.log("🚫 SESSION EXPIRED! Hapus folder session.")
            return
          }

          console.log(`🔄 Reconnect ${reconnectDelay / 1000}s...`)
          setTimeout(() => {
            reconnectDelay *= 2
            if (reconnectDelay > 60000) reconnectDelay = 60000
            startBot()
          }, reconnectDelay)
        }

      } catch (err) {
        console.log("❌ Conn handler error:", err.message)
      }
    })

    // ===============================
    // SAVE SESSION
    // ===============================
    sock.ev.on("creds.update", saveCreds)

    // ===============================
    // MESSAGE HANDLER
    // ===============================
    sock.ev.on("messages.upsert", async ({ messages }) => {
      try {
        const msg = messages[0]
        if (!msg.message) return
        if (msg.key.fromMe) return

        const ctx = createContext(sock, msg)
        await router(ctx)

      } catch (err) {
        console.log("❌ Message error:", err.message)
      }
    })

    // ===============================
    // ERROR PROTECTION
    // ===============================
    process.on("uncaughtException", (err) => {
      console.log("❌ Uncaught:", err.message)
    })

    process.on("unhandledRejection", (err) => {
      console.log("❌ Rejection:", err)
    })

  } catch (err) {
    console.log("❌ START ERROR:", err.message)

    setTimeout(() => {
      reconnectDelay *= 2
      if (reconnectDelay > 60000) reconnectDelay = 60000
      startBot()
    }, reconnectDelay)
  }
}

// START
startBot()