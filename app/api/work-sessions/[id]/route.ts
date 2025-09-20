import { WorkSessionController } from "@/backend/controllers/WorkSessionController"

const workSessionController = new WorkSessionController();

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const data = await request.json();
    const id = Number(params.id);
    const userId = Number(data.userId) || 0; // Should be provided in request body
    
    
    const session = await workSessionController.updateSession(id, userId, {
      activity: data.activity,
      location: data.location,
      status: data.status,
      endTime: data.endTime
    });
    
    return new Response(JSON.stringify({ data: session }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error: any) {
    console.error('Erro ao atualizar sessão de trabalho:', error);
    return new Response(JSON.stringify({ error: 'Erro ao atualizar sessão de trabalho', details: error?.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const data = await request.json();
    const id = Number(params.id);
    const userId = Number(data.userId) || 0; // Should be provided in request body
    
    await workSessionController.deleteSession(id, userId);
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error: any) {
    console.error('Erro ao excluir sessão de trabalho:', error);
    return new Response(JSON.stringify({ error: 'Erro ao excluir sessão de trabalho', details: error?.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
} 