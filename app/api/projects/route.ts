import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET: Obter todos os projetos
export async function GET() {
  try {
    const projects = await prisma.projects.findMany()
    return NextResponse.json({ projects }, { status: 200 })
  } catch (error) {
    console.error("Erro ao buscar projetos:", error)
    return NextResponse.json({ error: "Erro ao buscar projetos" }, { status: 500 })
  }
}

// POST: Criar um novo projeto
export async function POST(request: Request) {
  try {
    const body = await request.json()
    if (!body.name || !body.createdBy) {
      return NextResponse.json({ error: "Nome e criador são obrigatórios" }, { status: 400 })
    }
    const project = await prisma.projects.create({
      data: {
        name: body.name,
        description: body.description || "",
        createdAt: new Date().toISOString(),
        createdBy: body.createdBy,
        status: body.status || "active",
      },
    })
    return NextResponse.json({ project }, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar projeto:", error)
    return NextResponse.json({ error: "Erro ao criar projeto" }, { status: 500 })
  }
}
