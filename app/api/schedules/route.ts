import { NextResponse } from "next/server"
import { UserScheduleController } from "@/backend/controllers/UserScheduleController"
import { handlePrismaError, createApiResponse, createApiError } from "@/contexts/utils"

const userScheduleController = new UserScheduleController();

// GET: Obter todos os horários ou filtrar por usuário
export async function GET() {
  try {
    const schedules = await userScheduleController.getAllSchedules();
    return new Response(JSON.stringify({ schedules }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error: any) {
    console.error('Erro ao buscar horários:', error);
    return new Response(JSON.stringify({ error: 'Erro ao buscar horários', details: error?.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

// POST: Criar um novo horário
export async function POST(request: Request) {
  return userScheduleController.createSchedule(request);
} 