"use client"

import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { ModernButton } from "@/components/ui/modern-button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { KanbanSquare, User, FolderKanban, Trophy, ShoppingBag, Clock, FileText } from "lucide-react"
import { useUser } from "@/contexts/user-context"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { MobileMenu } from "@/components/layout/mobile-menu"
import { usePathname } from "next/navigation"
import { ACCESS_CONTROL, hasAccess } from "@/lib/utils/utils"

export function AppHeader() {
  const { user, logout } = useAuth()
  const { users } = useUser()
  const pathname = usePathname()

  // Encontrar usuário atual para obter pontos
  const currentUserData = user ? users.find((u) => u.id === user.id) : null

  //

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {/* Mobile Menu */}
          <MobileMenu />
          <Link href="/dashboard" className={`flex items-center gap-2 hover:opacity-80 transition-opacity ${pathname === "/dashboard" ? "bg-accent text-accent-foreground px-3 py-2 rounded-md" : ""}`}>
            <KanbanSquare className="h-5 w-5 text-primary" />
            <span className="font-semibold text-lg hidden sm:inline">SIGELAB</span>
            <span className="font-semibold text-lg sm:hidden">SIGELAB</span>
          </Link>

          {/* Desktop Navigation - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-2">

            {/* Link para leaderboard (todos os usuários) */}
            <Link
              href="/dashboard/leaderboard"
              className={`text-sm flex items-center gap-1 transition-colors duration-200 px-3 py-2 rounded-md ${pathname.startsWith("/dashboard/leaderboard") ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent hover:text-accent-foreground"}`}
            >
              <Trophy className="h-5 w-5" />
              Ranking
            </Link>

            {/* Link para loja (todos os usuários) */}
            <Link
              href="/dashboard/loja"
              className={`text-sm flex items-center gap-1 transition-colors duration-200 px-3 py-2 rounded-md ${pathname.startsWith("/dashboard/loja") ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent hover:text-accent-foreground"}`}
            >
              <ShoppingBag className="h-5 w-5" />
              Loja
            </Link>

            {/* Link para responsabilidade do laboratório (todos os usuários) */}
            <Link
              href="/dashboard/laboratorio"
              className={`text-sm flex items-center gap-1 transition-colors duration-200 px-3 py-2 rounded-md ${pathname.startsWith("/dashboard/laboratorio") ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent hover:text-accent-foreground"}`}
            >
              <Clock className="h-5 w-5" />
              Laboratório
            </Link>

            {/* Future pages for laboratorists and admins */}
            {hasAccess(user?.roles || [], 'DASHBOARD_PROJETOS') && (
              <Link
                href="/dashboard/projetos"
                className={`text-sm flex items-center gap-1 transition-colors duration-200 px-3 py-2 rounded-md ${pathname.startsWith("/dashboard/projetos") ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent hover:text-accent-foreground"}`}
              >
                <FolderKanban className="h-5 w-5" />
                Projetos
              </Link>
            )}
            
            {/* Weekly Reports for admins and laboratorists */}
            {hasAccess(user?.roles || [], 'DASHBOARD_WEEKLY_REPORTS') && (
              <Link
                href="/dashboard/weekly-reports"
                className={`text-sm flex items-center gap-1 transition-colors duration-200 px-3 py-2 rounded-md ${pathname.startsWith("/dashboard/weekly-reports") 
                  ? "bg-accent text-accent-foreground" 
                  : "text-black dark:text-white/80 hover:text-black dark:hover:text-white hover:bg-accent hover:text-accent-foreground"}`}
              >
                <FileText className="h-5 w-5" />
                Relatórios Semanais
              </Link>
            )}
            
            {hasAccess(user?.roles || [], 'DASHBOARD_ADMIN') && (
              <Link
                href="/dashboard/admin"
                className={`text-sm flex items-center gap-1 transition-colors duration-200 px-3 py-2 rounded-md ${pathname.startsWith("/dashboard/admin") ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent hover:text-accent-foreground"}`}
              >
                <User className="h-5 w-5" />
                Painel Administrativo
              </Link>
            )}
            {/* Useful future pages for all users */}
            <Link
              href="/dashboard/profile"
              className={`text-sm flex items-center gap-1 transition-colors duration-200 px-3 py-2 rounded-md ${pathname.startsWith("/dashboard/profile") ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent hover:text-accent-foreground"}`}
            >
              <User className="h-5 w-5" />
              Perfil
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">

          
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
                  <User className="h-5 w-5" />
                  {user?.name}
                </ModernButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user?.name}</span>
                    <span className="text-xs text-muted-foreground">{user?.email}</span>
                    <span className="text-xs font-normal mt-1 capitalize">
                      {user?.roles.includes("GERENTE_PROJETO") ? "Gerente de Projeto" : user?.roles.includes("COORDENADOR") ? "Coordenador" : user?.roles.includes("LABORATORISTA") ? "Laboratorista" : user?.roles.includes("VOLUNTARIO") ? "Voluntário" : "Usuário"}
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
