import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function POST(req: Request) {
  const apiKey = process.env.IMGBB_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "IMGBB_API_KEY not set" }, { status: 500 })
  }

  let body: { deleteUrl?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const deleteUrl = body.deleteUrl?.trim()
  if (!deleteUrl) {
    return NextResponse.json({ error: "deleteUrl is required" }, { status: 400 })
  }

  try {
    const res = await fetch(deleteUrl, { method: "GET" })
    if (!res.ok) {
      const text = await res.text().catch(() => "")
      return NextResponse.json({ error: `ImageBB delete failed: ${res.status} ${text}` }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 })
  }
}
