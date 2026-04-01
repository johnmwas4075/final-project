import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function POST(req: Request) {
  const apiKey = process.env.IMGBB_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "IMGBB_API_KEY not set" }, { status: 500 })
  }

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 })
  }

  const file = form.get("image")
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "Image is required" }, { status: 400 })
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const base64 = buffer.toString("base64")
    const payload = new FormData()
    payload.append("image", base64)

    const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: "POST",
      body: payload,
    })

    if (!res.ok) {
      const text = await res.text().catch(() => "")
      return NextResponse.json({ error: `ImageBB error: ${res.status} ${text}` }, { status: 500 })
    }

    const data = await res.json()
    const url = data?.data?.url
    const deleteUrl = data?.data?.delete_url
    if (!url) {
      return NextResponse.json({ error: "ImageBB did not return a URL" }, { status: 500 })
    }

    return NextResponse.json({ url, deleteUrl })
  } catch (error) {
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 })
  }
}
