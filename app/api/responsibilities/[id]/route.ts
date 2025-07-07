import { NextResponse } from "next/server"
import { endResponsibility, updateResponsibilityNotes, deleteResponsibility } from "@/lib/db/responsibilities"

// PATCH: Encerrar uma responsabilidade ou atualizar notas
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await request.json()

    if (body.action === "end") {
      // Encerrar responsabilidade
      const responsibility = endResponsibility(id)

      if (!responsibility) {
        return NextResponse.json({ error: "Responsabilidade não encontrada" }, { status: 404 })
      }

      return NextResponse.json({ responsibility }, { status: 200 })
    } else if (body.action === "updateNotes" && body.notes !== undefined) {
      // Atualizar notas
      const responsibility = updateResponsibilityNotes(id, body.notes)

      if (!responsibility) {
        return NextResponse.json({ error: "Responsabilidade não encontrada" }, { status: 404 })
      }

      return NextResponse.json({ responsibility }, { status: 200 })
    }

    return NextResponse.json({ error: "Ação não suportada" }, { status: 400 })
  } catch (error) {
    console.error("Erro ao atualizar responsabilidade:", error)
    return NextResponse.json({ error: "Erro ao atualizar responsabilidade" }, { status: 500 })
  }
}

// DELETE: Excluir uma responsabilidade
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    const success = deleteResponsibility(id)

    if (!success) {
      return NextResponse.json({ error: "Responsabilidade não encontrada" }, { status: 404 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Erro ao excluir responsabilidade:", error)
    return NextResponse.json({ error: "Erro ao excluir responsabilidade" }, { status: 500 })
  }
}
