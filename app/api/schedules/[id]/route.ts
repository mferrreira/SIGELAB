import { NextResponse } from "next/server"
import { UserScheduleController } from "@/backend/controllers/UserScheduleController"
import { handlePrismaError, createApiResponse, createApiError } from "@/lib/utils/utils"

const userScheduleController = new UserScheduleController();

// GET: Obter um horário específico
export async function GET(context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  return userScheduleController.getSchedule(Number(params.id));
}

// PUT: Atualizar um horário
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  return userScheduleController.updateSchedule(Number(params.id), request);
}

// DELETE: Excluir um horário
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  return userScheduleController.deleteSchedule(Number(params.id));
} 