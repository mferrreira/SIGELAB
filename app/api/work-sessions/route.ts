import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const status = searchParams.get("status")

    const where: any = {}
    
    if (userId) {
      where.userId = parseInt(userId)
    }
    
    if (status) {
      where.status = status
    }

    const sessions = await prisma.work_sessions.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        startTime: "desc",
      },
    })

    return NextResponse.json({ data: sessions })
  } catch (error) {
    console.error("Erro ao buscar sessões de trabalho:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { userId, activity, location } = body

    // Check if user already has an active session
    const existingActiveSession = await prisma.work_sessions.findFirst({
      where: {
        userId: parseInt(userId),
        status: "active",
      },
    })

    if (existingActiveSession) {
      return NextResponse.json(
        { error: "Você já tem uma sessão ativa" },
        { status: 400 }
      )
    }

    // Get user info
    const user = await prisma.users.findUnique({
      where: { id: parseInt(userId) },
      select: { name: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      )
    }

    const newSession = await prisma.work_sessions.create({
      data: {
        userId: parseInt(userId),
        userName: user.name,
        activity: activity || null,
        location: location || null,
        status: "active",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({ data: newSession }, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar sessão de trabalho:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
} 