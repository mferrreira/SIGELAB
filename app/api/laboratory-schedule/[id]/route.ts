import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// PUT: Update a laboratory schedule
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const schedule = await prisma.laboratory_schedules.update({
      where: { id: Number(params.id) },
      data: {
        dayOfWeek,
        startTime,
        endTime,
        notes
      }
    })

    return NextResponse.json({ schedule })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "Horário não encontrado" }, { status: 404 })
    }
    console.error("Erro ao atualizar horário do laboratório:", error)
    return NextResponse.json({ error: "Erro ao atualizar horário" }, { status: 500 })
  }
}

// DELETE: Delete a laboratory schedule
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    await prisma.laboratory_schedules.delete({
      where: { id: Number(params.id) }
    })

    return NextResponse.json({ message: "Horário removido com sucesso" })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "Horário não encontrado" }, { status: 404 })
    }
    console.error("Erro ao remover horário do laboratório:", error)
    return NextResponse.json({ error: "Erro ao remover horário" }, { status: 500 })
  }
} 