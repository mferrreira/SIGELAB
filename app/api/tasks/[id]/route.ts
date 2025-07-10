import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET: Obter uma tarefa específica
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)
    const task = await prisma.tasks.findUnique({ 
      where: { id },
      include: {
        assignee: true,
        projectObj: true,
      },
    })
    if (!task) {
      return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 })
    }
    return NextResponse.json({ task }, { status: 200 })
  } catch (error) {
    console.error("Erro ao buscar tarefa:", error)
    return NextResponse.json({ error: "Erro ao buscar tarefa" }, { status: 500 })
  }
}

// PUT: Atualizar uma tarefa
export async function PUT(request: Request, context: { params: { id: string } }) {
  try {
    const { params } = context;
    const id = parseInt(params.id);
    const body = await request.json();

    // Get the current task to check its previous status
    const currentTask = await prisma.tasks.findUnique({
      where: { id },
      include: {
        assignee: true,
        projectObj: true,
      },
    });

    if (!currentTask) {
      return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 });
    }

    // Prepare update data, removing fields not in the Prisma model
    const updateData: any = { ...body };
    delete updateData.assignedTo;
    delete updateData.project;

    // Handle assignee relation
    if (body.assignedTo) {
      updateData.assignee = { connect: { id: parseInt(body.assignedTo) } };
    } else if (body.assignedTo === null) {
      updateData.assignee = { disconnect: true };
    }
    // Handle projectObj relation
    if (body.project) {
      updateData.projectObj = { connect: { id: parseInt(body.project) } };
    } else if (body.project === null) {
      updateData.projectObj = { disconnect: true };
    }

    // Check if task is being moved to "done" status for the first time
    const isMovingToDone = body.status === "done" && currentTask.status !== "done";
    const isMovingFromDone = currentTask.status === "done" && body.status !== "done";

    // If moving to done for the first time, award points
    if (isMovingToDone && currentTask.assignedTo && currentTask.points && currentTask.points > 0) {
      // Check if points were already awarded (using completed flag as a safeguard)
      if (!currentTask.completed) {
        // Award points to the assigned user
        await prisma.users.update({
          where: { id: currentTask.assignedTo },
          data: { 
            points: { increment: currentTask.points },
            completedTasks: { increment: 1 }
          },
        });

        // Mark task as completed to prevent future point awards
        updateData.completed = true;
        
        console.log(`Points awarded: ${currentTask.points} points to user ${currentTask.assignedTo} for task ${id}`);
      }
    }

    // If moving from done to another status, don't deduct points (prevents exploitation)
    if (isMovingFromDone) {
      console.log(`Task ${id} moved from done to ${body.status} - no points deducted (anti-exploitation measure)`);
    }

    const updatedTask = await prisma.tasks.update({
      where: { id },
      data: updateData,
      include: {
        assignee: true,
        projectObj: true,
      },
    });

    return NextResponse.json({ task: updatedTask }, { status: 200 });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 });
    }
    console.error("Erro ao atualizar tarefa:", error);
    return NextResponse.json({ error: "Erro ao atualizar tarefa" }, { status: 500 });
  }
}

// PATCH: Marcar uma tarefa como concluída
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)
    const body = await request.json()
    if (body.action === "complete") {
      // Buscar a tarefa atual
      const task = await prisma.tasks.findUnique({ 
        where: { id },
        include: {
          assignee: true,
          projectObj: true,
        },
      })
      if (!task) {
        return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 })
      }
      if (task.completed) {
        return NextResponse.json({ task }, { status: 200 }) // Já concluída
      }
      // Marcar como concluída
      const completedTask = await prisma.tasks.update({
        where: { id },
        data: { completed: true, status: "done" },
        include: {
          assignee: true,
          projectObj: true,
        },
      })
      // Adicionar pontos ao usuário atribuído
      if (task.assignedTo && task.points && task.points > 0) {
        await prisma.users.update({
          where: { id: task.assignedTo },
          data: { points: { increment: task.points } },
        })
      }
      return NextResponse.json({ task: completedTask }, { status: 200 })
    }
    return NextResponse.json({ error: "Ação não suportada" }, { status: 400 })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 })
    }
    console.error("Erro ao processar ação na tarefa:", error)
    return NextResponse.json({ error: "Erro ao processar ação na tarefa" }, { status: 500 })
  }
}

// DELETE: Excluir uma tarefa
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)
    await prisma.tasks.delete({ where: { id } })
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 })
    }
    console.error("Erro ao excluir tarefa:", error)
    return NextResponse.json({ error: "Erro ao excluir tarefa" }, { status: 500 })
  }
}
