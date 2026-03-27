import crypto from "node:crypto"

type MpesaConfig = {
  env: "sandbox" | "production"
  consumerKey: string
  consumerSecret: string
  shortCode: string
  passkey: string
  callbackUrl: string
}

const getBaseUrl = () => {
  const fromEnv =
    process.env.MPESA_CALLBACK_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL
  if (fromEnv) return fromEnv.replace(/\/$/, "")
  const vercel = process.env.VERCEL_URL
  if (vercel) return `https://${vercel}`
  return ""
}

export const getMpesaConfig = (): MpesaConfig | null => {
  const env = String(process.env.MPESA_ENV || "sandbox").toLowerCase() === "production" ? "production" : "sandbox"
  const consumerKey = String(process.env.MPESA_CONSUMER_KEY || "").trim()
  const consumerSecret = String(process.env.MPESA_CONSUMER_SECRET || "").trim()
  const shortCode = String(process.env.MPESA_SHORTCODE || "").trim()
  const passkey = String(process.env.MPESA_PASSKEY || "").trim()
  const baseUrl = getBaseUrl()
  const callbackUrl = String(process.env.MPESA_CALLBACK_URL || "").trim() || (baseUrl ? `${baseUrl}/api/payments/mpesa/callback` : "")

  if (!consumerKey || !consumerSecret || !shortCode || !passkey || !callbackUrl) {
    return null
  }

  return {
    env,
    consumerKey,
    consumerSecret,
    shortCode,
    passkey,
    callbackUrl,
  }
}

export const getMpesaEndpoints = (env: "sandbox" | "production") => {
  const base = env === "production" ? "https://api.safaricom.co.ke" : "https://sandbox.safaricom.co.ke"
  return {
    oauth: `${base}/oauth/v1/generate?grant_type=client_credentials`,
    stkPush: `${base}/mpesa/stkpush/v1/processrequest`,
  }
}

export const formatTimestamp = (date = new Date()) => {
  const pad = (value: number) => String(value).padStart(2, "0")
  const yyyy = date.getFullYear()
  const mm = pad(date.getMonth() + 1)
  const dd = pad(date.getDate())
  const hh = pad(date.getHours())
  const min = pad(date.getMinutes())
  const ss = pad(date.getSeconds())
  return `${yyyy}${mm}${dd}${hh}${min}${ss}`
}

export const encodePassword = (shortCode: string, passkey: string, timestamp: string) => {
  return Buffer.from(`${shortCode}${passkey}${timestamp}`).toString("base64")
}

export const createMpesaReference = (username?: string | null) => {
  const safe = String(username || "guest").replace(/[^a-zA-Z0-9._-]/g, "")
  return `dwellify-${safe.startsWith("@") ? safe.slice(1) : safe}`
}

export const randomRef = () => crypto.randomBytes(10).toString("hex")

