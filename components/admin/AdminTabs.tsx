import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Activity, UserCheck, BarChart3, Clock, AlertCircle } from "lucide-react";
import { UserApproval } from "@/components/features/user-approval";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

const TIME_SLOTS = [
  { start: "07:00", end: "09:00" },
  { start: "09:00", end: "11:00" },
  { start: "11:00", end: "13:00" },
  { start: "13:00", end: "15:00" },
  { start: "15:00", end: "17:00" },
  { start: "17:00", end: "19:00" },
  { start: "19:00", end: "21:00" },

];
const WEEK_DAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

// Generate a subtle color for each user based on their id
function getUserColor(userId: number) {
  const colors = [
    "bg-blue-100 text-blue-900 border-blue-200",
    "bg-green-100 text-green-900 border-green-200",
    "bg-yellow-100 text-yellow-900 border-yellow-200",
    "bg-purple-100 text-purple-900 border-purple-200",
    "bg-pink-100 text-pink-900 border-pink-200",
    "bg-cyan-100 text-cyan-900 border-cyan-200",
    "bg-gray-100 text-gray-900 border-gray-200",
  ];
  return colors[userId % colors.length];
}

export const AdminTabs = ({
  users,
  projects,
  tasks,
  responsibilities,
  dailyLogs,
  sessions,
  stats,
  projectsWithProgress,
  usersByProject,
  recentResponsibilities,
  recentDailyLogs,
  weekSchedule,
  activeSessions,
  schedules
}: any) => {
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [saving, setSaving] = useState(false);
  // Schedule form: { dayOfWeek: number, startTime: string, endTime: string }[]
  const [userSchedule, setUserSchedule] = useState<{ dayOfWeek: number, startTime: string, endTime: string }[]>([]);
  // Schedules state (local, for demo)
  const [localSchedules, setLocalSchedules] = useState(schedules || []);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [error, setError] = useState("");

  // Fetch all schedules from API
  async function fetchSchedulesFromApi() {
    setLoadingSchedules(true);
    try {
      const res = await fetch("/api/schedules");
      const data = await res.json();
      setLocalSchedules(data.schedules || []);
    } catch (e) {
      setError("Erro ao buscar horários do servidor.");
    } finally {
      setLoadingSchedules(false);
    }
  }

  React.useEffect(() => {
    fetchSchedulesFromApi();
  }, []);

  // When user changes, reset schedule form
  React.useEffect(() => {
    setUserSchedule([]);
  }, [selectedUserId]);

  // Helper: find all schedules for a given day and time slot
  function getSchedulesForSlot(dayIndex: number, slot: { start: string; end: string }) {
    return (localSchedules || []).filter((s: any) => {
      if (s.dayOfWeek !== dayIndex) return false;
      // Check if the schedule overlaps with the slot
      return (
        s.startTime < slot.end &&
        s.endTime > slot.start
      );
    });
  }

  // Add or update a day in the schedule form
  const handleDayChange = (dayIdx: number, checked: boolean) => {
    if (checked) {
      setUserSchedule(prev => [...prev, { dayOfWeek: dayIdx, startTime: "09:00", endTime: "10:00" }]);
    } else {
      setUserSchedule(prev => prev.filter(s => s.dayOfWeek !== dayIdx));
    }
  };
  const handleTimeChange = (dayIdx: number, field: "startTime" | "endTime", value: string) => {
    setUserSchedule(prev => prev.map(s => s.dayOfWeek === dayIdx ? { ...s, [field]: value } : s));
  };

  // Calculate total scheduled hours for warning
  const selectedUser = users.find((u: any) => u.id === parseInt(selectedUserId));
  const totalScheduledMinutes = userSchedule.reduce((sum, s) => {
    const [sh, sm] = s.startTime.split(":").map(Number);
    const [eh, em] = s.endTime.split(":").map(Number);
    return sum + ((eh * 60 + em) - (sh * 60 + sm));
  }, 0);
  const totalScheduledHours = totalScheduledMinutes / 60;
  const requiredHours = selectedUser?.weekHours || 0;

  const handleSave = async () => {
    setSaving(true);
    setError("");
    if (!selectedUserId || isNaN(parseInt(selectedUserId))) {
      alert("Selecione um usuário válido.");
      setSaving(false);
      return;
    }
    try {
      // 1. Get all existing schedules for this user
      const userSchedules = localSchedules.filter((s: any) => s.userId === parseInt(selectedUserId));
      // 2. Delete all existing schedules for this user
      await Promise.all(userSchedules.map(async (s: any) => {
        await fetch(`/api/schedules/${s.id}`, { method: "DELETE" });
      }));
      // 3. POST each new schedule
      for (const s of userSchedule) {
        const userIdNum = parseInt(selectedUserId);
        if (!userIdNum || isNaN(userIdNum)) {
          alert("Usuário inválido.");
          setSaving(false);
          return;
        }
        const payload = {
          userId: userIdNum,
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime
        };
        await fetch("/api/schedules", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }
      // 4. Re-fetch all schedules
      await fetchSchedulesFromApi();
      setDialogOpen(false);
      setSelectedUserId("");
      setUserSchedule([]);
    } catch (e) {
      setError("Erro ao salvar horários. Tente novamente.");
      alert("Erro ao salvar horários. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Visão Geral</TabsTrigger>
        <TabsTrigger value="projects">Projetos</TabsTrigger>
        <TabsTrigger value="responsibilities">Responsabilidades</TabsTrigger>
        <TabsTrigger value="schedule">Horários</TabsTrigger>
        <TabsTrigger value="logs">Logs de Atividade</TabsTrigger>
        <TabsTrigger value="users">Usuários</TabsTrigger>
      </TabsList>
      {/* Overview Tab */}
      <TabsContent value="overview" className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Usuários em Sessão */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Usuários em Sessão
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(Array.isArray(activeSessions) ? activeSessions : []).length === 0 ? (
                <div className="text-muted-foreground text-sm">Nenhum usuário em sessão no momento.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Início</TableHead>
                      <TableHead>Duração</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(Array.isArray(activeSessions) ? activeSessions : []).map((session: any) => {
                      const start = new Date(session.startTime)
                      const now = new Date()
                      const diffMs = now.getTime() - start.getTime()
                      const diffH = Math.floor(diffMs / (1000 * 60 * 60))
                      const diffM = Math.floor((diffMs / (1000 * 60)) % 60)
                      return (
                        <TableRow key={session.id}>
                          <TableCell>{session.user?.name || session.userName}</TableCell>
                          <TableCell>{start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</TableCell>
                          <TableCell>{diffH > 0 ? `${diffH}h ` : ''}{diffM}min</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
          {/* Projetos com Progresso */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Progresso dos Projetos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {projectsWithProgress.map((project: any) => (
                <div key={project.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{project.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {project.completedTasks}/{project.totalTasks}
                    </span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{project.status}</span>
                    <span>{project.progress.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          {/* Atividades Recentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Atividades Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Responsabilidades Ativas</h4>
                  <div className="space-y-2">
                    {responsibilities
                      .filter((r: any) => !r.endTime)
                      .slice(0, 3)
                      .map((resp: any) => (
                        <div key={resp.id} className="flex justify-between items-center text-sm">
                          <span>{resp.userName}</span>
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(resp.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Logs Recentes</h4>
                  <div className="space-y-3">
                    {recentDailyLogs.slice(0, 3).map((log: any) => (
                      <div key={log.id} className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-sm">
                            {users.find((u: any) => u.id === log.userId)?.name}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {new Date(log.date).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        {log.note && (
                          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                            {log.note}
                          </p>
                        )}
                      </div>
                    ))}
                    {recentDailyLogs.length === 0 && (
                      <div className="text-center text-muted-foreground text-sm py-4">
                        Nenhum log de atividade recente
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
      {/* Projects Tab */}
      <TabsContent value="projects" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Detalhes dos Projetos</CardTitle>
            <CardDescription>Progresso e participantes de cada projeto</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Projeto</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progresso</TableHead>
                  <TableHead>Participantes</TableHead>
                  <TableHead>Tarefas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersByProject.map(({ project, users, totalTasks, completedTasks }: any) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell>
                      <Badge variant={project.status === "active" ? "default" : "secondary"}>
                        {project.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0} 
                          className="w-20 h-2" 
                        />
                        <span className="text-sm">
                          {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {users.map((user: any) => (
                          <Badge key={user.id} variant="outline" className="text-xs">
                            {user.name}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {completedTasks}/{totalTasks}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
      {/* Responsibilities Tab */}
      <TabsContent value="responsibilities" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Logs de Responsabilidades</CardTitle>
            <CardDescription>Histórico de responsabilidades do laboratório</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Início</TableHead>
                  <TableHead>Fim</TableHead>
                  <TableHead>Duração</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentResponsibilities.map((resp: any) => {
                  const startTime = new Date(resp.startTime)
                  const endTime = resp.endTime ? new Date(resp.endTime) : null
                  const duration = endTime 
                    ? Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60))
                    : null
                  return (
                    <TableRow key={resp.id}>
                      <TableCell className="font-medium">{resp.userName}</TableCell>
                      <TableCell>
                        {startTime.toLocaleString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        {endTime ? endTime.toLocaleString('pt-BR') : '-'}
                      </TableCell>
                      <TableCell>
                        {duration ? `${duration} min` : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={resp.endTime ? "default" : "secondary"}>
                          {resp.endTime ? "Concluída" : "Ativa"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
      {/* Schedule Tab */}
      <TabsContent value="schedule" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Grade Semanal de Horários
            </CardTitle>
            <CardDescription>Visualize todos os horários dos usuários na semana</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-end mb-2">
              <Button onClick={() => setDialogOpen(true)} variant="outline" size="sm">
                Definir dias e horários de um usuário
              </Button>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Definir dias e horários do usuário</DialogTitle>
                  <DialogDescription>
                    Selecione o usuário e defina os dias e horários em que ele estará no laboratório.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Usuário</label>
                    <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um usuário" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((u: any) => (
                          <SelectItem key={u.id} value={u.id.toString()}>{u.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {selectedUserId && (
                    <div className="space-y-2">
                      <div className="font-medium mb-1">Dias da semana</div>
                      <div className="grid grid-cols-2 gap-2">
                        {WEEK_DAYS.map((day, idx) => {
                          const checked = userSchedule.some(s => s.dayOfWeek === idx);
                          return (
                            <label key={day} className="flex items-center gap-2 min-w-0">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={e => handleDayChange(idx, e.target.checked)}
                              />
                              <span className="truncate">{day}</span>
                              {checked && (
                                <div className="flex flex-row items-center gap-1 flex-wrap min-w-0">
                                  <Input
                                    type="time"
                                    value={userSchedule.find(s => s.dayOfWeek === idx)?.startTime || ""}
                                    onChange={e => handleTimeChange(idx, "startTime", e.target.value)}
                                    className="w-24 min-w-0"
                                    style={{ maxWidth: 100 }}
                                  />
                                  <span>-</span>
                                  <Input
                                    type="time"
                                    value={userSchedule.find(s => s.dayOfWeek === idx)?.endTime || ""}
                                    onChange={e => handleTimeChange(idx, "endTime", e.target.value)}
                                    className="w-24 min-w-0"
                                    style={{ maxWidth: 100 }}
                                  />
                                </div>
                              )}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {selectedUser && (
                    <div className="mt-2">
                      <span className="text-xs text-muted-foreground">
                        Horas semanais obrigatórias: <b>{requiredHours.toFixed(1)}</b> | Horas agendadas: <b>{totalScheduledHours.toFixed(2)}</b>
                      </span>
                      {totalScheduledHours < requiredHours && (
                        <div className="mt-2 rounded-md border border-yellow-300 bg-yellow-50 px-3 py-2 flex items-center gap-2 text-yellow-800 text-xs">
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                          <span>O total de horas agendadas está abaixo do mínimo semanal para este usuário.</span>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSave} disabled={!selectedUserId || userSchedule.length === 0 || saving}>
                      {saving ? "Salvando..." : "Salvar"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <div className="overflow-x-auto">
              {loadingSchedules ? (
                <div className="text-center text-muted-foreground py-8">Carregando horários...</div>
              ) : (
                <table className="min-w-full border text-xs">
                  <thead>
                    <tr>
                      <th className="px-2 py-1 border-b bg-blue-50 text-left">Horário</th>
                      {WEEK_DAYS.map((day) => (
                        <th key={day} className="px-2 py-1 border-b bg-blue-50 text-center">{day}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {TIME_SLOTS.map((slot) => (
                      <tr key={slot.start + slot.end}>
                        <td className="px-2 py-1 border-r font-mono text-right align-top whitespace-nowrap">
                          {slot.start}<br />{slot.end}
                        </td>
                        {WEEK_DAYS.map((_, dayIdx) => {
                          // For this cell, show all schedules for this day that overlap with the slot
                          const slotSchedules = (localSchedules || []).filter((s: any) => {
                            if (s.dayOfWeek !== dayIdx) return false;
                            // Overlap: schedule.startTime < slot.end && schedule.endTime > slot.start
                            return s.startTime < slot.end && s.endTime > slot.start;
                          });
                          return (
                            <td key={dayIdx} className="px-1 py-1 border align-top min-w-[120px]">
                              {slotSchedules.length === 0 ? (
                                <span className="text-muted-foreground">-----</span>
                              ) : (
                                <div className="flex flex-col gap-1">
                                  {slotSchedules.map((s: any) => {
                                    const user = users.find((u: any) => u.id === s.userId);
                                    return (
                                      <div
                                        key={s.id}
                                        className={`rounded border px-2 py-1 text-xs font-medium ${getUserColor(s.userId)} flex items-center gap-1`}
                                      >
                                        <span>{user?.name || "Usuário"}</span>
                                        <span className="ml-1 text-[10px] text-muted-foreground">({s.startTime} - {s.endTime})</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      {/* Logs Tab */}
      <TabsContent value="logs" className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Logs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Logs de Atividade
              </CardTitle>
              <CardDescription>Registros detalhados das atividades dos membros</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Atividade</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dailyLogs
                    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 10)
                    .map((log: any) => {
                      const user = users.find((u: any) => u.id === log.userId)
                      return (
                        <TableRow key={log.id}>
                          <TableCell className="font-medium">
                            {user?.name || 'Usuário não encontrado'}
                          </TableCell>
                          <TableCell>
                            {new Date(log.date).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs">
                              {log.note ? (
                                <p className="text-sm line-clamp-2">{log.note}</p>
                              ) : (
                                <span className="text-muted-foreground text-sm">Sem descrição</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="default">Registrado</Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  {dailyLogs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        <div className="text-muted-foreground">
                          <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>Nenhum log de atividade encontrado</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          {/* Work Sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Sessões de Trabalho
              </CardTitle>
              <CardDescription>Histórico de sessões de timer dos membros</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Duração</TableHead>
                    <TableHead>Atividade</TableHead>
                    <TableHead>Local</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions
                    .filter(Boolean)
                    .sort((a: any, b: any) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
                    .slice(0, 10)
                    .map((session: any) => {
                      const user = users.find((u: any) => u.id === session.userId)
                      const startTime = new Date(session.startTime)
                      const endTime = session.endTime ? new Date(session.endTime) : null
                      const duration = endTime 
                        ? Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60))
                        : null
                      return (
                        <TableRow key={session.id}>
                          <TableCell className="font-medium">
                            {user?.name || 'Usuário não encontrado'}
                          </TableCell>
                          <TableCell>
                            {duration ? `${duration} min` : '-'}
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs">
                              {session.activity ? (
                                <p className="text-sm line-clamp-2">{session.activity}</p>
                              ) : (
                                <span className="text-muted-foreground text-sm">Trabalho geral</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {session.location ? (
                              <Badge variant="outline">{session.location}</Badge>
                            ) : (
                              <span className="text-muted-foreground text-sm">Não especificado</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={session.status === "completed" ? "default" : 
                                     session.status === "active" ? "secondary" : "outline"}
                            >
                              {session.status === "completed" ? "Concluída" :
                               session.status === "active" ? "Ativa" : "Pausada"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  {sessions.filter(Boolean).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="text-muted-foreground">
                          <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>Nenhuma sessão de trabalho encontrada</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
      {/* Users Tab */}
      <TabsContent value="users" className="space-y-4">
        <UserApproval />
        <Card>
          <CardHeader>
            <CardTitle>Usuários e Progresso</CardTitle>
            <CardDescription>Estatísticas individuais dos membros</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Horas Semanais</TableHead>
                  <TableHead>Pontos</TableHead>
                  <TableHead>Tarefas Concluídas</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user: any) => {
                  const userTasks = tasks.filter((t: any) => t.assignedTo === user.id)
                  const completedTasks = userTasks.filter((t: any) => t.completed).length
                  return (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.roles?.join(', ')}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{user.weekHours}</span>
                        <span className="text-muted-foreground text-xs ml-1">h/sem</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{user.points}</span>
                          <span className="text-muted-foreground text-xs">pts</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span>{completedTasks}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.status === "active" ? "default" : "secondary"}>
                          {user.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}; 