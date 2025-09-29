import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { WeeklyHoursHistoryController } from "@/backend/controllers/WeeklyHoursHistoryController"

const weeklyHoursHistoryController = new WeeklyHoursHistoryController()

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const user = session.user as any
    console.log('🔍 Weekly Hours History API - User session:', {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: user.roles,
      rolesType: typeof user.roles,
      isArray: Array.isArray(user.roles)
    })
    
    if (!user.roles || !Array.isArray(user.roles)) {
      console.log('❌ User roles is not an array:', user.roles)
      return NextResponse.json({ error: 'Roles não encontradas na sessão.' }, { status: 403 });
    }
    
    if (!user.roles.includes('COORDENADOR') && !user.roles.includes('GERENTE')) {
      console.log('❌ User does not have required roles:', user.roles)
      return NextResponse.json({ error: 'Apenas coordenadores e gerentes podem acessar.' }, { status: 403 });
    }
    
    console.log('✅ User has permission, proceeding...')

    const { searchParams } = new URL(request.url)
    const weekStart = searchParams.get("weekStart")
    const userId = searchParams.get("userId")
    const stats = searchParams.get("stats")

    if (stats === "true") {
      const weeklyStats = await weeklyHoursHistoryController.getWeeklyStats()
      return NextResponse.json({ stats: weeklyStats })
    }

    if (weekStart) {
      const history = await weeklyHoursHistoryController.getHistoryByWeek(new Date(weekStart))
      return NextResponse.json({ history })
    }

    if (userId) {
      const history = await weeklyHoursHistoryController.getHistoryByUser(Number(userId))
      return NextResponse.json({ history })
    }

    const history = await weeklyHoursHistoryController.getAllHistory()
    return NextResponse.json({ history })
  } catch (error: any) {
    console.error("Erro na API de histórico de horas semanais:", error)
    return NextResponse.json(
      { error: error.message || "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const user = session.user as any
    console.log('🔍 Weekly Hours History POST - User session:', {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: user.roles,
      rolesType: typeof user.roles,
      isArray: Array.isArray(user.roles)
    })
    
    if (!user.roles || !Array.isArray(user.roles)) {
      console.log('❌ User roles is not an array:', user.roles)
      return NextResponse.json({ error: 'Roles não encontradas na sessão.' }, { status: 403 });
    }
    
    if (!user.roles.includes('COORDENADOR') && !user.roles.includes('GERENTE')) {
      console.log('❌ User does not have required roles:', user.roles)
      return NextResponse.json({ error: 'Apenas coordenadores e gerentes podem acessar.' }, { status: 403 });
    }
    
    console.log('✅ User has permission for POST, proceeding...')

    const body = await request.json()
    const { action } = body

    if (action === "reset") {
      const results = await weeklyHoursHistoryController.resetWeeklyHours()
      return NextResponse.json({ 
        message: "Horas semanais resetadas com sucesso",
        results 
      })
    }

    if (action === "create_week_history") {
      const { weekStart } = body
      if (!weekStart) {
        return NextResponse.json({ error: "weekStart é obrigatório" }, { status: 400 })
      }
      
      const results = await weeklyHoursHistoryController.createWeekHistory(new Date(weekStart))
      return NextResponse.json({ 
        message: "Histórico semanal criado com sucesso",
        results 
      })
    }

    return NextResponse.json({ error: "Ação não reconhecida" }, { status: 400 })
  } catch (error: any) {
    console.error("Erro na API de histórico de horas semanais:", error)
    return NextResponse.json(
      { error: error.message || "Erro interno do servidor" },
      { status: 500 }
    )
  }
} 