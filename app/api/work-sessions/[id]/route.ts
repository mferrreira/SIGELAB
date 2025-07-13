import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const id = parseInt(params.id)
    const body = await request.json()
    const { status, activity, endTime } = body

    const updateData: any = {}
    
    if (status) {
      updateData.status = status
    }
    
    if (activity !== undefined) {
      updateData.activity = activity
    }
    
    if (endTime) {
      updateData.endTime = new Date(endTime)
      
      // Calculate duration if ending the session
      if (status === "completed") {
        const session = await prisma.work_sessions.findUnique({
          where: { id },
          select: { startTime: true },
        })
        
        if (session) {
          const startTime = session.startTime
          const endTimeDate = new Date(endTime)
          const durationMs = endTimeDate.getTime() - startTime.getTime()
          const durationMinutes = Math.round(durationMs / (1000 * 60))
          updateData.duration = durationMinutes
        }
      }
    }

    const updatedSession = await prisma.work_sessions.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json({ data: updatedSession })
  } catch (error) {
    console.error("Erro ao atualizar sessão de trabalho:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const id = parseInt(params.id)

    await prisma.work_sessions.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao excluir sessão de trabalho:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
} 