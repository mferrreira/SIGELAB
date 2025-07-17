import { NextResponse } from "next/server"
import { prisma } from "@/lib/database/prisma"

// GET: Obter todas as responsabilidades ou filtrar por período
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const active = searchParams.get("active")

    if (active === "true") {
      // Obter apenas a responsabilidade ativa (sem endTime) com informações do usuário
      const activeResponsibility = await prisma.lab_responsibilities.findFirst({
        where: { endTime: null },
        include: {
          user: true,
        },
        orderBy: { startTime: "desc" },
      })
      if (activeResponsibility) {
        const startTime = new Date(activeResponsibility.startTime).getTime()
        const now = new Date().getTime()
        const duration = Math.floor((now - startTime) / 1000)
        return NextResponse.json({
          activeResponsibility: {
            ...activeResponsibility,
            duration,
            userRole: activeResponsibility.user?.roles || "nenhuma",
          },
        }, { status: 200 })
      } else {
        return NextResponse.json({ activeResponsibility: null }, { status: 200 })
      }
    } else if (startDate && endDate) {
      // Filtrar por período
      const responsibilities = await prisma.lab_responsibilities.findMany({
        where: {
          startTime: { gte: startDate },
          endTime: { lte: endDate },
        },
        orderBy: { startTime: "desc" },
      })
      return NextResponse.json({ responsibilities }, { status: 200 })
    } else {
      // Obter todas
      const responsibilities = await prisma.lab_responsibilities.findMany({
        orderBy: { startTime: "desc" },
      })
      return NextResponse.json({ responsibilities }, { status: 200 })
    }
  } catch (error) {
    console.error("Erro ao buscar responsabilidades:", error)
    return NextResponse.json({ error: "Erro ao buscar responsabilidades" }, { status: 500 })
  }
}

// POST: Iniciar uma nova responsabilidade
export async function POST(request: Request) {
  try {
    const body = await request.json()
    if (!body.userId || !body.userName) {
      return NextResponse.json({ error: "ID do usuário e nome são obrigatórios" }, { status: 400 })
    }

    // Verificar se o usuário tem permissão para iniciar responsabilidade
    const user = await prisma.users.findUnique({
      where: { id: Number(body.userId) }
    })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    if (!user.roles.includes("COORDENADOR") && !user.roles.includes("GERENTE")) {
      return NextResponse.json({ error: "Apenas coordenadores e gerentes podem iniciar responsabilidades" }, { status: 403 })
    }

    const responsibility = await prisma.lab_responsibilities.create({
      data: {
        userId: Number(body.userId),
        userName: body.userName,
        startTime: new Date().toISOString(),
        endTime: null,
        notes: body.notes || "",
      },
    })
    return NextResponse.json({ responsibility }, { status: 201 })
  } catch (error) {
    console.error("Erro ao iniciar responsabilidade:", error)
    return NextResponse.json({ error: "Erro ao iniciar responsabilidade" }, { status: 500 })
  }
}
