import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { LabResponsibilityService } from "@/backend/services/LabResponsibilityService";
import { UserRepository } from "@/backend/repositories/UserRepository";
import { LabResponsibilityRepository } from "@/backend/repositories/LabResponsibilityRepository";

const labResponsibilityService = new LabResponsibilityService(
  new LabResponsibilityRepository(),
  new UserRepository(),
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const active = searchParams.get("active")

    if (active === "true") {
      // Obter apenas a responsabilidade ativa
      const activeResponsibility = await labResponsibilityService.getActiveResponsibility()
      if (activeResponsibility) {
        return NextResponse.json({
          activeResponsibility: activeResponsibility.toJSON()
        }, { status: 200 })
      } else {
        return NextResponse.json({ activeResponsibility: null }, { status: 200 })
      }
    } else if (startDate && endDate) {
      // Filtrar por período
      const responsibilities = await labResponsibilityService.getResponsibilitiesByDateRange(
        new Date(startDate),
        new Date(endDate)
      )
      return NextResponse.json({ 
        responsibilities: responsibilities.map(r => r.toJSON()) 
      }, { status: 200 })
    } else {
      // Obter todas
      const responsibilities = await labResponsibilityService.findAll()
      return NextResponse.json({ 
        responsibilities: responsibilities.map(r => r.toJSON()) 
      }, { status: 200 })
    }
  } catch (error: any) {
    console.error("Erro ao buscar responsabilidades:", error)
    return NextResponse.json({ 
      error: error.message || "Erro ao buscar responsabilidades" 
    }, { status: 500 })
  }
}

// POST: Iniciar uma nova responsabilidade
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json()
    if (!body.userId || !body.userName) {
      return NextResponse.json({ error: "ID do usuário e nome são obrigatórios" }, { status: 400 })
    }

    const responsibility = await labResponsibilityService.startResponsibility(
      Number(body.userId),
      body.userName,
      body.notes || ""
    )
    
    return NextResponse.json({ 
      responsibility: responsibility.toJSON() 
    }, { status: 201 })
  } catch (error: any) {
    console.error("Erro ao iniciar responsabilidade:", error)
    return NextResponse.json({ 
      error: error.message || "Erro ao iniciar responsabilidade" 
    }, { status: 500 })
  }
}
