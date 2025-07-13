import { NextResponse } from "next/server"
import { UserService } from "@/lib/services/user-service"
import { handlePrismaError, createApiResponse, createApiError } from "@/lib/utils"

// GET: Obter todos os usuários ou apenas pendentes
export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const status = url.searchParams.get("status")

    const users = await UserService.getUsers(status || undefined)
    return createApiResponse({ users })
  } catch (error) {
    console.error("Erro ao buscar usuários:", error)
    return createApiError("Erro ao buscar usuários")
  }
}

// POST: Criar um novo usuário (status: pending)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, role, password, weekHours } = body

    const user = await UserService.createUser({
      name,
      email: email?.toLowerCase(),
      role,
      password,
      weekHours,
    })

    return createApiResponse({ user }, 201)
  } catch (error: any) {
    console.error("Erro ao criar usuário:", error)
    
    // Handle validation errors
    if (error.message.includes("obrigatório") || error.message.includes("inválido") || error.message.includes("já está em uso")) {
      return createApiError(error.message, 400)
    }
    
    // Handle Prisma errors
    if (error.code) {
      const { status, message } = handlePrismaError(error)
      return createApiError(message, status)
    }
    
    return createApiError("Erro ao criar usuário")
  }
}

// PATCH: Aprovar ou rejeitar usuário
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, action } = body

    if (!id || !["approve", "reject"].includes(action)) {
      return createApiError("ID e ação são obrigatórios", 400)
    }

    const user = await UserService.updateUserStatus(Number(id), action as "approve" | "reject")
    return createApiResponse({ user })
  } catch (error: any) {
    console.error("Erro ao atualizar status do usuário:", error)
    
    // Handle not found errors
    if (error.message === "Usuário não encontrado") {
      return createApiError(error.message, 404)
    }
    
    // Handle Prisma errors
    if (error.code) {
      const { status, message } = handlePrismaError(error)
      return createApiError(message, status)
    }
    
    return createApiError("Erro ao atualizar status do usuário")
  }
}
