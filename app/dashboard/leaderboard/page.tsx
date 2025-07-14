"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { AppHeader } from "@/components/app-header"
import { useUser } from "@/contexts/user-context"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Medal, Award, Star } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function LeaderboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { users } = useUser()

  useEffect(() => {
    // Redirecionar para login se não estiver autenticado
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Carregando...</p>
      </div>
    )
  }

  // Ordenar usuários por pontos (decrescente)
  const sortedUsers = [...users].sort((a, b) => (b.points ?? 0) - (a.points ?? 0))

  // Encontrar a posição do usuário atual
  const currentUserRank = sortedUsers.findIndex((u) => u.id === user.id) + 1

  // Obter as iniciais do nome do usuário
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  // Obter ícone para os 3 primeiros colocados
  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-700" />
      default:
        return <span className="text-sm font-medium">{position}</span>
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <h1 className="text-2xl font-bold mb-6">Ranking de Usuários</h1>

        {/* Card destacando a posição do usuário atual */}
        <Card className="mb-8 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Sua Posição</CardTitle>
            <CardDescription>Veja como você está se saindo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground">
                  {getRankIcon(currentUserRank)}
                </div>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{currentUserRank}º lugar</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                <span className="text-xl font-bold text-amber-600 dark:text-amber-400">
                  {sortedUsers.find((u) => u.id === user.id)?.points || 0}
                </span>
                <span className="text-sm text-muted-foreground">pontos</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de classificação */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Posição</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Tarefas Concluídas</TableHead>
                <TableHead className="text-right">Pontos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedUsers.map((rankedUser, index) => (
                <TableRow key={rankedUser.id} className={rankedUser.id === user.id ? "bg-primary/5" : ""}>
                  <TableCell className="font-medium">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full">
                      {getRankIcon(index + 1)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{getInitials(rankedUser.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{rankedUser.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {rankedUser.role === "gerente_projeto" ? "Gerente de Projeto" : 
                 rankedUser.role === "laboratorista" ? "Laboratorista" :
                 rankedUser.role === "administrador_laboratorio" ? "Administrador de Laboratório" :
                 rankedUser.role === "voluntario" ? "Voluntário" : "Usuário"}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{rankedUser.completedTasks}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Star className="h-4 w-4 text-amber-500" />
                      <span className="font-bold text-amber-600 dark:text-amber-400">{rankedUser.points}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  )
}
