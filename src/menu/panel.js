export async function handlePanel(ctx) {
  return ctx.sock.sendMessage(ctx.sender, { text: "Panel bot aktif" })
}