// File: src/menu/owner.js
import { reply } from "../lib/message.js"
import { isOwner } from "../core/permissions.js"

export async function handleOwner(ctx, cmd) {
  if (!isOwner(ctx.sender)) return reply(ctx, "❌ Owner only")

  if (cmd === "broadcast") {
    return reply(ctx, "📢 Broadcast ready (extend sendiri)")
  }
}