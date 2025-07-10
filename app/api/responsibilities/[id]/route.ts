import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// PATCH: Encerrar uma responsabilidade ou atualizar notas
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params
    const id = parseInt(params.id)
    const body = await request.json()

    if (body.action === "end") {
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
