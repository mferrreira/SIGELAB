import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { LaboratoryScheduleController } from "@/backend/controllers/LaboratoryScheduleController"

const laboratoryScheduleController = new LaboratoryScheduleController();

export async function GET() {
  try {
    const schedules = await laboratoryScheduleController.getAllSchedules();
    return NextResponse.json({ 
      schedules: schedules.map(schedule => schedule.toJSON()) 
    });
  } catch (error: any) {
    console.error('Erro ao buscar horários do laboratório:', error);
    return NextResponse.json({ 
      error: error.message || 'Erro ao buscar horários do laboratório' 
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const data = await request.json();
    const user = session.user as any;
    
    const schedule = await laboratoryScheduleController.createSchedule({
      ...data,
      userId: user.id
    });
    
    return NextResponse.json({ schedule: schedule.toJSON() }, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar horário do laboratório:', error);
    return NextResponse.json({ 
      error: error.message || 'Erro ao criar horário do laboratório' 
    }, { status: 500 });
  }
} 