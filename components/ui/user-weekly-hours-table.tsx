import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { User } from "@/contexts/types";

interface UserWeeklyHoursTableProps {
  users: User[];
}
export function UserWeeklyHoursTable({ users }: UserWeeklyHoursTableProps) {
  return (
    <div className="bg-blue-50 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span role="img" aria-label="calendário">📅</span>
          Horas Trabalhadas por Usuário (Semana Atual)
        </h2>
        <div className="flex gap-2">
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="text-right">Horas Trabalhadas</TableHead>
            <TableHead className="text-right">Horas Esperadas</TableHead>
            <TableHead className="text-right">Diferença</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => {
            const horasTrabalhadas = u.currentWeekHours ?? 0;
            const expected = u.weekHours || 0;
            const diff = expected - horasTrabalhadas;
            let diffColor = "text-gray-700";
            let diffText = '';
            if (diff > 0) {
              diffColor = "text-red-600 font-bold";
              diffText = `${diff.toFixed(1)}h restantes`;
            } else if (diff < 0) {
              diffColor = "text-green-600 font-bold";
              diffText = `+${Math.abs(diff).toFixed(1)}h extra`;
            } else {
              diffColor = "text-blue-700 font-bold";
              diffText = `Meta atingida!`;
            }
            return (
              <TableRow key={u.id}>
                <TableCell>{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell className="text-right font-bold text-blue-900">
                  {horasTrabalhadas.toFixed(1)} h
                </TableCell>
                <TableCell className="text-right text-blue-700">
                  {expected.toFixed(1)} h
                </TableCell>
                <TableCell className={`text-right ${diffColor}`}>{diffText}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
} 