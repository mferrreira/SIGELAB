import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { LabEventController } from '@/backend/controllers/LabEventController';

const labEventController = new LabEventController();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const day = searchParams.get('day');
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    
    if (!day || !month || !year) {
      return NextResponse.json({ error: 'day, month e year são obrigatórios' }, { status: 400 });
    }
    
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    const events = await labEventController.getEventsByDate(date);
    
    return NextResponse.json({ events: events.map(event => event.toJSON()) });
  } catch (error: any) {
    console.error("Erro ao buscar eventos:", error);
    return NextResponse.json({ error: error.message || "Erro ao buscar eventos" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }
    
    const body = await request.json();
    const { date, note } = body;
    
    if (!date || !note) {
      return NextResponse.json({ error: 'date e note são obrigatórios' }, { status: 400 });
    }
    
    const user = session.user as any;
    const event = await labEventController.createEvent({
      userId: user.id,
      userName: user.name,
      date: new Date(date),
      note,
    });
    
    return NextResponse.json({ event: event.toJSON() }, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao criar evento:", error);
    return NextResponse.json({ error: error.message || "Erro ao criar evento" }, { status: 500 });
  }
} 