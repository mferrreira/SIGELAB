import { NextResponse } from "next/server"
import {
  getAllResponsibilities,
  getResponsibilitiesByPeriod,
  getActiveResponsibility,
  startResponsibility,
} from "@/lib/db/responsibilities"

// GET: Obter todas as responsabilidades ou filtrar por período
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const active = searchParams.get("active")

    let responsibilities

    if (active === "true") {
      // Obter apenas a responsabilidade ativa
      const activeResponsibility = getActiveResponsibility()

      if (activeResponsibility) {
        // Calcular a duração em segundos
        const startTime = new Date(activeResponsibility.startTime).getTime()
        const now = new Date().getTime()
        const duration = Math.floor((now - startTime) / 1000)

        return NextResponse.json(
          {
            activeResponsibility: {
              ...activeResponsibility,
              duration,
            },
          },
          { status: 200 },
        )
      } else {
        return NextResponse.json({ activeResponsibility: null }, { status: 200 })
      }
    } else if (startDate && endDate) {
      // Filtrar por período
      responsibilities = getResponsibilitiesByPeriod(startDate, endDate)
    } else {
      // Obter todas
      responsibilities = getAllResponsibilities()
    }

    return NextResponse.json({ responsibilities }, { status: 200 })
  } catch (error) {
    console.error("Erro ao buscar responsabilidades:", error)
    return NextResponse.json({ error: "Erro ao buscar responsabilidades" }, { status: 500 })
  }
}

// POST: Iniciar uma nova responsabilidade
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validar dados
    if (!body.userId || !body.userName) {
      return NextResponse.json({ error: "ID do usuário e nome são obrigatórios" }, { status: 400 })
    }

    // Iniciar nova responsabilidade
    const responsibility = startResponsibility(body.userId, body.userName, body.notes)

    return NextResponse.json({ responsibility }, { status: 201 })
  } catch (error) {
    console.error("Erro ao iniciar responsabilidade:", error)
    return NextResponse.json({ error: "Erro ao iniciar responsabilidade" }, { status: 500 })
  }
}
