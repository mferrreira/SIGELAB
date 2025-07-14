import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { LaboratoryScheduleController } from "@/backend/controllers/LaboratoryScheduleController"
import { prisma } from "@/lib/prisma"

const laboratoryScheduleController = new LaboratoryScheduleController();

// PUT: Update a laboratory schedule
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  return laboratoryScheduleController.updateLabSchedule(request, params);
}

// DELETE: Delete a laboratory schedule
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  return laboratoryScheduleController.deleteLabSchedule(request, params);
} 