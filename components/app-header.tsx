"use client"

import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { KanbanSquare, User, FolderKanban, Trophy, ShoppingBag, Clock } from "lucide-react"
import { useUser } from "@/lib/user-context"

export function AppHeader() {
  const { user, logout } = useAuth()
  const { users } = useUser()

  // Encontrar usuário atual para obter pontos
  const currentUserData = user ? users.find((u) => u.id === user.id) : null

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <KanbanSquare className="h-6 w-6" />
            <span className="font-semibold">Gerenciador de Tarefas</span>
          </Link>

          {/* Mostrar link para projetos apenas para gerentes */}
          {user?.role === "manager" && (
            <Link
              href="/dashboard/projetos"
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <FolderKanban className="h-4 w-4" />
              Projetos
            </Link>
          )}

          {/* Link para leaderboard (todos os usuários) */}
          <Link
            href="/dashboard/leaderboard"
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <Trophy className="h-4 w-4" />
            Ranking
          </Link>

          {/* Link para loja (todos os usuários) */}
          <Link
            href="/dashboard/loja"
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <ShoppingBag className="h-4 w-4" />
            Loja
          </Link>

          {/* Link para responsabilidade do laboratório (todos os usuários) */}
          <Link
            href="/dashboard/laboratorio"
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <Clock className="h-4 w-4" />
            Laboratório
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {currentUserData && (
            <div className="text-sm mr-2">
              <span className="font-medium text-amber-600 dark:text-amber-400">{currentUserData.points} pontos</span>
            </div>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <User className="h-4 w-4" />
                {user?.name}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{user?.name}</span>
                  <span className="text-xs text-muted-foreground">{user?.email}</span>
                  <span className="text-xs font-normal mt-1 capitalize">
                    {user?.role === "manager" ? "Gerente" : "Usuário"}
                  </span>
                  {currentUserData && (
                    <span className="text-xs font-medium mt-1 text-amber-600 dark:text-amber-400">
                      {currentUserData.points} pontos
                    </span>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/loja">Meus Prêmios</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout}>Sair</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
