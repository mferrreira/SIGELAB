import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// GET: Obter todos os projetos com filtro baseado no papel do usuário
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const userEmail = typeof session?.user?.email === "string" ? session.user.email : undefined
    if (!userEmail) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }
    
    // Cast session user to include custom fields
    const sessionUser = session?.user as any

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

    // Role-based filtering
    if (user.role === "laboratorista" || user.role === "administrador_laboratorio") {
      // Laboratorists and admins see all projects
      projects = await prisma.projects.findMany({
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true
                }
              }
            }
          },
          _count: {
            select: {
              tasks: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      })
    } else if (user.role === "gerente_projeto" || user.role === "voluntario") {
      // Project managers and volunteers see projects they're members of or created
      const userProjectIds = user.projectMemberships.map((membership: any) => membership.project.id)
      
      // For project managers, also include projects they created
      if (user.role === "gerente_projeto") {
        const createdProjects = await prisma.projects.findMany({
          where: { createdBy: user.id },
          select: { id: true }
        })
        const createdProjectIds = createdProjects.map(p => p.id)
        userProjectIds.push(...createdProjectIds)
      }
      
      projects = await prisma.projects.findMany({
        where: {
          id: {
            in: userProjectIds
          }
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true
                }
              }
            }
          },
          _count: {
            select: {
              tasks: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      })
    }

    return NextResponse.json({ projects }, { status: 200 })
  } catch (error) {
    console.error("Erro ao buscar projetos:", error)
    return NextResponse.json({ error: "Erro ao buscar projetos" }, { status: 500 })
  }
}

// POST: Criar um novo projeto
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    // Cast session user to include custom fields
    const sessionUser = session?.user as any
    
    if (!sessionUser?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    if (!body.name) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 })
    }

    const user = await prisma.users.findUnique({
      where: { id: sessionUser.id }
    })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Only laboratorists, admins, and project managers can create projects
    if (!["laboratorista", "administrador_laboratorio", "gerente_projeto"].includes(user.role)) {
      return NextResponse.json({ error: "Sem permissão para criar projetos" }, { status: 403 })
    }

    const project = await prisma.projects.create({
      data: {
        name: body.name,
        description: body.description || "",
        createdAt: new Date().toISOString(),
        createdBy: sessionUser.id,
        status: body.status || "active",
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Automatically add the creator as a project manager member
    await prisma.project_members.create({
      data: {
        projectId: project.id,
        userId: sessionUser.id,
        role: "gerente_projeto"
      }
    })

    return NextResponse.json({ project }, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar projeto:", error)
    return NextResponse.json({ error: "Erro ao criar projeto" }, { status: 500 })
  }
}
