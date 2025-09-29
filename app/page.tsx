"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { LabResponsibilityStatus } from "@/components/features/lab-responsibility-status"
import { AppHeader } from "@/components/layout/app-header"

export default function Home() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push("/dashboard")
    } else {
      router.push("/login")
    }
  }, [user, router])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-4 text-center">Sistema de Gerenciamento de Tarefas</h1>
        <div className="mb-8">
          <LabResponsibilityStatus />
        </div>
        <p className="text-muted-foreground text-center">Redirecionando...</p>
      </div>
    </main>
  )
}
