import fs from "node:fs"
import path from "node:path"
import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { neonConfig } from "@neondatabase/serverless"

// Load environment variables first
const findEnvFile = (filename: string): string => {
  let current = process.cwd()
  while (true) {
    const candidate = path.join(current, filename)
    if (fs.existsSync(candidate)) return candidate
    const parent = path.dirname(current)
    if (parent === current) break
    current = parent
  }
  const projectCandidate = path.join(process.cwd(), "final-project", filename)
  if (fs.existsSync(projectCandidate)) return projectCandidate
  return ""
}

const loadEnvFromFiles = () => {
  const envFiles = [".env.local", ".env"]
  for (const file of envFiles) {
    const filePath = findEnvFile(file)
    if (!filePath) continue
    const content = fs.readFileSync(filePath, "utf8")
    const lines = content.split(/\r?\n/)
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith("#")) continue
      const eqIndex = trimmed.indexOf("=")
      if (eqIndex === -1) continue
      const key = trimmed.slice(0, eqIndex).trim()
      let value = trimmed.slice(eqIndex + 1).trim()
      // Remove surrounding quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      // Set in process.env if not already set
      if (!process.env[key]) {
        process.env[key] = value
      }
    }
  }
}

// Load immediately on module import
loadEnvFromFiles()

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  prismaUrl?: string
}

// Load environment variables immediately
const loadEnvFile = (filename: string) => {
  const filePath = findEnvFile(filename)
  if (!filePath) return
  const content = fs.readFileSync(filePath, "utf8")
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) return
    const eqIndex = trimmed.indexOf("=")
    if (eqIndex === -1) return
    const key = trimmed.slice(0, eqIndex).trim()
    let value = trimmed.slice(eqIndex + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    const existing = process.env[key]
    const shouldOverride =
      key === "DATABASE_URL" ||
      typeof existing !== "string" ||
      existing.trim() === ""
    if (shouldOverride) {
      process.env[key] = value
    }
  })
}

// Load environment files immediately when module is imported
loadEnvFile(".env.local")
loadEnvFile(".env")

const readEnvValue = (filename: string, key: string): string => {
  const filePath = findEnvFile(filename)
  if (!filePath) return ""
  const content = fs.readFileSync(filePath, "utf8")
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eqIndex = trimmed.indexOf("=")
    if (eqIndex === -1) continue
    const entryKey = trimmed.slice(0, eqIndex).trim()
    if (entryKey !== key) continue
    let value = trimmed.slice(eqIndex + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    return value
  }
  return ""
}

const redactUrl = (url: string): string => {
  if (!url) return ""
  try {
    const parsed = new URL(url)
    const password = parsed.password ? "****" : ""
    const username = parsed.username ? parsed.username : ""
    if (username || password) {
      parsed.username = username ? "****" : ""
      parsed.password = password
    }
    return parsed.toString()
  } catch {
    return url.slice(0, 30)
  }
}

export function getPrisma(): PrismaClient | null {
  // Ensure environment is loaded
  loadEnvFile(".env.local")
  loadEnvFile(".env")

  const envLocalPath = findEnvFile(".env.local")
  const envPath = findEnvFile(".env")
  const fileUrl = readEnvValue(".env.local", "DATABASE_URL") || readEnvValue(".env", "DATABASE_URL")
  const envUrl =
    typeof process.env.DATABASE_URL === "string"
      ? process.env.DATABASE_URL.trim()
      : ""
  const databaseUrl = (fileUrl || envUrl || "").trim()
  
  if (databaseUrl) process.env.DATABASE_URL = databaseUrl
  if (!databaseUrl) {
    console.error("DATABASE_URL not found in environment variables or .env.local/.env files", {
      cwd: process.cwd(),
      envLocalPath,
      envPath,
    })
    return null
  }
  if (!/^postgres(ql)?:\/\//i.test(databaseUrl)) {
    console.error("DATABASE_URL does not appear to be a valid PostgreSQL connection string", {
      value: redactUrl(databaseUrl),
    })
    return null
  }
  try {
    const parsed = new URL(databaseUrl)
    if (!parsed.hostname) {
      console.error("DATABASE_URL missing hostname", { value: redactUrl(databaseUrl) })
      return null
    }
  } catch {
    console.error("DATABASE_URL could not be parsed as a URL", { value: redactUrl(databaseUrl) })
    return null
  }

  if (!globalForPrisma.prisma || globalForPrisma.prismaUrl !== databaseUrl) {
    try {
      neonConfig.webSocketConstructor = require("ws")
    } catch (error) {
      if (typeof WebSocket !== "undefined") {
        neonConfig.webSocketConstructor = WebSocket
      }
    }

    const adapter = new PrismaNeon({ connectionString: databaseUrl })
    globalForPrisma.prisma = new PrismaClient({ adapter })
    globalForPrisma.prismaUrl = databaseUrl
  }

  return globalForPrisma.prisma ?? null
}
