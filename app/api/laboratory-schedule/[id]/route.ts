import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { LaboratoryScheduleController } from "@/backend/controllers/LaboratoryScheduleController"

const laboratoryScheduleController = new LaboratoryScheduleController();

// PUT: Update a laboratory schedule
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const params = await context.params;
    const body = await request.json();
    const user = session.user as any;
    
    const schedule = await laboratoryScheduleController.updateSchedule(Number(params.id), {
      ...body,
      userId: user.id
    });
    
    return NextResponse.json({ schedule: schedule.toJSON() });
  } catch (error: any) {
    console.error('Erro ao atualizar horário do laboratório:', error);
    return NextResponse.json({ 
      error: error.message || 'Erro ao atualizar horário do laboratório' 
    }, { status: 500 });
  }
}

// DELETE: Delete a laboratory schedule
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const params = await context.params;
    await laboratoryScheduleController.deleteSchedule(Number(params.id));
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao excluir horário do laboratório:', error);
    return NextResponse.json({ 
      error: error.message || 'Erro ao excluir horário do laboratório' 
    }, { status: 500 });
  }
} 