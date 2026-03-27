// File: src/lib/message.js

export async function reply(ctx, text) {
  return ctx.sock.sendMessage(
    ctx.sender,
    { text },
    { quoted: ctx.msg }
  )
}