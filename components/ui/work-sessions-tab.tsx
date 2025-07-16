import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Clock } from "lucide-react";

interface WorkSessionsTabProps {
  sessions: any[];
  users: any[];
}

export function WorkSessionsTab({ sessions, users }: WorkSessionsTabProps) {
  return (
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
            {sessions.slice(0, 10).map((session) => {
              const user = users.find(u => u.id === session.userId)
              return (
                <TableRow key={session.id}>
                  <TableCell className="font-medium">{user?.name || 'Usuário não encontrado'}</TableCell>
                  <TableCell>{session.duration ? `${(session.duration / 3600).toFixed(1)} h` : '-'}</TableCell>
                  <TableCell>{session.activity || '-'}</TableCell>
                  <TableCell>{session.location || '-'}</TableCell>
                  <TableCell>{session.status}</TableCell>
                </TableRow>
              )
            })}
            {sessions.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="text-muted-foreground">
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma sessão encontrada</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
} 