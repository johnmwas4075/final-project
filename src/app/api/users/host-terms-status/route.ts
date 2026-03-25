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

    const result = await pool.query(
      `select "hasAcceptedHostTerms" from "user" where id = $1 limit 1`,
      [userId]
    )

    if (!result.rowCount || result.rowCount === 0) {
      return NextResponse.json({ error: "User not found." }, { status: 404 })
    }

    return NextResponse.json({
      ok: true,
      hasAcceptedHostTerms: Boolean(result.rows[0]?.hasAcceptedHostTerms),
    })
  } catch (error) {
    console.error("Host terms status error:", error)
    return NextResponse.json({ error: "Unable to check host terms." }, { status: 500 })
  } finally {
    await pool.end()
  }
}
