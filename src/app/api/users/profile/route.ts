import { NextResponse } from "next/server"
import { getPrisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = String(searchParams.get("userId") || "").trim()

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 })
  }

  const prisma = getPrisma()
  if (!prisma) {
    return NextResponse.json({ error: "Database not configured." }, { status: 500 })
  }

  try {
    let user = null as null | {
      id: string
      firstName: string
      middleName: string | null
      lastName: string
      username: string | null
      avatarUrl?: string | null
      email: string
      phoneNumber: string
      createdAt: Date
      hasAcceptedTerms: boolean
      hasAcceptedHostTerms: boolean
      walletBalance: number
    }

    try {
      user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          firstName: true,
          middleName: true,
          lastName: true,
          username: true,
          avatarUrl: true,
          email: true,
          phoneNumber: true,
          createdAt: true,
          hasAcceptedTerms: true,
          hasAcceptedHostTerms: true,
          walletBalance: true,
        },
      })
    } catch (error) {
      const message = String((error as Error)?.message || "")
      if (!message.toLowerCase().includes("avatarurl")) {
        throw error
      }
      user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          firstName: true,
          middleName: true,
          lastName: true,
          username: true,
          email: true,
          phoneNumber: true,
          createdAt: true,
          hasAcceptedTerms: true,
          hasAcceptedHostTerms: true,
          walletBalance: true,
        },
      })
      if (user) {
        user = { ...user, avatarUrl: null }
      }
    }
    const defaultMpesa = await prisma.userPaymentMethod.findFirst({
      where: {
        userId,
        paymentMethod: "MPESA",
        isDefault: true,
      },
      select: {
        mpesaPhone: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        ...user,
        defaultMpesaPhone: defaultMpesa?.mpesaPhone ?? user.phoneNumber,
      },
    })
  } catch (error) {
    console.error("Profile fetch error:", error)
    return NextResponse.json({ error: "Unable to load profile." }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const prisma = getPrisma()
  if (!prisma) {
    return NextResponse.json({ error: "Database not configured." }, { status: 500 })
  }

  try {
    const body = await request.json()
    const userId = String(body.userId || "").trim()
    const firstName = String(body.firstName || "").trim()
    const middleName = String(body.middleName || "").trim()
    const lastName = String(body.lastName || "").trim()
    const email = String(body.email || "").trim().toLowerCase()
    const phoneNumber = String(body.phoneNumber || "").trim()
    const defaultMpesaPhone = String(body.defaultMpesaPhone || "").trim()
    const avatarUrl = String(body.avatarUrl || "").trim()

    if (!userId || !firstName || !lastName || !email || !phoneNumber) {
      return NextResponse.json(
        { error: "First name, last name, email, and phone number are required." },
        { status: 400 }
      )
    }

    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phoneNumber }],
        NOT: { id: userId },
      },
      select: { id: true },
    })

    if (existing) {
      return NextResponse.json(
        { error: "That email or phone number is already used by another account." },
        { status: 409 }
      )
    }

    const updatedUser = await prisma.$transaction(async (tx) => {
      let user = null as null | {
        id: string
        firstName: string
        middleName: string | null
        lastName: string
        username: string | null
        avatarUrl?: string | null
        email: string
        phoneNumber: string
        createdAt: Date
        hasAcceptedTerms: boolean
        hasAcceptedHostTerms: boolean
        walletBalance: number
      }

      try {
        user = await tx.user.update({
          where: { id: userId },
          data: {
            firstName,
            middleName: middleName || null,
            lastName,
            avatarUrl: avatarUrl || null,
            email,
            phoneNumber,
          },
          select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
            username: true,
            avatarUrl: true,
            email: true,
            phoneNumber: true,
            createdAt: true,
            hasAcceptedTerms: true,
            hasAcceptedHostTerms: true,
            walletBalance: true,
          },
        })
      } catch (error) {
        const message = String((error as Error)?.message || "")
        if (!message.toLowerCase().includes("avatarurl")) {
          throw error
        }
        user = await tx.user.update({
          where: { id: userId },
          data: {
            firstName,
            middleName: middleName || null,
            lastName,
            email,
            phoneNumber,
          },
          select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
            username: true,
            email: true,
            phoneNumber: true,
            createdAt: true,
            hasAcceptedTerms: true,
            hasAcceptedHostTerms: true,
            walletBalance: true,
          },
        })
        if (user) {
          user = { ...user, avatarUrl: null }
        }
      }

      const mpesaPhone = defaultMpesaPhone || phoneNumber
      await tx.userPaymentMethod.updateMany({
        where: { userId, paymentMethod: "MPESA" },
        data: { isDefault: false },
      })

      const existingMpesa = await tx.userPaymentMethod.findFirst({
        where: { userId, paymentMethod: "MPESA" },
        select: { id: true },
      })

      if (existingMpesa) {
        await tx.userPaymentMethod.update({
          where: { id: existingMpesa.id },
          data: {
            mpesaPhone,
            isDefault: true,
          },
        })
      } else {
        await tx.userPaymentMethod.create({
          data: {
            userId,
            paymentMethod: "MPESA",
            mpesaPhone,
            isDefault: true,
          },
        })
      }

      return {
        ...user,
        defaultMpesaPhone: mpesaPhone,
      }
    })

    return NextResponse.json({ ok: true, user: updatedUser })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: "Unable to save profile." }, { status: 500 })
  }
}
