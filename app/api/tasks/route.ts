import { NextResponse } from "next/server"
import { TaskController } from "@/backend/controllers/TaskController"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

const taskController = new TaskController();

// GET: Obter tarefas baseado no usuário logado
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userId = parseInt((session.user as any).id);
    const userRoles = (session.user as any).roles || [];
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    
    let tasks
    if (projectId) {
      // Buscar tasks do projeto específico
      const projectTasks = await taskController.getTasksByProject(parseInt(projectId))
      // Buscar tasks globais/públicas
      const allTasks = await taskController.getTasksForUser(userId, userRoles)
      const globalTasks = allTasks.filter(task => task.isGlobal || task.taskVisibility === 'public')
      // Combinar tasks do projeto + tasks globais
      tasks = [...projectTasks, ...globalTasks]
      // Remover duplicatas baseado no ID
      const uniqueTasks = tasks.filter((task, index, self) => 
        index === self.findIndex(t => t.id === task.id)
      )
      tasks = uniqueTasks
    } else {
      // Filtrar tarefas baseado no usuário e suas permissões
      tasks = await taskController.getTasksForUser(userId, userRoles)
    }
    
    return NextResponse.json({ tasks: tasks.map(task => task.toJSON()) })
  } catch (error) {
    console.error("Erro ao buscar tarefas:", error)
    return NextResponse.json({ error: "Erro ao buscar tarefas" }, { status: 500 })
  }
}

// POST: Criar uma nova tarefa
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json()

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
      taskVisibility,
      isGlobal
    } = body

    const task = await taskController.createTask({
      title,
      description,
      status,
      priority,
      assignedTo,
      projectId,
      dueDate,
      points,
      completed,
      taskVisibility,
      isGlobal
    }, parseInt((session.user as any).id));

    return NextResponse.json({ task: task.toJSON() }, { status: 201 })
  } catch (error: any) {
    console.error("Erro ao criar tarefa:", error)
    return NextResponse.json({ error: error.message || "Erro ao criar tarefa" }, { status: 500 })
  }
}
