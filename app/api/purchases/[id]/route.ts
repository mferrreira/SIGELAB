import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { createApiResponse, createApiError } from "@/lib/utils"

// GET: Obter uma compra específica
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return createApiError("Não autenticado", 401)
    }

    const id = parseInt(params.id)
    if (!id) {
      return createApiError("ID inválido", 400)
    }

    const purchase = await prisma.purchases.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        reward: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true
          }
        }
      }
    })

    if (!purchase) {
      return createApiError("Compra não encontrada", 404)
    }

    return createApiResponse({ purchase })
  } catch (error) {
    console.error("Erro ao buscar compra:", error)
    return createApiError("Erro interno do servidor", 500)
  }
}

// PATCH: Aprovar ou negar uma compra
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return createApiError("Não autenticado", 401)
    }

    // Cast session user to include custom fields
    const sessionUser = session?.user as any

    // Only laboratorists and admins can approve/deny purchases
    if (!["laboratorista", "administrador_laboratorio"].includes(sessionUser.role)) {
      return createApiError("Sem permissão para aprovar/negar compras", 403)
    }

    const id = parseInt(params.id)
    if (!id) {
      return createApiError("ID inválido", 400)
    }

    const body = await request.json()
    const { action } = body

    if (!action || !["approve", "deny"].includes(action)) {
      return createApiError("Ação inválida. Use 'approve' ou 'deny'", 400)
    }

    // Get the purchase with user and reward info
    const purchase = await prisma.purchases.findUnique({
      where: { id },
      include: {
        user: true,
        reward: true
      }
    })

    if (!purchase) {
      return createApiError("Compra não encontrada", 404)
    }

    if (purchase.status !== "pending") {
      return createApiError("Compra já foi processada", 400)
    }

    let updatedPurchase

    if (action === "approve") {
      // Approve the purchase - no need to refund points since they were already deducted
      updatedPurchase = await prisma.purchases.update({
        where: { id },
        data: { status: "approved" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          reward: {
            select: {
              id: true,
              name: true,
              description: true,
              price: true
            }
          }
        }
      })
    } else {
      // Deny the purchase - refund the points
      updatedPurchase = await prisma.$transaction(async (tx) => {
        // Refund points to user
        await tx.users.update({
          where: { id: purchase.userId },
          data: { points: { increment: purchase.price } }
        })

        // Update purchase status
        return await tx.purchases.update({
          where: { id },
          data: { status: "denied" },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            },
            reward: {
              select: {
                id: true,
                name: true,
                description: true,
                price: true
              }
            }
          }
        })
      })
    }

    return createApiResponse({ purchase: updatedPurchase })
  } catch (error) {
    console.error("Erro ao processar compra:", error)
    return createApiError("Erro interno do servidor", 500)
  }
}
