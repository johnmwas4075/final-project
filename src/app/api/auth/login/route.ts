import { NextResponse } from "next/server"
import crypto from "node:crypto"
import { Pool, neonConfig } from "@neondatabase/serverless"
import { getDatabaseUrl } from "@/lib/database-url"

export const runtime = "nodejs"

function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split("$")
  if (parts.length !== 3 || parts[0] !== "scrypt") return false
  const salt = parts[1]
  const hash = parts[2]
  const derived = crypto.scryptSync(password, salt, 64).toString("hex")
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(derived, "hex"))
}

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
    const email = String(body.email || "").trim().toLowerCase()
    const password = String(body.password || "")

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 })
    }

    const result = await pool.query(
      `select id, password, username, "firstName", "phoneNumber" from "user" where email = $1 limit 1`,
      [email]
    )

    if (!result.rowCount || result.rowCount === 0) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 })
    }

    const user = result.rows[0]
    const isValid = verifyPassword(password, user.password)
    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 })
    }

    return NextResponse.json({
      ok: true,
      userId: user.id,
      username: user.username,
      firstName: user.firstName,
      phoneNumber: user.phoneNumber,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Unable to log in." }, { status: 500 })
  } finally {
    await pool.end()
  }
}

