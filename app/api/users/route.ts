import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import crypto from "crypto"

// GET: Obter todos os usuários ou apenas pendentes
export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const status = url.searchParams.get("status")
    let users
    if (status) {
      users = await prisma.users.findMany({ where: { status } })
    } else {
      users = await prisma.users.findMany()
    }
    return NextResponse.json({ users }, { status: 200 })
  } catch (error) {
    console.error("Erro ao buscar usuários:", error)
    return NextResponse.json({ error: "Erro ao buscar usuários" }, { status: 500 })
  }
}

// POST: Criar um novo usuário (status: pending)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = body.email?.toLowerCase()
    if (!body.name || !email || !body.role || !body.password) {
      return NextResponse.json({ error: "Nome, email, senha e função são obrigatórios" }, { status: 400 })
    }
    const validRoles = ["admin", "laboratorist", "responsible", "volunteer"]
    if (!validRoles.includes(body.role)) {
      return NextResponse.json({ error: "Função inválida" }, { status: 400 })
    }
    // Check if user already exists by email
    let existingUser = null
    try {
      existingUser = await prisma.users.findUnique({ where: { email } })
    } catch (e) {
      console.error("Erro ao buscar usuário existente:", e)
    }
    if (existingUser) {
      return NextResponse.json({ error: "Email já está em uso" }, { status: 400 })
    }
    const hashedPassword = await bcrypt.hash(body.password, 10)
    const user = await prisma.users.create({
      data: {
        name: body.name,
        email,
        role: body.role,
        password: hashedPassword,
        // points, completedTasks, and status will use their defaults
      },
    })
    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar usuário:", error)
    return NextResponse.json({ error: "Erro ao criar usuário" }, { status: 500 })
  }
}

// PATCH: Aprovar ou rejeitar usuário
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, action } = body
    if (!id || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "ID e ação são obrigatórios" }, { status: 400 })
    }
    const status = action === "approve" ? "active" : "rejected"
    const user = await prisma.users.update({
      where: { id: Number(id) },
      data: { status },
    })
    return NextResponse.json({ user }, { status: 200 })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }
    console.error("Erro ao atualizar status do usuário:", error)
    return NextResponse.json({ error: "Erro ao atualizar status do usuário" }, { status: 500 })
  }
}
