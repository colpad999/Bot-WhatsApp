// File: src/utils/utils.js

import ytdl from "ytdl-core"
import axios from "axios"
import sharp from "sharp"

// ===============================
// YOUTUBE
// ===============================
export async function downloadYT(url, type) {
  if (!ytdl.validateURL(url)) {
    throw new Error("Link tidak valid")
  }

  const info = await ytdl.getInfo(url)

  const format = ytdl.chooseFormat(info.formats, {
    quality: type === "mp3" ? "highestaudio" : "highestvideo"
  })

  const stream = ytdl(url, { format })

  return stream
}

// ===============================
// TIKTOK
// ===============================
export async function tiktokNoWM(url) {
  const api = `https://tikwm.com/api/?url=${encodeURIComponent(url)}`
  const res = await axios.get(api)

  if (!res.data?.data?.play) {
    throw new Error("Gagal ambil video")
  }

  return res.data.data.play
}

// ===============================
// 🧾 ADD EXIF STICKER (PACKNAME)
// ===============================
export function addExif(webpBuffer, packname, author) {
  const exifAttr = {
    "sticker-pack-id": "colpad-bot",
    "sticker-pack-name": packname,
    "sticker-pack-publisher": author
  }

  const json = JSON.stringify(exifAttr)
  const exif = Buffer.concat([
    Buffer.from([0x49, 0x49, 0x2A, 0x00]),
    Buffer.from([0x08, 0x00, 0x00, 0x00]),
    Buffer.from([0x01, 0x00]),
    Buffer.from([0x41, 0x57]),
    Buffer.from([0x07, 0x00]),
    Buffer.from([json.length, 0x00, 0x00, 0x00]),
    Buffer.from([0x16, 0x00, 0x00, 0x00]),
    Buffer.from(json)
  ])

  const newBuffer = Buffer.concat([
    webpBuffer.slice(0, 12),
    Buffer.from("EXIF"),
    exif,
    webpBuffer.slice(12)
  ])

  return newBuffer
}

// DEBUG (WAJIB ADA)
console.log("✅ utils.js loaded OK")