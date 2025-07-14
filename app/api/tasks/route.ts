import { NextResponse } from "next/server"
import { VolunteerController } from "@/backend/controllers/VolunteerController"
import { prisma } from "@/lib/prisma"

const volunteerController = new VolunteerController();

// GET: Obter tarefas filtradas por usuário e papel
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const role = searchParams.get("role")

    // If project manager, return all tasks for projects they are a member of
    if (userId && role === "gerente_projeto") {
      // Find all projects where this user is a member
      const projectMemberships = await prisma.project_members.findMany({ where: { userId: Number(userId) } })
      const projectIds = projectMemberships.map((m) => m.projectId)
      // Get all tasks for these projects (including completed and public)
      const tasks = await prisma.tasks.findMany({
        where: { projectId: { in: projectIds } },
        include: { assignee: true, projectObj: true },
        orderBy: { id: 'desc' }
      })
      return NextResponse.json({ tasks })
    }

    // For volunteers, show assigned and public tasks
    if (userId && role === "voluntario") {
      const assignedTasks = await prisma.tasks.findMany({
        where: { assignedTo: Number(userId) },
        include: { assignee: true, projectObj: true },
        orderBy: { id: 'desc' },
      })
      const publicTasks = await prisma.tasks.findMany({
        where: { assignedTo: null, taskVisibility: "public" },
        include: { assignee: true, projectObj: true },
        orderBy: { id: 'desc' },
      })
      // Merge and deduplicate by id
      const allTasks = [...assignedTasks, ...publicTasks].filter((task, idx, arr) => arr.findIndex(t => t.id === task.id) === idx)
      return NextResponse.json({ tasks: allTasks })
    }

    // Otherwise, use Prisma directly for all tasks
    const tasks = await prisma.tasks.findMany({
      include: { assignee: true, projectObj: true },
      orderBy: { id: 'desc' }
    })
    return NextResponse.json({ tasks })
  } catch (error) {
    console.error("Erro ao buscar tarefas:", error)
    return NextResponse.json({ error: "Erro ao buscar tarefas" }, { status: 500 })
  }
}

// POST: Criar uma nova tarefa
export async function POST(request: Request) {
  try {
    const body = await request.json()
    // Map assignedTo and remove extra fields
    const {
      title,
      description,
      status,
      priority,
      assignedTo,
      projectId,
      dueDate,
      points,
      completed,
      taskVisibility
    } = body
    const task = await prisma.tasks.create({
      data: {
        title,
        description,
        status,
        priority,
        assignedTo,
        projectId,
        dueDate,
        points,
        completed,
        taskVisibility
      },
    })
    return NextResponse.json({ task }, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar tarefa:", error)
    return NextResponse.json({ error: "Erro ao criar tarefa" }, { status: 500 })
  }
}
