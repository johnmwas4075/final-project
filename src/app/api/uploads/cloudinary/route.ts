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
    const folder = process.env.CLOUDINARY_FOLDER || "dwellify"

    const result = await new Promise<cloudinary.UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: "image", type: "authenticated", folder },
        (error, res) => {
          if (error || !res) {
            reject(error || new Error("Upload failed"))
            return
          }
          resolve(res)
        }
      )
      stream.end(buffer)
    })

    const url = cloudinary.url(result.public_id, {
      type: "authenticated",
      secure: true,
      sign_url: true,
      format: result.format,
    })

    return NextResponse.json({ url, publicId: result.public_id })
  } catch (error) {
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 })
  }
}
