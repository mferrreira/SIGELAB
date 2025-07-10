"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useProject } from "@/lib/project-context"
import { useTask } from "@/lib/task-context"
import { AppHeader } from "@/components/app-header"
import { ProjectList } from "@/components/project-list"
import { ProjectDetailDialog } from "@/components/ui/project-detail-dialog"
import { ProjectDialog } from "@/components/project-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Plus, 
  Search, 
  Filter, 
  BarChart3, 
  Calendar, 
  Users, 
  CheckCircle2,
  Clock,
  AlertCircle,
  Archive
} from "lucide-react"
import type { Project } from "@/lib/types"

export default function ProjetosPage() {
  const { user } = useAuth()
  const { projects, loading } = useProject()
  const { tasks } = useTask()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)

  // Filter projects based on search and status
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || project.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Get project statistics
  const getProjectStats = (projectId: string) => {
    const projectTasks = tasks.filter(task => task.projectId === projectId)
    const totalTasks = projectTasks.length
    const completedTasks = projectTasks.filter(task => task.status === "completed").length
    const pendingTasks = projectTasks.filter(task => task.status === "pending").length
    const inProgressTasks = projectTasks.filter(task => task.status === "in_progress").length
    
    return {
      total: totalTasks,
      completed: completedTasks,
      pending: pendingTasks,
      inProgress: inProgressTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    }
  }

  // Overall statistics
  const overallStats = {
    total: projects.length,
    active: projects.filter(p => p.status === "active").length,
    completed: projects.filter(p => p.status === "completed").length,
    archived: projects.filter(p => p.status === "archived").length,
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === "completed").length
  }

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project)
    setIsDetailDialogOpen(true)
  }

  const handleEditProject = (project: Project) => {
    setEditingProject(project)
    setIsProjectDialogOpen(true)
  }

  const handleDeleteProject = async (projectId: number) => {
    if (confirm("Tem certeza que deseja excluir este projeto?")) {
      try {
        // This will be handled by the ProjectDetailDialog
        setIsDetailDialogOpen(false)
      } catch (error) {
        console.error("Erro ao excluir projeto:", error)
      }
    }
  }

  const handleCreateProject = () => {
    setEditingProject(null)
    setIsProjectDialogOpen(true)
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col">
        <AppHeader />
        <main className="flex-1 container mx-auto p-4 md:p-6">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Faça login para acessar os projetos</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Projetos</h1>
              <p className="text-muted-foreground">
                Organize e acompanhe todos os projetos do laboratório
              </p>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Projetos</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overallStats.total}</div>
                  <p className="text-xs text-muted-foreground">
                    {overallStats.active} ativos, {overallStats.completed} concluídos
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overallStats.active}</div>
                  <p className="text-xs text-muted-foreground">
                    Em desenvolvimento
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Tarefas</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overallStats.totalTasks}</div>
                  <p className="text-xs text-muted-foreground">
                    {overallStats.completedTasks} concluídas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {overallStats.totalTasks > 0 
                      ? Math.round((overallStats.completedTasks / overallStats.totalTasks) * 100) 
                      : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Geral dos projetos
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar projetos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full md:w-64"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="completed">Concluídos</SelectItem>
                  <SelectItem value="archived">Arquivados</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm">
                {filteredProjects.length} projeto{filteredProjects.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </div>

          {/* Projects Content */}
          <Tabs defaultValue="list" className="space-y-4">
            <TabsList>
              <TabsTrigger value="list">Lista de Projetos</TabsTrigger>
              <TabsTrigger value="grid">Visualização em Grid</TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="space-y-4">
              <ProjectList />
            </TabsContent>

            <TabsContent value="grid" className="space-y-4">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredProjects.map((project) => {
                  const stats = getProjectStats(project.id)
                                     return (
                     <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                           onClick={() => handleProjectClick(project)}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-lg line-clamp-2">{project.name}</CardTitle>
                            <CardDescription>
                              Criado em {new Date(project.createdAt).toLocaleDateString("pt-BR")}
                            </CardDescription>
                          </div>
                          <Badge 
                            className={
                              project.status === "active" ? "bg-green-100 text-green-800" :
                              project.status === "completed" ? "bg-blue-100 text-blue-800" :
                              "bg-gray-100 text-gray-800"
                            }
                          >
                            {project.status === "active" ? "Ativo" :
                             project.status === "completed" ? "Concluído" : "Arquivado"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {project.description && (
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {project.description}
                          </p>
                        )}
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progresso:</span>
                            <span className="font-medium">{stats.completionRate}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${stats.completionRate}%` }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="text-center">
                            <div className="font-semibold text-blue-600">{stats.total}</div>
                            <div className="text-muted-foreground">Total</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-green-600">{stats.completed}</div>
                            <div className="text-muted-foreground">Concluídas</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-orange-600">{stats.pending + stats.inProgress}</div>
                            <div className="text-muted-foreground">Pendentes</div>
                          </div>
                        </div>

                        <div className="text-xs text-muted-foreground">
                          Criado por: {project.createdBy}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {filteredProjects.length === 0 && (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhum projeto encontrado</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      {searchTerm || statusFilter !== "all" 
                        ? "Tente ajustar os filtros de busca."
                        : "Comece criando seu primeiro projeto para organizar as atividades do laboratório."
                      }
                    </p>
                  </CardContent>
                </Card>
              )}
                         </TabsContent>
           </Tabs>
         </div>

         {/* Dialogs */}
         <ProjectDetailDialog
           project={selectedProject}
           open={isDetailDialogOpen}
           onOpenChange={setIsDetailDialogOpen}
           onEditProject={handleEditProject}
           onDeleteProject={handleDeleteProject}
         />

         <ProjectDialog
           open={isProjectDialogOpen}
           onOpenChange={setIsProjectDialogOpen}
           project={editingProject}
         />
       </main>
     </div>
   )
 }
