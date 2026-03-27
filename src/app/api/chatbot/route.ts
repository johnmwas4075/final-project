import { NextResponse } from "next/server"
import { getPrisma } from "@/lib/prisma"

const MAX_MESSAGES = 50

const normalize = (value: string) => value.toLowerCase()

const tokenCandidates = (value: string) =>
  normalize(value)
    .split(/[^a-z0-9]+/g)
    .map((token) => token.trim())
    .filter((token) => token.length >= 4)

const buildNavigationHelp = () =>
  [
    "Here are a few quick tips:",
    "- Use the filters on the main page to narrow by location, bedrooms, and price.",
    "- Open a property to view photos, reserve, or book.",
    "- Use Profile to update your details and wallet info.",
    "- Messages lets you chat with hosts or clients.",
  ].join("\n")

const buildFallback = () =>
  [
    "I can help with:",
    "- Tourist places (example: \"Best places to visit in Mombasa\")",
    "- Dwellify stays (example: \"Show me 2-bedroom stays in Nairobi\")",
    "- Navigating the system (example: \"How do I book a place?\")",
  ].join("\n")

const pickCounty = async (message: string, prisma: ReturnType<typeof getPrisma>) => {
  if (!prisma) return null
  const tokens = tokenCandidates(message)
  for (const token of tokens) {
    const match = await prisma.tourism_destination.findFirst({
      where: { county: { contains: token, mode: "insensitive" } },
      select: { county: true },
    })
    if (match?.county) return match.county
  }
  return null
}

const pickPropertyCounty = async (message: string, prisma: ReturnType<typeof getPrisma>) => {
  if (!prisma) return null
  const tokens = tokenCandidates(message)
  for (const token of tokens) {
    const match = await prisma.property.findFirst({
      where: { countyName: { contains: token, mode: "insensitive" } },
      select: { countyName: true },
    })
    if (match?.countyName) return match.countyName
  }
  return null
}

const buildBotReply = async (message: string, prisma: ReturnType<typeof getPrisma>) => {
  const text = normalize(message)
  const wantsTourism = /(tour|tourist|destination|places|place|visit|attraction)/.test(text)
  const wantsStay = /(dwellify|stay|property|room|accommodation|house)/.test(text)
  const wantsHelp = /(navigate|how|where|help|book|reserve|payment|pay|messages|profile)/.test(text)

  const sections: string[] = []

  if (wantsTourism && prisma) {
    const county = await pickCounty(message, prisma)
    const destinations = await prisma.tourism_destination.findMany({
      where: county ? { county: { equals: county, mode: "insensitive" } } : undefined,
      orderBy: { created_at: "desc" },
      take: 3,
    })
    if (destinations.length > 0) {
      const heading = county ? `Top tourist places in ${county}:` : "Top tourist places:"
      const list = destinations
        .map((item) => `- ${item.destinationName} (${item.county})`)
        .join("\n")
      sections.push([heading, list].join("\n"))
    } else {
      sections.push("I couldn't find destinations yet. Try a county name like Nairobi or Mombasa.")
    }
  }

  if (wantsStay && prisma) {
    const county = await pickPropertyCounty(message, prisma)
    const properties = await prisma.property.findMany({
      where: county ? { countyName: { contains: county, mode: "insensitive" } } : undefined,
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { id: true, propertyName: true, countyName: true, price: true, rooms: true },
    })
    if (properties.length > 0) {
      const heading = county ? `Popular stays in ${county}:` : "Popular stays:"
      const list = properties
        .map((item) => `- ${item.propertyName} (${item.countyName ?? "Kenya"}) • ${item.rooms} rooms • KES ${Math.round(item.price)}`)
        .join("\n")
      sections.push([heading, list].join("\n"))
    } else {
      sections.push("I couldn't find stays yet. Try a county name or a bedroom count.")
    }
  }

  if (wantsHelp) {
    sections.push(buildNavigationHelp())
  }

  if (sections.length === 0) {
    return buildFallback()
  }

  return sections.join("\n\n")
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId")?.trim()
  if (!userId) {
    return NextResponse.json({ error: "userId is required", messages: [] }, { status: 400 })
  }
  const prisma = getPrisma()
  if (!prisma) {
    return NextResponse.json({ error: "Database not configured", messages: [] }, { status: 500 })
  }
  try {
    const messages = await prisma.chatbotMessage.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      take: MAX_MESSAGES,
    })
    return NextResponse.json({ messages })
  } catch (error) {
    console.error("chatbot GET error", error)
    return NextResponse.json({ error: "Unable to load messages", messages: [] }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const prisma = getPrisma()
  if (!prisma) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 })
  }
  let body: { userId?: string; message?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
  const userId = body.userId?.trim()
  const message = body.message?.trim()
  if (!userId || !message) {
    return NextResponse.json({ error: "userId and message are required" }, { status: 400 })
  }

  try {
    const userMessage = await prisma.chatbotMessage.create({
      data: {
        userId,
        role: "USER",
        content: message,
      },
    })

    const reply = await buildBotReply(message, prisma)
    const botMessage = await prisma.chatbotMessage.create({
      data: {
        userId,
        role: "BOT",
        content: reply,
      },
    })

    return NextResponse.json({ userMessage, botMessage })
  } catch (error) {
    console.error("chatbot POST error", error)
    return NextResponse.json({ error: "Unable to send message" }, { status: 500 })
  }
}

