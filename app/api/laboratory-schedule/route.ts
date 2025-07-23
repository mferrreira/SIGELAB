import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { LaboratoryScheduleController } from "@/backend/controllers/LaboratoryScheduleController"

const laboratoryScheduleController = new LaboratoryScheduleController();

// GET: Get all laboratory schedules
export async function GET() {
  try {
    const schedules = await laboratoryScheduleController.getAllSchedules();
    return new Response(JSON.stringify({ schedules }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error: any) {
    console.error('Erro ao buscar horários do laboratório:', error);
    return new Response(JSON.stringify({ error: 'Erro ao buscar horários do laboratório', details: error?.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

// POST: Create a new laboratory schedule
export async function POST(request: Request) {
  const data = await request.json();
  return NextResponse.json(await laboratoryScheduleController.createSchedule(data));
} 