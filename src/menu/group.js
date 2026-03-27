export async function handleGroup(ctx) {
  return ctx.sock.sendMessage(ctx.sender, { text: "Fitur group aktif" })
}