import { NextResponse } from "next/server"
import { UserScheduleController } from "@/backend/controllers/UserScheduleController"
import { handlePrismaError, createApiResponse, createApiError } from "@/contexts/utils"

const userScheduleController = new UserScheduleController();

// GET: Obter um horário específico
export async function GET({ params }: { params: { id: string } }) {
  return userScheduleController.getSchedule(Number(params.id));
}

// PUT: Atualizar um horário
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  return userScheduleController.updateSchedule(Number(params.id), request);
}

// DELETE: Excluir um horário
export async function DELETE({ params }: { params: { id: string } }) {
  return userScheduleController.deleteSchedule(Number(params.id));
} 