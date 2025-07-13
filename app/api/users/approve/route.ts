import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// GET: Get pending users for approval
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const user = session.user as any
    
    // Only admins and laboratorists can see pending users
    if (user.role !== "administrador_laboratorio" && user.role !== "laboratorista") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    const pendingUsers = await prisma.users.findMany({
      where: { status: "pending" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        weekHours: true,
        createdAt: true
      },
      orderBy: { createdAt: "asc" }
    })

    return NextResponse.json({ pendingUsers }, { status: 200 })
  } catch (error) {
    console.error("Erro ao buscar usuários pendentes:", error)
    return NextResponse.json({ error: "Erro ao buscar usuários pendentes" }, { status: 500 })
  }
}

// POST: Approve or reject a user
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const user = session.user as any
    
    // Only admins and laboratorists can approve users
    if (user.role !== "administrador_laboratorio" && user.role !== "laboratorista") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    const body = await request.json()
    const { userId, action } = body

    if (!userId || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "ID do usuário e ação são obrigatórios" }, { status: 400 })
    }

    const status = action === "approve" ? "active" : "rejected"
    
    const updatedUser = await prisma.users.update({
      where: { id: Number(userId) },
      data: { status },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true
      }
    })

    return NextResponse.json({ 
      user: updatedUser, 
      message: action === "approve" ? "Usuário aprovado com sucesso" : "Usuário rejeitado"
    }, { status: 200 })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }
    console.error("Erro ao aprovar/rejeitar usuário:", error)
    return NextResponse.json({ error: "Erro ao processar solicitação" }, { status: 500 })
  }
} 