import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// PATCH: Encerrar uma responsabilidade ou atualizar notas
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params
    const id = parseInt(params.id)
    const body = await request.json()

    if (body.action === "end") {
      // Verificar se a responsabilidade existe e está ativa
      const existingResponsibility = await prisma.lab_responsibilities.findUnique({
        where: { id },
        include: {
          user: true,
        },
      })

      if (!existingResponsibility) {
        return NextResponse.json({ error: "Responsabilidade não encontrada" }, { status: 404 })
      }

      if (existingResponsibility.endTime) {
        return NextResponse.json({ error: "Responsabilidade já foi encerrada" }, { status: 400 })
      }

      // Verificar se o usuário que está tentando encerrar tem permissão
      // Apenas o usuário que iniciou a responsabilidade ou um admin pode encerrá-la
      if (body.userId) {
        const requestingUser = await prisma.users.findUnique({
          where: { id: Number(body.userId) }
        })

        if (!requestingUser) {
          return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
        }

        const canEnd = requestingUser.role === "administrador_laboratorio" || 
                      requestingUser.id === existingResponsibility.userId

        if (!canEnd) {
          return NextResponse.json({ error: "Apenas o laboratorista atual ou um administrador de laboratório pode encerrar a responsabilidade" }, { status: 403 })
        }
      }

      // Encerrar responsabilidade
      const responsibility = await prisma.lab_responsibilities.update({
        where: { id },
        data: { 
          endTime: new Date().toISOString() 
        },
        include: {
          user: true,
        },
      })

      return NextResponse.json({ responsibility }, { status: 200 })
    } else if (body.action === "updateNotes" && body.notes !== undefined) {
      // Atualizar notas
      const responsibility = await prisma.lab_responsibilities.update({
        where: { id },
        data: { 
          notes: body.notes 
        },
        include: {
          user: true,
        },
      })

      return NextResponse.json({ responsibility }, { status: 200 })
    }

    return NextResponse.json({ error: "Ação não suportada" }, { status: 400 })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "Responsabilidade não encontrada" }, { status: 404 })
    }
    console.error("Erro ao atualizar responsabilidade:", error)
    return NextResponse.json({ error: "Erro ao atualizar responsabilidade" }, { status: 500 })
  }
}

// DELETE: Excluir uma responsabilidade
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params
    const id = parseInt(params.id)

    await prisma.lab_responsibilities.delete({
      where: { id }
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "Responsabilidade não encontrada" }, { status: 404 })
    }
    console.error("Erro ao excluir responsabilidade:", error)
    return NextResponse.json({ error: "Erro ao excluir responsabilidade" }, { status: 500 })
  }
}
