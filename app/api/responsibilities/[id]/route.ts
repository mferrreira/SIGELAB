import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { LabResponsibilityController } from "@/backend/controllers/LabResponsibilityController"

const labResponsibilityController = new LabResponsibilityController();

// PATCH: Encerrar uma responsabilidade ou atualizar notas
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const params = await context.params
    const id = parseInt(params.id)
    const body = await request.json()
    const user = session.user as any

    if (body.action === "end") {
      // Check if user can end this responsibility
      const canEnd = await labResponsibilityController.canUserEndResponsibility(user.id, id);
      if (!canEnd) {
        return NextResponse.json({ 
          error: "Apenas o laboratorista atual ou um administrador pode encerrar a responsabilidade" 
        }, { status: 403 });
      }

      const responsibility = await labResponsibilityController.endResponsibility(id, body.notes);
      return NextResponse.json({ responsibility: responsibility.toJSON() }, { status: 200 });
    } else if (body.action === "updateNotes" && body.notes !== undefined) {
      const responsibility = await labResponsibilityController.updateResponsibility(id, {
        userId: user.id,
        notes: body.notes
      });
      return NextResponse.json({ responsibility: responsibility.toJSON() }, { status: 200 });
    }

    return NextResponse.json({ error: "Ação não suportada" }, { status: 400 })
  } catch (error: any) {
    console.error("Erro ao atualizar responsabilidade:", error)
    return NextResponse.json({ 
      error: error.message || "Erro ao atualizar responsabilidade" 
    }, { status: 500 })
  }
}

// DELETE: Excluir uma responsabilidade
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const params = await context.params
    const id = parseInt(params.id)

    await labResponsibilityController.deleteResponsibility(id);
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error("Erro ao excluir responsabilidade:", error)
    return NextResponse.json({ 
      error: error.message || "Erro ao excluir responsabilidade" 
    }, { status: 500 })
  }
}
