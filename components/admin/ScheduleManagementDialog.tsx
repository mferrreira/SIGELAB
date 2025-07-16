import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Calendar, Plus, Edit, Trash2 } from "lucide-react";

export const ScheduleManagementDialog = ({
  open,
  onOpenChange,
  users,
  selectedUserId,
  setSelectedUserId,
  selectedUser,
  scheduleStats,
  selectedUserSchedules,
  openCreateDialog,
  openEditDialog,
  handleDeleteSchedule
}: any) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button onClick={() => onOpenChange(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Gerenciar Horários
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Gerenciar Horários dos Usuários
          </DialogTitle>
          <DialogDescription>Adicionar, editar e remover horários semanais dos membros</DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {/* Seletor de Usuário */}
          <div className="space-y-2">
            <Label htmlFor="user-select">Selecionar Usuário</Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha um usuário" />
              </SelectTrigger>
              <SelectContent>
                {users.filter((u: any) => u.status === "active").map((user: any) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {user.name} ({user.role}) - {user.weekHours}h/sem
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Estatísticas do Usuário Selecionado */}
          {selectedUser && scheduleStats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-blue-50 dark:bg-blue-950/30">
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {scheduleStats.scheduledHours}h
                  </div>
                  <p className="text-xs text-muted-foreground">Agendadas</p>
                </CardContent>
              </Card>
              <Card className="bg-green-50 dark:bg-green-950/30">
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {scheduleStats.allowedHours}h
                  </div>
                  <p className="text-xs text-muted-foreground">Permitidas</p>
                </CardContent>
              </Card>
              <Card className={scheduleStats.isOverLimit ? "bg-red-50 dark:bg-red-950/30" : "bg-gray-50 dark:bg-gray-950/30"}>
                <CardContent className="pt-4">
                  <div className={`text-2xl font-bold ${scheduleStats.isOverLimit ? "text-red-600 dark:text-red-400" : "text-gray-600 dark:text-gray-400"}`}>
                    {scheduleStats.remainingHours}h
                  </div>
                  <p className="text-xs text-muted-foreground">Restantes</p>
                </CardContent>
              </Card>
            </div>
          )}
          {/* Alerta se exceder limite */}
          {selectedUser && scheduleStats && scheduleStats.isOverLimit && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                O usuário {selectedUser.name} excede o limite semanal em {Math.abs(scheduleStats.remainingHours)}h.
              </AlertDescription>
            </Alert>
          )}
          {/* Horários da Semana */}
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Horários de {selectedUser.name}</h3>
                <Button onClick={openCreateDialog} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar Horário
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
                {["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"].map((day, dayIndex) => {
                  const daySchedules = selectedUserSchedules.filter((s: any) => s.dayOfWeek === dayIndex)
                  return (
                    <div key={day} className="space-y-2">
                      <h4 className="font-medium text-center text-sm">{day}</h4>
                      <div className="space-y-1">
                        {daySchedules.map((schedule: any) => (
                          <div
                            key={schedule.id}
                            className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded text-xs relative group"
                          >
                            <div className="font-medium">{schedule.startTime} - {schedule.endTime}</div>
                            <div className="text-muted-foreground">
                              {((parseInt(schedule.endTime.split(":")[0]) * 60 + parseInt(schedule.endTime.split(":")[1])) -
                                (parseInt(schedule.startTime.split(":")[0]) * 60 + parseInt(schedule.startTime.split(":")[1]))) / 60}h
                            </div>
                            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0"
                                  onClick={() => openEditDialog(schedule)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                  onClick={() => handleDeleteSchedule(schedule.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                        {daySchedules.length === 0 && (
                          <div className="text-center text-muted-foreground text-xs py-2 border border-dashed rounded">
                            Vazio
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}; 