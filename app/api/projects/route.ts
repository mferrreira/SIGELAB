import { NextResponse } from "next/server"
import { prisma } from "@/lib/database/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { ProjectController } from "@/backend/controllers/ProjectController"
import { hasAccess } from "@/lib/utils/access-control"

const projectController = new ProjectController();

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const userEmail = typeof session?.user?.email === "string" ? session.user.email : undefined
    if (!userEmail) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const user = await prisma.users.findUnique({
      where: { email: userEmail },
      include: {
        projectMemberships: {
          include: {
            project: true
          }
        }
      }
    })
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    let projects: any[] = []

    if (user.roles && hasAccess(user.roles, "MANAGE_TASKS")) {
      // User can see all projects
      projects = await projectController.getAllProjects()
    } else {
      // User can only see projects they're a member of or created
      const userProjects = await projectController.getProjectsByUser(user.id)
      const createdProjects = await projectController.getProjectsByCreator(user.id)
      
      // Merge and deduplicate projects
      const allProjects = [...userProjects, ...createdProjects]
      const uniqueProjects = allProjects.filter((project, index, self) => 
        index === self.findIndex(p => p.id === project.id)
      )
      projects = uniqueProjects
    }
    
    return NextResponse.json({ projects }, { status: 200 })
  } catch (error) {
    console.error("Erro ao buscar projetos:", error)
    return NextResponse.json({ error: "Erro ao buscar projetos" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const sessionUser = session?.user as any
    if (!sessionUser?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }
    
    const body = await request.json()
    if (!body.name) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 })
    }

    // Use new controller for project creation
    const project = await projectController.createProject({
      name: body.name,
      description: body.description || "",
      status: body.status || "active",
      links: body.links || [],
    }, sessionUser.id);

    return NextResponse.json({ project }, { status: 201 })
  } catch (error: any) {
    console.error("Erro ao criar projeto:", error)
    
    // Handle validation errors specifically
    if (error.message && error.message.includes('Dados inválidos')) {
      return NextResponse.json({ 
        error: error.message 
      }, { status: 400 })
    }
    
    return NextResponse.json({ 
      error: error.message || "Erro ao criar projeto" 
    }, { status: 500 })
  }
}
