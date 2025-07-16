import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { LaboratoryScheduleController } from "@/backend/controllers/LaboratoryScheduleController"
import { prisma } from "@/lib/prisma"

const laboratoryScheduleController = new LaboratoryScheduleController();

// PUT: Update a laboratory schedule
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const body = await request.json();
  return laboratoryScheduleController.updateSchedule(Number(params.id), body);
}

// DELETE: Delete a laboratory schedule
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  return laboratoryScheduleController.deleteSchedule(Number(params.id));
} 