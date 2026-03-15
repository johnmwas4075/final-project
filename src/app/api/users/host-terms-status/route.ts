import { NextResponse } from "next/server"
import fs from "node:fs"
import path from "node:path"
import { Pool, neonConfig } from "@neondatabase/serverless"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const envPath = path.resolve(process.cwd(), ".env.local")
  const envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : ""
  const match = envContent.match(/^\s*DATABASE_URL\s*=\s*(.+)\s*$/m)
  const databaseUrl = match ? match[1].trim().replace(/^['"]|['"]$/g, "") : ""
  if (!databaseUrl) {
    return NextResponse.json(
      { error: "Database not configured. Set DATABASE_URL in .env.local." },
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
