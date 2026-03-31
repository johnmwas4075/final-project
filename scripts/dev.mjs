import { spawn } from "node:child_process"

const run = (command, args, label) => {
  const proc = spawn(command, args, { stdio: "inherit", shell: process.platform === "win32" })
  proc.on("exit", (code) => {
    if (code !== 0) {
      console.error(`${label} exited with code ${code}`)
    }
  })
  return proc
}

const pythonCmd = process.platform === "win32" ? "python" : "python3"

const recs = run(pythonCmd, ["scripts/recommender.py", "--watch"], "recommender")
const next = run(process.platform === "win32" ? "pnpm.cmd" : "pnpm", ["dev:next"], "next")

const shutdown = () => {
  if (recs) recs.kill()
  if (next) next.kill()
}

process.on("SIGINT", shutdown)
process.on("SIGTERM", shutdown)
