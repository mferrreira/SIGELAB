import { NextResponse } from "next/server"
import { UserScheduleController } from "@/backend/controllers/UserScheduleController"

const userScheduleController = new UserScheduleController();

// GET: Obter um horário específico
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = parseInt(params.id);

    const schedule = await userScheduleController.getSchedule(id);
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

    const schedule = await userScheduleController.updateSchedule(id, body);
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

    await userScheduleController.deleteSchedule(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro ao excluir horário:", error);
    return NextResponse.json({ error: error.message || "Erro ao excluir horário" }, { status: 500 });
  }
}