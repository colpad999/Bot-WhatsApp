// File: src/core/context.js

export function createContext(sock, msg) {
  const sender = msg.key.remoteJid

  const text =
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    ""

  return {
    sock,
    msg,
    sender,
    text
  }
}