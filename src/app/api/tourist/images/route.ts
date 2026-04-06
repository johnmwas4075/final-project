import { NextResponse } from "next/server"
import fs from "node:fs"
import path from "node:path"
import { Pool, neonConfig } from "@neondatabase/serverless"

export const runtime = "nodejs"

const getDatabaseUrl = () => {
  const envLocal = path.resolve(process.cwd(), ".env.local")
  const envDefault = path.resolve(process.cwd(), ".env")
  const read = (filePath: string) => {
    if (!fs.existsSync(filePath)) return ""
    const content = fs.readFileSync(filePath, "utf8")
    const match = content.match(/^\s*DATABASE_URL\s*=\s*(.+)\s*$/m)
    return match ? match[1].trim().replace(/^['"]|['"]$/g, "") : ""
  }
  return read(envLocal) || read(envDefault) || String(process.env.DATABASE_URL || "").trim()
}

export async function POST(request: Request) {
  const databaseUrl = getDatabaseUrl()
  if (!databaseUrl) {
    return NextResponse.json({ error: "Database not configured." }, { status: 500 })
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const destinationId = String(body.destinationId || "").trim()
  const destinationSlug = String(body.destinationSlug || "").trim()
  const url = String(body.url || "").trim()
  const publicId = body.publicId ? String(body.publicId) : null

  if (!url || (!destinationId && !destinationSlug)) {
    return NextResponse.json({ error: "destinationId or destinationSlug and url are required" }, { status: 400 })
  }

  try {
    neonConfig.webSocketConstructor = require("ws")
  } catch {
    // ignore
  }

  const pool = new Pool({ connectionString: databaseUrl })
  try {
    let resolvedId = destinationId
    if (!resolvedId && destinationSlug) {
      const lookup = await pool.query(
        'select id from tourist_destinations where slug = $1 limit 1',
        [destinationSlug]
      )
      if (!lookup.rowCount) {
        return NextResponse.json({ error: "Destination not found" }, { status: 404 })
      }
      resolvedId = lookup.rows[0].id
    }

    const result = await pool.query(
      'insert into tourist_images ("destinationId", url, "publicId") values ($1,$2,$3) returning id, url, "publicId"',
      [resolvedId, url, publicId]
    )

    return NextResponse.json({ image: result.rows[0] })
  } catch (error) {
    console.error("Tourist image error:", error)
    return NextResponse.json({ error: "Unable to save image" }, { status: 500 })
  } finally {
    await pool.end()
  }
}
