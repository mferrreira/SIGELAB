import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Testa conexão com o banco
    await prisma.$queryRaw`SELECT 1`
    
    return NextResponse.json({ 
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: "connected"
    })
  } catch (error) {
    console.error("Health check failed:", error)
    
    return NextResponse.json(
      { 
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        database: "disconnected",
        error: "Database connection failed"
      },
      { status: 503 }
    )
  }
}
