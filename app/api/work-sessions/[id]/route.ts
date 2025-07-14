import { WorkSessionController } from "@/backend/controllers/WorkSessionController"

const workSessionController = new WorkSessionController();

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await request.json();
    const id = Number(params.id);
    const session = await workSessionController.updateSession(id, data);
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

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    await workSessionController.deleteSession(id);
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