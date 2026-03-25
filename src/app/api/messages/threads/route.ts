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
    // ignore, browser runtime not expected here
  }

  const pool = new Pool({ connectionString: databaseUrl })

  try {
    const { searchParams } = new URL(request.url)
    const userIdParam = searchParams.get("userId")
    const emailParam = searchParams.get("email")
    const usernameParam = searchParams.get("username")
    const roleParam = String(searchParams.get("role") || "all").toLowerCase()

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

    const threadSql =
      roleParam === "host"
        ? 'select id, "hostId", "guestId", "updatedAt", "lastMessageAt" from message_threads where "hostId" = $1 order by "updatedAt" desc'
        : roleParam === "client"
          ? 'select id, "hostId", "guestId", "updatedAt", "lastMessageAt" from message_threads where "guestId" = $1 order by "updatedAt" desc'
          : 'select id, "hostId", "guestId", "updatedAt", "lastMessageAt" from message_threads where "hostId" = $1 or "guestId" = $1 order by "updatedAt" desc'
    const threadRes = await pool.query(threadSql, [resolvedUserId])

    let threads = threadRes.rows as Array<{ id: string; hostId: string; guestId: string; updatedAt: Date; lastMessageAt: Date | null }>

    if (threads.length === 0) {
      const latestSql =
        roleParam === "host"
          ? 'select distinct on ("threadId") "threadId", body, "createdAt", "senderId", "receiverId" from messages where "senderId" = $1 or "receiverId" = $1 order by "threadId", "createdAt" desc'
          : roleParam === "client"
            ? 'select distinct on ("threadId") "threadId", body, "createdAt", "senderId", "receiverId" from messages where "senderId" = $1 or "receiverId" = $1 order by "threadId", "createdAt" desc'
            : 'select distinct on ("threadId") "threadId", body, "createdAt", "senderId", "receiverId" from messages where "senderId" = $1 or "receiverId" = $1 order by "threadId", "createdAt" desc'
      const latestRes = await pool.query(latestSql, [resolvedUserId])
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
        threads
          .map((t) => {
            if (roleParam === "host") return t.guestId
            if (roleParam === "client") return t.hostId
            return t.hostId === resolvedUserId ? t.guestId : t.hostId
          })
          .filter(Boolean)
      )
    )
    let otherRows: Array<{ id: string; username: string | null; firstName: string | null; middleName?: string | null; lastName: string | null; avatarUrl?: string | null }> = []
    try {
      const otherRes = await pool.query(
        'select id, username, "firstName", "middleName", "lastName", "avatarUrl" from "user" where id = any($1)',
        [otherIds]
      )
      otherRows = otherRes.rows
    } catch (error) {
      const message = String((error as Error)?.message || "").toLowerCase()
      if (!message.includes("avatarurl")) {
        throw error
      }
      const otherRes = await pool.query(
        'select id, username, "firstName", "middleName", "lastName" from "user" where id = any($1)',
        [otherIds]
      )
      otherRows = otherRes.rows.map((row) => ({ ...row, avatarUrl: null }))
    }
    const otherById = new Map<string, { id: string; username: string | null; firstName: string | null; middleName?: string | null; lastName: string | null; avatarUrl?: string | null }>()
    for (const row of otherRows) otherById.set(row.id, row)

    const data = threads.map((thread) => {
      const latest = latestByThread.get(thread.id)
      const otherId =
        roleParam === "host"
          ? thread.guestId
          : roleParam === "client"
            ? thread.hostId
            : thread.hostId === resolvedUserId
              ? thread.guestId
              : thread.hostId
      const other = otherId ? otherById.get(otherId) : null
      const cleanUsername = (other?.username || "guest").replace(/^@+/, "")
      const displayName =
        [other?.firstName, other?.middleName, other?.lastName].filter(Boolean).join(" ") ||
        cleanUsername ||
        "Guest"
      return {
        id: thread.id,
        name: displayName,
        username: cleanUsername || "guest",
        avatar: other?.avatarUrl || "/images/avatars/default.png",
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
