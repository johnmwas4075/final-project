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

export async function GET(request: Request) {
  const databaseUrl = getDatabaseUrl()
  if (!databaseUrl) {
    return NextResponse.json({ error: "Database not configured. Set DATABASE_URL." }, { status: 500 })
  }

  try {
    neonConfig.webSocketConstructor = require("ws")
  } catch {
    // ignore
  }
  const pool = new Pool({ connectionString: databaseUrl })

  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const role = searchParams.get("role")
    if (!userId || !role) {
      return NextResponse.json({ error: "userId and role are required" }, { status: 400 })
    }

    const result = await pool.query(
      'select id, "userId", role, category, title, message, "createdAt", "readAt", "bookingId", "propertyId" from notifications where "userId" = $1 and role = $2 order by "createdAt" desc',
      [userId, role]
    )

    return NextResponse.json({ notifications: result.rows })
  } catch (error) {
    console.error("Notifications GET error:", error)
    return NextResponse.json({ error: "Unable to load notifications", notifications: [] }, { status: 500 })
  } finally {
    await pool.end()
  }
}

export async function PATCH(request: Request) {
  const databaseUrl = getDatabaseUrl()
  if (!databaseUrl) {
    return NextResponse.json({ error: "Database not configured. Set DATABASE_URL." }, { status: 500 })
  }

  try {
    neonConfig.webSocketConstructor = require("ws")
  } catch {
    // ignore
  }
  const pool = new Pool({ connectionString: databaseUrl })

  try {
    const body = await request.json().catch(() => null)
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    }

    const id = typeof body.id === "string" ? body.id : ""
    const userId = typeof body.userId === "string" ? body.userId : ""
    if (!id || !userId) {
      return NextResponse.json({ error: "id and userId are required" }, { status: 400 })
    }

    const result = await pool.query(
      'update notifications set "readAt" = now() where id = $1 and "userId" = $2 returning id, "userId", role, category, title, message, "createdAt", "readAt", "bookingId", "propertyId"',
      [id, userId]
    )

    return NextResponse.json({ notification: result.rows[0] || null })
  } catch (error) {
    console.error("Notifications PATCH error:", error)
    return NextResponse.json({ error: "Unable to update notification" }, { status: 500 })
  } finally {
    await pool.end()
  }
}
