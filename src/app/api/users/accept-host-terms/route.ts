import { NextResponse } from "next/server"
import { Pool, neonConfig } from "@neondatabase/serverless"
import { getDatabaseUrl } from "@/lib/database-url"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const databaseUrl = getDatabaseUrl()
  if (!databaseUrl) {
    return NextResponse.json(
      { error: "Database not configured. Set DATABASE_URL." },
      { status: 500 }
    )
  }

  try {
    neonConfig.webSocketConstructor = require("ws")
  } catch (error) {
    if (typeof WebSocket !== "undefined") {
      neonConfig.webSocketConstructor = WebSocket
    }
  }

  const pool = new Pool({ connectionString: databaseUrl })

  try {
    const body = await request.json()
    const userId = String(body.userId || "").trim()
    if (!userId) {
      return NextResponse.json({ error: "User ID is required." }, { status: 400 })
    }

    await pool.query(
      `update "user" set "hasAcceptedHostTerms" = true, "updatedAt" = now() where id = $1`,
      [userId]
    )

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Accept host terms error:", error)
    return NextResponse.json({ error: "Unable to accept terms." }, { status: 500 })
  } finally {
    await pool.end()
  }
}

