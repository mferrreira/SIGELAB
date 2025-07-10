import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import type { NextRequest } from "next/server"

export async function getUserFromRequest(req: NextRequest) {
  const session = await getServerSession(authOptions)
  return session?.user || null
}

export function hasRole(user: any, roles: string | string[]): boolean {
  if (!user) return false
  if (Array.isArray(roles)) {
    return roles.includes(user.role)
  }
  return user.role === roles
} 