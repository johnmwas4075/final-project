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

export async function GET() {
  const databaseUrl = getDatabaseUrl()
  if (!databaseUrl) {
    return NextResponse.json({ error: "Database not configured." }, { status: 500 })
  }

  try {
    neonConfig.webSocketConstructor = require("ws")
  } catch {
    // ignore
  }

  const pool = new Pool({ connectionString: databaseUrl })
  try {
    const result = await pool.query(
      'select id, slug, name, description, "countyName", location, "crowdLevel", "crowdDetail" from tourist_destinations order by "createdAt" desc'
    )
    return NextResponse.json({ destinations: result.rows })
  } catch (error) {
    console.error("Tourist list error:", error)
    return NextResponse.json({ destinations: [], error: "Unable to load destinations" }, { status: 500 })
  } finally {
    await pool.end()
  }
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

  const slug = String(body.slug || "").trim()
  const name = String(body.name || "").trim()
  const description = String(body.description || "").trim()
  if (!slug || !name || !description) {
    return NextResponse.json({ error: "slug, name, and description are required" }, { status: 400 })
  }

  try {
    neonConfig.webSocketConstructor = require("ws")
  } catch {
    // ignore
  }

  const pool = new Pool({ connectionString: databaseUrl })
  try {
    const result = await pool.query(
      'insert into tourist_destinations (slug, name, description, "countyName", location, "bestSeason", "crowdLevel", "crowdDetail", "weatherByMonth", budget, experiences) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) returning id, slug',
      [
        slug,
        name,
        description,
        body.countyName ?? null,
        body.location ?? null,
        body.bestSeason ?? null,
        body.crowdLevel ?? null,
        body.crowdDetail ?? null,
        body.weatherByMonth ?? null,
        body.budget ?? null,
        body.experiences ?? null,
      ]
    )
    return NextResponse.json({ destination: result.rows[0] })
  } catch (error) {
    console.error("Tourist create error:", error)
    return NextResponse.json({ error: "Unable to create destination" }, { status: 500 })
  } finally {
    await pool.end()
  }
}
