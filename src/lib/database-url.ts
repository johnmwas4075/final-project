import fs from "node:fs"
import path from "node:path"

export const getDatabaseUrl = () => {
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
