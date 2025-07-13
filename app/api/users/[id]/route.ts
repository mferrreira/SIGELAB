import { NextResponse } from "next/server"
import { UserService } from "@/lib/services/user-service"
import { handlePrismaError, createApiResponse, createApiError } from "@/lib/utils"

// GET: Obter um usuário específico
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id)
    const user = await UserService.getUser(id)
    return createApiResponse({ user })
  } catch (error: any) {
    console.error("Erro ao buscar usuário:", error)
    
    if (error.message === "Usuário não encontrado") {
      return createApiError(error.message, 404)
    }
    
    return createApiError("Erro ao buscar usuário")
  }
}

// PUT: Atualizar um usuário
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id)
    const body = await request.json()

    const user = await UserService.updateUser(id, body)
    return createApiResponse({ user })
  } catch (error: any) {
    console.error("Erro ao atualizar usuário:", error)
    
    // Handle validation errors
    if (error.message.includes("obrigatório") || error.message.includes("inválido") || error.message.includes("já está em uso")) {
      return createApiError(error.message, 400)
    }
    
    // Handle not found errors
    if (error.message === "Usuário não encontrado") {
      return createApiError(error.message, 404)
    }
    
    // Handle Prisma errors
    if (error.code) {
      const { status, message } = handlePrismaError(error)
      return createApiError(message, status)
    }
    
    return createApiError("Erro ao atualizar usuário")
  }
}

// PATCH: Adicionar pontos a um usuário
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id)
    const body = await request.json()
    
    if (body.action === "addPoints" && typeof body.points === "number") {
      const user = await UserService.addPoints(id, body.points)
      return createApiResponse({ user })
    }
    
    return createApiError("Ação não suportada", 400)
  } catch (error: any) {
    console.error("Erro ao processar ação no usuário:", error)
    
    // Handle validation errors
    if (error.message.includes("maiores que zero")) {
      return createApiError(error.message, 400)
    }
    
    // Handle not found errors
    if (error.message === "Usuário não encontrado") {
      return createApiError(error.message, 404)
    }
    
    // Handle Prisma errors
    if (error.code) {
      const { status, message } = handlePrismaError(error)
      return createApiError(message, status)
    }
    
    return createApiError("Erro ao processar ação no usuário")
  }
}
