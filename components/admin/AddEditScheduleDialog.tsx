import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export const AddEditScheduleDialog = ({
  open,
  onOpenChange,
  editingSchedule,
  selectedUser,
  scheduleForm,
  setScheduleForm,
  scheduleError,
  handleCreateSchedule,
  handleUpdateSchedule
}: any) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingSchedule ? "Editar Horário" : "Adicionar Horário"}
          </DialogTitle>
          <DialogDescription>
            Configure o horário para {selectedUser?.name}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dayOfWeek">Dia da Semana</Label>
            <Select
              value={scheduleForm.dayOfWeek.toString()}
              onValueChange={(value) => setScheduleForm((prev: any) => ({ ...prev, dayOfWeek: parseInt(value) }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Domingo</SelectItem>
                <SelectItem value="1">Segunda-feira</SelectItem>
                <SelectItem value="2">Terça-feira</SelectItem>
                <SelectItem value="3">Quarta-feira</SelectItem>
                <SelectItem value="4">Quinta-feira</SelectItem>
                <SelectItem value="5">Sexta-feira</SelectItem>
                <SelectItem value="6">Sábado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Horário de Início</Label>
              <Input
                type="time"
                value={scheduleForm.startTime}
                onChange={(e) => setScheduleForm((prev: any) => ({ ...prev, startTime: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">Horário de Fim</Label>
              <Input
                type="time"
                value={scheduleForm.endTime}
                onChange={(e) => setScheduleForm((prev: any) => ({ ...prev, endTime: e.target.value }))}
              />
            </div>
          </div>
          {scheduleError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{scheduleError}</AlertDescription>
            </Alert>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={editingSchedule ? handleUpdateSchedule : handleCreateSchedule}>
              {editingSchedule ? "Atualizar" : "Adicionar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 