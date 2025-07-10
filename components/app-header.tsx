"use client"

import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { ModernButton } from "@/components/ui/modern-button"
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
import { ThemeToggle } from "@/components/theme-toggle"
import { MobileMenu } from "@/components/mobile-menu"

export function AppHeader() {
  const { user, logout } = useAuth()
  const { users } = useUser()

  // Encontrar usuário atual para obter pontos
  const currentUserData = user ? users.find((u) => u.id === user.id) : null

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <KanbanSquare className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg hidden sm:inline">Gerenciador de Tarefas</span>
            <span className="font-semibold text-lg sm:hidden">Gerenciador</span>
          </Link>

          {/* Desktop Navigation - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-2">
            {/* Mostrar link para projetos apenas para gerentes */}
            {user?.role === "manager" && (
              <Link
                href="/dashboard/projetos"
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors duration-200 hover:bg-accent hover:text-accent-foreground px-3 py-2 rounded-md"
              >
                <FolderKanban className="h-4 w-4" />
                Projetos
              </Link>
            )}

            {/* Link para leaderboard (todos os usuários) */}
            <Link
              href="/dashboard/leaderboard"
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors duration-200 hover:bg-accent hover:text-accent-foreground px-3 py-2 rounded-md"
            >
              <Trophy className="h-4 w-4" />
              Ranking
            </Link>

            {/* Link para loja (todos os usuários) */}
            <Link
              href="/dashboard/loja"
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors duration-200 hover:bg-accent hover:text-accent-foreground px-3 py-2 rounded-md"
            >
              <ShoppingBag className="h-4 w-4" />
              Loja
            </Link>

            {/* Link para responsabilidade do laboratório (todos os usuários) */}
            <Link
              href="/dashboard/laboratorio"
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors duration-200 hover:bg-accent hover:text-accent-foreground px-3 py-2 rounded-md"
            >
              <Clock className="h-4 w-4" />
              Laboratório
            </Link>

            {/* Future pages for laboratorists and admins */}
            {(user?.role === "laboratorist" || user?.role === "admin") && (
              <Link
                href="/dashboard/projetos"
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors duration-200 hover:bg-accent hover:text-accent-foreground px-3 py-2 rounded-md"
              >
                <FolderKanban className="h-4 w-4" />
                Projetos
              </Link>
            )}
            {user?.role === "admin" && (
              <Link
                href="/dashboard/admin"
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors duration-200 hover:bg-accent hover:text-accent-foreground px-3 py-2 rounded-md"
              >
                <User className="h-4 w-4" />
                Admin Dashboard
              </Link>
            )}
            {/* Useful future pages for all users */}
            <Link
              href="/dashboard/profile"
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors duration-200 hover:bg-accent hover:text-accent-foreground px-3 py-2 rounded-md"
            >
              <User className="h-4 w-4" />
              Perfil
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Mobile Menu */}
          <MobileMenu />
          
          {/* Desktop Controls */}
          <div className="hidden md:flex items-center gap-4">
            
            {currentUserData && (
              <div className="text-sm mr-2">
                <span className="font-medium bg-gradient-to-r from-amber-400 to-orange-400 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                  {currentUserData.points} pontos
                </span>
              </div>
            )}
            
            <ThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <ModernButton variant="outline" size="sm" className="gap-2 hover:bg-accent hover:text-accent-foreground transition-colors duration-200">
                  <User className="h-4 w-4" />
                  {user?.name}
                </ModernButton>
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
                      <span className="text-xs font-medium mt-1 bg-gradient-to-r from-amber-400 to-orange-400 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
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
      </div>
    </header>
  )
}
