import { NextResponse } from "next/server"
import crypto from "node:crypto"
import fs from "node:fs"
import path from "node:path"
import { Pool, neonConfig } from "@neondatabase/serverless"

export const runtime = "nodejs"

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex")
  const hash = crypto.scryptSync(password, salt, 64).toString("hex")
  return `scrypt$${salt}$${hash}`
}

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
    const username = String(body.username || "").trim()
    const firstName = String(body.firstName || "").trim()
    const middleName = String(body.middleName || "").trim()
    const lastName = String(body.lastName || "").trim()
    const email = String(body.email || "").trim().toLowerCase()
    const phoneNumber = String(body.phoneNumber || "").trim()
    const password = String(body.password || "")
    const hasAcceptedTerms = Boolean(body.hasAcceptedTerms)
    const hasAcceptedHostTerms = Boolean(body.hasAcceptedHostTerms)

    if (!username || !firstName || !lastName || !email || !phoneNumber || !password) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 })
    }
    if (!hasAcceptedTerms) {
      return NextResponse.json({ error: "Terms must be accepted." }, { status: 400 })
    }

    const existing = await pool.query(
      `select id from "user" where email = $1 or "phoneNumber" = $2 or username = $3 limit 1`,
      [email, phoneNumber, username]
    )

    if (existing.rowCount && existing.rowCount > 0) {
      return NextResponse.json({ error: "User already exists." }, { status: 409 })
    }

    const result = await pool.query(
      `insert into "user"
      (username, "firstName", "middleName", "lastName", "phoneNumber", "email", "password", "hasAcceptedTerms", "hasAcceptedHostTerms")
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      returning id`,
      [
        username,
        firstName,
        middleName || null,
        lastName,
        phoneNumber,
        email,
        hashPassword(password),
        hasAcceptedTerms,
        hasAcceptedHostTerms,
      ]
    )

    return NextResponse.json({ ok: true, userId: result.rows[0]?.id })
  } catch (error) {
    console.error("Create user error:", error)
    return NextResponse.json({ error: "Unable to create user." }, { status: 500 })
  } finally {
    await pool.end()
  }
}
