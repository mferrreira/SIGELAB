import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET: Obter um horário específico
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const schedule = await prisma.user_schedules.findUnique({
      where: { id },
      include: { user: true },
    })

    if (!schedule) {
      return NextResponse.json({ error: "Horário não encontrado" }, { status: 404 })
    }

    return NextResponse.json({ schedule }, { status: 200 })
  } catch (error) {
    console.error("Erro ao buscar horário:", error)
    return NextResponse.json({ error: "Erro ao buscar horário" }, { status: 500 })
  }
}

// PUT: Atualizar um horário
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    const body = await request.json()
    const { dayOfWeek, startTime, endTime } = body

    const updatedSchedule = await prisma.user_schedules.update({
      where: { id },
      data: {
        dayOfWeek: dayOfWeek !== undefined ? parseInt(dayOfWeek) : undefined,
        startTime,
        endTime,
      },
      include: { user: true },
    })

    return NextResponse.json({ schedule: updatedSchedule }, { status: 200 })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "Horário não encontrado" }, { status: 404 })
    }
    console.error("Erro ao atualizar horário:", error)
    return NextResponse.json({ error: "Erro ao atualizar horário" }, { status: 500 })
  }
}

// DELETE: Excluir um horário
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    await prisma.user_schedules.delete({ where: { id } })
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "Horário não encontrado" }, { status: 404 })
    }
    console.error("Erro ao excluir horário:", error)
    return NextResponse.json({ error: "Erro ao excluir horário" }, { status: 500 })
  }
} 