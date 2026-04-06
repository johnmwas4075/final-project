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

const formatLocation = (county?: string | null, constituency?: string | null, ward?: string | null) =>
  [county, constituency, ward].filter(Boolean).join(", ")

export async function GET(request: Request) {
  const databaseUrl = getDatabaseUrl()
  if (!databaseUrl) {
    return NextResponse.json({ error: "Database not configured." }, { status: 500 })
  }

  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")
  const itemType = searchParams.get("itemType")
  const itemId = searchParams.get("itemId")
  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 })
  }

  try {
    neonConfig.webSocketConstructor = require("ws")
  } catch {
    // ignore
  }

  const pool = new Pool({ connectionString: databaseUrl })
  try {
    if (itemType && itemId) {
      const exists = await pool.query(
        'select 1 from favorites where "userId" = $1 and "itemType" = $2 and "itemId" = $3 limit 1',
        [userId, itemType, itemId]
      )
      return NextResponse.json({ isFavorite: exists.rowCount > 0 })
    }

    const favsRes = await pool.query(
      'select "itemType", "itemId" from favorites where "userId" = $1 order by "createdAt" desc',
      [userId]
    )

    const favorites = favsRes.rows as Array<{ itemType: string; itemId: string }>
    const propertyIds = favorites.filter((f) => f.itemType === "property").map((f) => f.itemId)
    const touristSlugs = favorites.filter((f) => f.itemType === "tourist").map((f) => f.itemId)

    let properties: any[] = []
    let destinations: any[] = []

    if (propertyIds.length > 0) {
      const res = await pool.query(
        'select id, "propertyName", price, photos, "countyName", "constituencyName", "wardName" from "Property" where id = any($1)',
        [propertyIds]
      )
      properties = res.rows.map((row: any) => ({
        id: row.id,
        name: row.propertyName ?? "Property",
        price: row.price ? `$${row.price}/night` : "Price varies",
        location: formatLocation(row.countyName, row.constituencyName, row.wardName),
        image: Array.isArray(row.photos) && row.photos.length > 0 ? row.photos[0] : "/images/property.jpg",
      }))
    }

    if (touristSlugs.length > 0) {
      const res = await pool.query(
        'select d.slug, d.name, d.location, d."countyName", img.url as image from tourist_destinations d left join lateral (select url from tourist_images where "destinationId" = d.id order by "createdAt" asc limit 1) img on true where d.slug = any($1)',
        [touristSlugs]
      )
      destinations = res.rows.map((row: any) => ({
        id: row.slug,
        name: row.name,
        location: row.location || row.countyName,
        image: row.image || "/images/tourist-1.jpg",
      }))
    }

    return NextResponse.json({ favorites: { properties, destinations } })
  } catch (error) {
    console.error("Favorites GET error:", error)
    return NextResponse.json({ error: "Unable to load favorites" }, { status: 500 })
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

  const userId = String(body.userId || "").trim()
  const itemType = String(body.itemType || "").trim()
  const itemId = String(body.itemId || "").trim()
  if (!userId || !itemType || !itemId) {
    return NextResponse.json({ error: "userId, itemType, and itemId are required" }, { status: 400 })
  }

  try {
    neonConfig.webSocketConstructor = require("ws")
  } catch {
    // ignore
  }

  const pool = new Pool({ connectionString: databaseUrl })
  try {
    await pool.query(
      'insert into favorites ("userId", "itemType", "itemId") values ($1,$2,$3) on conflict do nothing',
      [userId, itemType, itemId]
    )
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Favorites POST error:", error)
    return NextResponse.json({ error: "Unable to save favorite" }, { status: 500 })
  } finally {
    await pool.end()
  }
}

export async function DELETE(request: Request) {
  const databaseUrl = getDatabaseUrl()
  if (!databaseUrl) {
    return NextResponse.json({ error: "Database not configured." }, { status: 500 })
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const userId = String(body.userId || "").trim()
  const itemType = String(body.itemType || "").trim()
  const itemId = String(body.itemId || "").trim()
  if (!userId || !itemType || !itemId) {
    return NextResponse.json({ error: "userId, itemType, and itemId are required" }, { status: 400 })
  }

  try {
    neonConfig.webSocketConstructor = require("ws")
  } catch {
    // ignore
  }

  const pool = new Pool({ connectionString: databaseUrl })
  try {
    await pool.query(
      'delete from favorites where "userId" = $1 and "itemType" = $2 and "itemId" = $3',
      [userId, itemType, itemId]
    )
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Favorites DELETE error:", error)
    return NextResponse.json({ error: "Unable to remove favorite" }, { status: 500 })
  } finally {
    await pool.end()
  }
}
