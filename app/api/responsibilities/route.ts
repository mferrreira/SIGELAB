import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { LabResponsibilityController } from "@/backend/controllers/LabResponsibilityController"

const labResponsibilityController = new LabResponsibilityController();

// GET: Obter todas as responsabilidades ou filtrar por período
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const active = searchParams.get("active")

    if (active === "true") {
      // Obter apenas a responsabilidade ativa
      const activeResponsibility = await labResponsibilityController.getActiveResponsibility()
      if (activeResponsibility) {
        return NextResponse.json({
          activeResponsibility: activeResponsibility.toJSON()
        }, { status: 200 })
      } else {
        return NextResponse.json({ activeResponsibility: null }, { status: 200 })
      }
    } else if (startDate && endDate) {
      // Filtrar por período
      const responsibilities = await labResponsibilityController.getResponsibilitiesByDateRange(
        new Date(startDate),
        new Date(endDate)
      )
      return NextResponse.json({ 
        responsibilities: responsibilities.map(r => r.toJSON()) 
      }, { status: 200 })
    } else {
      // Obter todas
      const responsibilities = await labResponsibilityController.getAllResponsibilities()
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

    const responsibility = await labResponsibilityController.startResponsibility(
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
