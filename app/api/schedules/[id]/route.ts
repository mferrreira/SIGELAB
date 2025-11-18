import { NextResponse } from "next/server"
import { UserScheduleService } from "@/backend/services/UserScheduleService";
import { UserScheduleRepository } from "@/backend/repositories/UserScheduleRepository";
import { UserRepository } from "@/backend/repositories/UserRepository";

const userScheduleService = new UserScheduleService(
  new UserScheduleRepository(),
  new UserRepository(),
)

// GET: Obter um horário específico
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = parseInt(params.id);

    const schedule = await userScheduleService.findById(id);
    if (!schedule) {
      return NextResponse.json({ error: "Horário não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ schedule });
  } catch (error) {
    console.error("Erro ao buscar horário:", error);
    return NextResponse.json({ error: "Erro ao buscar horário" }, { status: 500 });
  }
}

// PUT: Atualizar um horário
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = parseInt(params.id);
    const body = await request.json();

    const schedule = await userScheduleService.update(id, body);
    return NextResponse.json({ schedule });
  } catch (error: any) {
    console.error("Erro ao atualizar horário:", error);
    return NextResponse.json({ error: error.message || "Erro ao atualizar horário" }, { status: 500 });
  }
}

// DELETE: Excluir um horário
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = parseInt(params.id);

    await userScheduleService.delete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro ao excluir horário:", error);
    return NextResponse.json({ error: error.message || "Erro ao excluir horário" }, { status: 500 });
  }
}