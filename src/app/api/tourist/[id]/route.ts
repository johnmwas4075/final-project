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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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
      'select id, slug, name, description, "countyName", location, "bestSeason", "crowdLevel", "crowdDetail", "weatherByMonth", budget, experiences from tourist_destinations where slug = $1 or id = $1 limit 1',
      [id]
    )

    if (!result.rowCount) {
      return NextResponse.json({ destination: null }, { status: 404 })
    }

    const destination = result.rows[0]
    const imagesRes = await pool.query(
      'select id, url, "publicId" from tourist_images where "destinationId" = $1 order by "createdAt" asc',
      [destination.id]
    )

    return NextResponse.json({
      destination: {
        ...destination,
        images: imagesRes.rows,
      },
    })
  } catch (error) {
    console.error("Tourist fetch error:", error)
    return NextResponse.json({ error: "Unable to load destination" }, { status: 500 })
  } finally {
    await pool.end()
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const databaseUrl = getDatabaseUrl()
  if (!databaseUrl) {
    return NextResponse.json({ error: "Database not configured." }, { status: 500 })
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  try {
    neonConfig.webSocketConstructor = require("ws")
  } catch {
    // ignore
  }

  const pool = new Pool({ connectionString: databaseUrl })
  try {
    const result = await pool.query(
      'update tourist_destinations set name = coalesce($2, name), description = coalesce($3, description), "countyName" = coalesce($4, "countyName"), location = coalesce($5, location), "bestSeason" = coalesce($6, "bestSeason"), "crowdLevel" = coalesce($7, "crowdLevel"), "crowdDetail" = coalesce($8, "crowdDetail"), "weatherByMonth" = coalesce($9, "weatherByMonth"), budget = coalesce($10, budget), experiences = coalesce($11, experiences) where id = $1 or slug = $1 returning id, slug',
      [
        id,
        body.name ?? null,
        body.description ?? null,
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

    if (!result.rowCount) {
      return NextResponse.json({ error: "Destination not found" }, { status: 404 })
    }

    return NextResponse.json({ destination: result.rows[0] })
  } catch (error) {
    console.error("Tourist update error:", error)
    return NextResponse.json({ error: "Unable to update destination" }, { status: 500 })
  } finally {
    await pool.end()
  }
}
