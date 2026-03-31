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

const computeRating = (reviews: { stars: number }[]) => {
  if (!reviews || reviews.length === 0) return 0
  const total = reviews.reduce((sum, review) => sum + (review.stars || 0), 0)
  return Number((total / reviews.length).toFixed(2))
}

const getRecommendations = async (prisma: ReturnType<typeof getPrisma>, userId?: string) => {
  if (!prisma) return []
  if (userId) {
    const recs = await prisma.recommendation.findMany({
      where: { userId },
      orderBy: { score: "desc" },
      take: 5,
      include: {
        property: {
          select: {
            id: true,
            propertyName: true,
            countyName: true,
            price: true,
            rooms: true,
            photos: true,
            reviews: { select: { stars: true } },
          },
        },
      },
    })
    return recs.map((rec) => ({
      id: rec.property.id,
      name: rec.property.propertyName,
      county: rec.property.countyName ?? "",
      price: rec.property.price ?? 0,
      rooms: rec.property.rooms ?? 0,
      rating: computeRating(rec.property.reviews),
    }))
  }

  const fallback = await prisma.property.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      propertyName: true,
      countyName: true,
      price: true,
      rooms: true,
      reviews: { select: { stars: true } },
    },
  })
  return fallback.map((property) => ({
    id: property.id,
    name: property.propertyName,
    county: property.countyName ?? "",
    price: property.price ?? 0,
    rooms: property.rooms ?? 0,
    rating: computeRating(property.reviews),
  }))
}

const buildSystemPrompt = (recs: { id: string; name: string; county: string; price: number; rooms: number; rating: number }[]) => {
  const lines = recs.map((rec) => `- ${rec.name} | ${rec.county || "Kenya"} | ${rec.rooms} rooms | KES ${Math.round(rec.price)} | rating ${rec.rating}`)
  const recSection = lines.length > 0 ? lines.join("\n") : "- No recommendations available"
  return [
    "You are the Dwellify assistant.",
    "Be conversational and direct.",
    "Only help with Airbnb-style topics: bookings, stays, hosts/guests, payments, reviews, and tourist places in Kenya.",
    "If asked about anything outside this scope, politely refuse and redirect to Dwellify topics.",
    "Use the recommendations below to suggest places when relevant.",
    "Never reveal internal IDs, tokens, or database identifiers.",
    "Recommendations:",
    recSection,
  ].join("\n")
}

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

const linkifyProperties = (reply: string, recs: { id: string; name: string }[]) => {
  let output = reply
  const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")
  for (const rec of recs) {
    if (!rec?.name) continue
    const safeName = escapeRegex(rec.name)
    const re = new RegExp(`\\b${safeName}\\b`, "gi")
    output = output.replace(re, `[${rec.name}](/property/${rec.id})`)
  }
  return output
}

const callCerebras = async (messages: { role: string; content: string }[]) => {
  const apiKey = process.env.CEREBRAS_API_KEY
  if (!apiKey) {
    throw new Error("CEREBRAS_API_KEY not set")
  }
  const res = await fetch("https://api.cerebras.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama3.1-8b",
      messages,
      temperature: 0.6,
      max_tokens: 400,
    }),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`Cerebras error: ${res.status} ${text}`)
  }
  const data = await res.json()
  const content = data?.choices?.[0]?.message?.content
  if (!content) throw new Error("No content from Cerebras")
  return String(content)
}

const buildBotReply = async (message: string, prisma: ReturnType<typeof getPrisma>, userId?: string) => {
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
        .map((item) => `- ${item.propertyName} (${item.countyName ?? "Kenya"}) - ${item.rooms} rooms - KES ${Math.round(item.price)}`)
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
  let body: { userId?: string; message?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
  const userId = body.userId?.trim()
  const message = body.message?.trim()
  if (!message) {
    return NextResponse.json({ error: "message is required" }, { status: 400 })
  }

  if (userId && !prisma) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 })
  }

  try {
    const recs = prisma ? await getRecommendations(prisma, userId || undefined) : []
    const systemPrompt = buildSystemPrompt(recs)
    const llmMessages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: message },
    ]

    let reply: string
    try {
      reply = await callCerebras(llmMessages)
    } catch (err) {
      console.error("chatbot LLM error", err)
      reply = await buildBotReply(message, prisma, userId || undefined)
    }

    reply = linkifyProperties(reply, recs)

    if (!userId) {
      const now = new Date().toISOString()
      return NextResponse.json({
        userMessage: { id: `guest-${Date.now()}`, role: "USER", content: message, createdAt: now },
        botMessage: { id: `guest-bot-${Date.now()}`, role: "BOT", content: reply, createdAt: now },
        ephemeral: true,
      })
    }

    if (!prisma) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    const userMessage = await prisma.chatbotMessage.create({
      data: {
        userId,
        role: "USER",
        content: message,
      },
    })

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

