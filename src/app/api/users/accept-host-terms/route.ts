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
