import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

import { UserScheduleService } from "@/backend/services/UserScheduleService";
import { UserScheduleRepository } from "@/backend/repositories/UserScheduleRepository";
import { UserRepository } from "@/backend/repositories/UserRepository";

const userScheduleService = new UserScheduleService(
  new UserScheduleRepository(),
  new UserRepository(),
)
// GET: Obter todos os horários ou filtrar por usuário
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    let schedules;
    if (userId) {
      schedules = await userScheduleService.getSchedulesByUser(parseInt(userId));
    } else {
      schedules = await userScheduleService.findAll();
    }
    
    return NextResponse.json({ 
      schedules: schedules.map(schedule => schedule.toJSON()) 
    });
  } catch (error: any) {
    console.error('Erro ao buscar horários:', error);
    return NextResponse.json({ 
      error: error.message || 'Erro ao buscar horários' 
    }, { status: 500 });
  }
}

// POST: Criar um novo horário
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const data = await request.json();
    const user = session.user as any;
    
    const schedule = await userScheduleService.create({
      ...data,
      userId: data.userId || user.id
    });
    
    return NextResponse.json({ 
      schedule: schedule.toJSON() 
    }, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar horário:', error);
    return NextResponse.json({ 
      error: error.message || 'Erro ao criar horário' 
    }, { status: 400 });
  }
} 