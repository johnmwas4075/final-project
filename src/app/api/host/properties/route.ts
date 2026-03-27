import { NextResponse } from "next/server"
import { getPrisma } from "@/lib/prisma"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const prisma = getPrisma()
  if (!prisma) {
    return NextResponse.json({ error: "Database not available" }, { status: 500 })
  }

  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")
  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 })
  }

  const properties = await prisma.property.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      propertyName: true,
      description: true,
      price: true,
      rooms: true,
      bathrooms: true,
      guests: true,
      minNights: true,
      photos: true,
      amenities: true,
      countyName: true,
      constituencyName: true,
      wardName: true,
      createdAt: true,
    },
  })

  return NextResponse.json({ properties })
}

export async function PUT(request: Request) {
  const prisma = getPrisma()
  if (!prisma) {
    return NextResponse.json({ error: "Database not available" }, { status: 500 })
  }

  const body = await request.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const {
    userId,
    propertyId,
    propertyName,
    description,
    price,
    rooms,
    bathrooms,
    guests,
    minNights,
    photos,
    amenities,
    countyName,
    constituencyName,
    wardName,
  } = body as Record<string, unknown>

  if (!userId || !propertyId) {
    return NextResponse.json({ error: "userId and propertyId are required" }, { status: 400 })
  }

  const existing = await prisma.property.findUnique({
    where: { id: String(propertyId) },
    select: { userId: true },
  })

  if (!existing || existing.userId !== userId) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 })
  }

  const updated = await prisma.property.update({
    where: { id: String(propertyId) },
    data: {
      propertyName: typeof propertyName === "string" ? propertyName : undefined,
      description: typeof description === "string" ? description : undefined,
      price: typeof price === "number" ? price : Number(price),
      rooms: typeof rooms === "number" ? rooms : Number(rooms),
      bathrooms: typeof bathrooms === "number" ? bathrooms : Number(bathrooms),
      guests: typeof guests === "number" ? guests : Number(guests),
      minNights: typeof minNights === "number" ? minNights : Number(minNights),
      photos: Array.isArray(photos) ? photos.map(String) : undefined,
      amenities: amenities ?? undefined,
      countyName: typeof countyName === "string" ? countyName : undefined,
      constituencyName: typeof constituencyName === "string" ? constituencyName : undefined,
      wardName: typeof wardName === "string" ? wardName : undefined,
    },
    select: {
      id: true,
      propertyName: true,
      description: true,
      price: true,
      rooms: true,
      bathrooms: true,
      guests: true,
      minNights: true,
      photos: true,
      amenities: true,
      countyName: true,
      constituencyName: true,
      wardName: true,
    },
  })

  return NextResponse.json({ property: updated })
}

export async function POST(request: Request) {
  const prisma = getPrisma()
  if (!prisma) {
    return NextResponse.json({ error: "Database not available" }, { status: 500 })
  }

  const body = await request.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const {
    userId,
    propertyName,
    description,
    price,
    rooms,
    bathrooms,
    guests,
    minNights,
    photos,
    amenities,
    countyName,
    constituencyName,
    wardName,
  } = body as Record<string, unknown>

  if (!userId || !propertyName || !description) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  if (!Array.isArray(photos) || photos.length < 5 || photos.length > 10) {
    return NextResponse.json({ error: "Photos must be between 5 and 10 images" }, { status: 400 })
  }

  const location = await prisma.location.findFirst({
    where: {
      county_name:
        typeof countyName === "string"
          ? { equals: countyName.trim(), mode: "insensitive" }
          : undefined,
      constituency_name:
        typeof constituencyName === "string"
          ? { equals: constituencyName.trim(), mode: "insensitive" }
          : undefined,
      constituencies_wards:
        typeof wardName === "string"
          ? { equals: wardName.trim(), mode: "insensitive" }
          : undefined,
    },
  })

  if (!location) {
    return NextResponse.json({ error: "Location not found. Please check county, constituency, and ward." }, { status: 400 })
  }

  const created = await prisma.property.create({
    data: {
      userId: String(userId),
      propertyName: String(propertyName),
      description: String(description),
      price: Number(price),
      rooms: Number(rooms),
      bathrooms: Number(bathrooms),
      guests: Number(guests),
      minNights: Number(minNights),
      photos: photos.map(String),
      amenities: amenities ?? [],
      countyName: typeof countyName === "string" ? countyName : null,
      constituencyName: typeof constituencyName === "string" ? constituencyName : null,
      wardName: typeof wardName === "string" ? wardName : null,
      countyId: location.id,
      subCountyId: location.id,
      constituencyId: location.id,
      wardId: location.id,
    },
    select: {
      id: true,
      propertyName: true,
      description: true,
      price: true,
      rooms: true,
      bathrooms: true,
      guests: true,
      minNights: true,
      photos: true,
      amenities: true,
      countyName: true,
      constituencyName: true,
      wardName: true,
    },
  })

  return NextResponse.json({ property: created })
}

