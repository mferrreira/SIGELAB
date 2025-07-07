import { NextResponse } from "next/server"
import { getAllUsers, createUser, getUserByEmail } from "@/lib/db/users"

// GET: Obter todos os usuários
export async function GET() {
  try {
    const users = getAllUsers()

    // Em um ambiente de produção, você provavelmente não retornaria informações sensíveis
    const safeUsers = users.map(({ id, name, email, role, points, completedTasks }) => ({
      id,
      name,
      email,
      role,
      points,
      completedTasks,
    }))

    return NextResponse.json({ users: safeUsers }, { status: 200 })
  } catch (error) {
    console.error("Erro ao buscar usuários:", error)
    return NextResponse.json({ error: "Erro ao buscar usuários" }, { status: 500 })
  }
}

// POST: Criar um novo usuário
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validar dados
    if (!body.name || !body.email || !body.role) {
      return NextResponse.json({ error: "Nome, email e função são obrigatórios" }, { status: 400 })
    }

    // Verificar se o email já está em uso
    const existingUser = getUserByEmail(body.email)
    if (existingUser) {
      return NextResponse.json({ error: "Email já está em uso" }, { status: 400 })
    }

    // Criar novo usuário
    const user = createUser({
      name: body.name,
      email: body.email,
      role: body.role,
      points: 0,
      completedTasks: 0,
    })

    // Não retornar informações sensíveis
    const { id, name, email, role, points, completedTasks } = user

    return NextResponse.json(
      {
        user: { id, name, email, role, points, completedTasks },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Erro ao criar usuário:", error)
    return NextResponse.json({ error: "Erro ao criar usuário" }, { status: 500 })
  }
}
