import { NextResponse } from "next/server"
import { Pool, neonConfig } from "@neondatabase/serverless"
import { getDatabaseUrl } from "@/lib/database-url"

export const runtime = "nodejs"

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

    if (role === "client") {
      const expired = await pool.query(
        'select b.id, b."propertyId", p."propertyName", b."createdAt" from "Booking" b join "Property" p on p.id = b."propertyId" where b."userId" = $1 and b."status" = $2 and b."createdAt" <= now() - interval \'3 days\'',
        [userId, "PENDING"]
      )

      for (const row of expired.rows) {
        const exists = await pool.query(
          'select id from notifications where "userId" = $1 and role = $2 and category = $3 and "bookingId" = $4 limit 1',
          [userId, role, "reservation-expired", row.id]
        )

        if (exists.rows.length === 0) {
          const createdAt = new Date(row.createdAt)
          const expiresAt = new Date(createdAt.getTime() + 3 * 24 * 60 * 60 * 1000)
          await pool.query(
            'insert into notifications ("userId", role, category, title, message, "createdAt", "bookingId", "propertyId") values ($1, $2, $3, $4, $5, now(), $6, $7)',
            [
              userId,
              role,
              "reservation-expired",
              "Reservation expired",
              `Your reservation for ${row.propertyName} expired on ${expiresAt.toDateString()}.`,
              row.id,
              row.propertyId,
            ]
          )
        }
      }

      if (expired.rows.length > 0) {
        const bookingIds = expired.rows.map((row: { id: string }) => row.id)
        await pool.query(
          'update "Booking" set status = $1, "paymentStatus" = $2, "updatedAt" = now() where id = any($3)',
          ["CANCELLED", "CANCELLED", bookingIds]
        )
      }
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
