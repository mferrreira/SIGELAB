import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// GET: Get all laboratory schedules
export async function GET() {
  try {
    const schedules = await prisma.laboratory_schedules.findMany({
      orderBy: [
        { dayOfWeek: "asc" },
        { startTime: "asc" }
      ]
    })

    return NextResponse.json({ schedules })
  } catch (error) {
    console.error("Erro ao buscar horários do laboratório:", error)
    return NextResponse.json({ error: "Erro ao buscar horários" }, { status: 500 })
  }
}

// POST: Create a new laboratory schedule
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const user = session.user as any
    
    // Only admins and laboratorists can manage lab schedules
    if (user.role !== "administrador_laboratorio" && user.role !== "laboratorista") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    const body = await request.json()
    const { dayOfWeek, startTime, endTime, notes } = body

    if (dayOfWeek === undefined || !startTime || !endTime) {
      return NextResponse.json({ error: "Dados obrigatórios não fornecidos" }, { status: 400 })
    }

    const schedule = await prisma.laboratory_schedules.create({
      data: {
        dayOfWeek,
        startTime,
        endTime,
        notes
      }
    })

    return NextResponse.json({ schedule }, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar horário do laboratório:", error)
    return NextResponse.json({ error: "Erro ao criar horário" }, { status: 500 })
  }
} 