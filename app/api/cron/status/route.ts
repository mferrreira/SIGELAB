import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { cronService } from "@/lib/services/cron-service";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const user = session.user as any;
    if (!user.roles?.includes('COORDENADOR')) {
      return NextResponse.json({ error: 'Apenas coordenadores podem acessar.' }, { status: 403 });
    }

    const status = cronService.getStatus();
    return NextResponse.json({ status });
  } catch (error: any) {
    console.error("Erro ao buscar status do cron:", error);
    return NextResponse.json(
      { error: error.message || "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const user = session.user as any;
    if (!user.roles?.includes('COORDENADOR')) {
      return NextResponse.json({ error: 'Apenas coordenadores podem acessar.' }, { status: 403 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === "manual-reset") {
      await cronService.executeManualReset();
      return NextResponse.json({ 
        message: "Reset manual executado com sucesso"
      });
    }

    return NextResponse.json({ error: "Ação não reconhecida" }, { status: 400 });
  } catch (error: any) {
    console.error("Erro ao executar ação do cron:", error);
    return NextResponse.json(
      { error: error.message || "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
