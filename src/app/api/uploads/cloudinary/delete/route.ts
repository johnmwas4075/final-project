import { NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"

export const runtime = "nodejs"

const cloudinaryUrl = process.env.CLOUDINARY_URL || process.env.CLOUDINARY_VARIABLE

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  cloudinary_url: cloudinaryUrl,
})

export async function POST(req: Request) {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env
  if (!cloudinaryUrl && (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET)) {
    return NextResponse.json({ error: "Cloudinary env vars not set" }, { status: 500 })
  }

  let body: { publicId?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const publicId = body.publicId?.trim()
  if (!publicId) {
    return NextResponse.json({ error: "publicId is required" }, { status: 400 })
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: "image", type: "authenticated" })
    if (result?.result !== "ok" && result?.result !== "not found") {
      return NextResponse.json({ error: "Delete failed" }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 })
  }
}
