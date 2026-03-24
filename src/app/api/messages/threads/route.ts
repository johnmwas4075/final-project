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

export async function GET(request: Request) {
  const databaseUrl = getDatabaseUrl()
  if (!databaseUrl) {
    return NextResponse.json({ error: "Database not configured. Set DATABASE_URL." }, { status: 500 })
  }

  try {
    neonConfig.webSocketConstructor = require("ws")
  } catch {
    // ignore, browser runtime not expected here
  }

  const pool = new Pool({ connectionString: databaseUrl })

  try {
    const { searchParams } = new URL(request.url)
    const userIdParam = searchParams.get("userId")
    const emailParam = searchParams.get("email")
    const usernameParam = searchParams.get("username")

    if (!userIdParam && !emailParam && !usernameParam) {
      return NextResponse.json({ error: "userId or email or username is required" }, { status: 400 })
    }

    let user = null as null | { id: string; username: string | null; email: string | null; firstName: string | null; lastName: string | null }
    if (userIdParam) {
      const res = await pool.query(
        'select id, username, email, "firstName", "lastName" from "user" where id = $1 limit 1',
        [userIdParam]
      )
      user = res.rows[0] ?? null
    }
    if (!user && emailParam) {
      const res = await pool.query(
        'select id, username, email, "firstName", "lastName" from "user" where lower(email) = lower($1) limit 1',
        [String(emailParam).trim().toLowerCase()]
      )
      user = res.rows[0] ?? null
    }
    if (!user && usernameParam) {
      const res = await pool.query(
        'select id, username, email, "firstName", "lastName" from "user" where lower(username) = lower($1) limit 1',
        [String(usernameParam).trim()]
      )
      user = res.rows[0] ?? null
    }

    if (!user) {
      return NextResponse.json({ threads: [] })
    }

    const resolvedUserId = user.id

    const threadRes = await pool.query(
      'select id, "hostId", "guestId", "updatedAt", "lastMessageAt" from message_threads where "hostId" = $1 or "guestId" = $1 order by "updatedAt" desc',
      [resolvedUserId]
    )

    let threads = threadRes.rows as Array<{ id: string; hostId: string; guestId: string; updatedAt: Date; lastMessageAt: Date | null }>

    if (threads.length === 0) {
      const latestRes = await pool.query(
        'select distinct on ("threadId") "threadId", body, "createdAt", "senderId", "receiverId" from messages where "senderId" = $1 or "receiverId" = $1 order by "threadId", "createdAt" desc',
        [resolvedUserId]
      )
      const latestRows = latestRes.rows as Array<{ threadId: string; body: string; createdAt: Date; senderId: string; receiverId: string }>
      const threadIds = Array.from(new Set(latestRows.map((row) => row.threadId).filter(Boolean)))
      if (threadIds.length === 0) {
        return NextResponse.json({ threads: [] })
      }

      threads = threadIds.map((id) => ({
        id,
        hostId: latestRows.find((row) => row.threadId === id)?.senderId || resolvedUserId,
        guestId: latestRows.find((row) => row.threadId === id)?.receiverId || resolvedUserId,
        updatedAt: latestRows.find((row) => row.threadId === id)?.createdAt || new Date(),
        lastMessageAt: latestRows.find((row) => row.threadId === id)?.createdAt || null,
      }))
    }

    const threadIds = threads.map((t) => t.id)
    const latestMessageRes = await pool.query(
      'select distinct on ("threadId") "threadId", body, "createdAt", "senderId", "receiverId" from messages where "threadId" = any($1) order by "threadId", "createdAt" desc',
      [threadIds]
    )
    const latestByThread = new Map<string, { body: string; createdAt: Date; senderId: string; receiverId: string }>()
    for (const row of latestMessageRes.rows) {
      latestByThread.set(row.threadId, row)
    }

    const unreadRes = await pool.query(
      'select "threadId", count(*)::int as count from messages where "threadId" = any($1) and "receiverId" = $2 and "readAt" is null group by "threadId"',
      [threadIds, resolvedUserId]
    )
    const unreadByThread = new Map<string, number>()
    for (const row of unreadRes.rows) unreadByThread.set(row.threadId, Number(row.count || 0))

    const otherIds = Array.from(
      new Set(
        threads.map((t) => (t.hostId === resolvedUserId ? t.guestId : t.hostId)).filter(Boolean)
      )
    )
    const otherRes = await pool.query(
      'select id, username, "firstName", "lastName" from "user" where id = any($1)',
      [otherIds]
    )
    const otherById = new Map<string, { id: string; username: string | null; firstName: string | null; lastName: string | null }>()
    for (const row of otherRes.rows) otherById.set(row.id, row)

    const data = threads.map((thread) => {
      const latest = latestByThread.get(thread.id)
      const otherId = thread.hostId === resolvedUserId ? thread.guestId : thread.hostId
      const other = otherId ? otherById.get(otherId) : null
      return {
        id: thread.id,
        name: [other?.firstName, other?.lastName].filter(Boolean).join(" ") || other?.username || "Guest",
        username: other?.username || "guest",
        avatar: "/images/avatars/default.png",
        lastMessage: latest?.body || "",
        timestamp: (latest?.createdAt || thread.lastMessageAt || thread.updatedAt)?.toISOString?.() || new Date().toISOString(),
        unreadCount: unreadByThread.get(thread.id) || 0,
      }
    })

    return NextResponse.json({ threads: data })
  } catch (error) {
    console.error("Threads API error:", error)
    return NextResponse.json({ threads: [], error: "Unable to load threads" }, { status: 500 })
  } finally {
    await pool.end()
  }
}
