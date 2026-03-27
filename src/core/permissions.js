// File: src/core/permissions.js
import config from "../../config.js"

export function isOwner(sender) {
  return sender.includes(config.owner)
}