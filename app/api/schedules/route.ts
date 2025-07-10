import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET: Obter todos os horários ou filtrar por usuário
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    let schedules
    if (userId) {
      schedules = await prisma.user_schedules.findMany({
        where: { userId: parseInt(userId) },
        include: { user: true },
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      })
    } else {
      schedules = await prisma.user_schedules.findMany({
        include: { user: true },
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      })
    }

    return NextResponse.json({ schedules }, { status: 200 })
  } catch (error) {
    console.error("Erro ao buscar horários:", error)
    return NextResponse.json({ error: "Erro ao buscar horários" }, { status: 500 })
  }
}

// POST: Criar um novo horário
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, dayOfWeek, startTime, endTime } = body

    // Validar dados
    if (!userId || dayOfWeek === undefined || !startTime || !endTime) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }

    // Verificar se o usuário existe
    const user = await prisma.users.findUnique({ where: { id: parseInt(userId) } })
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    const schedule = await prisma.user_schedules.create({
      data: {
        userId: parseInt(userId),
        dayOfWeek: parseInt(dayOfWeek),
        startTime,
        endTime,
      },
      include: { user: true },
    })

    return NextResponse.json({ schedule }, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar horário:", error)
    return NextResponse.json({ error: "Erro ao criar horário" }, { status: 500 })
  }
} 