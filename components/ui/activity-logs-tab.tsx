import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";

interface ActivityLogsTabProps {
  dailyLogs: any[];
  users: any[];
}

export function ActivityLogsTab({ dailyLogs, users }: ActivityLogsTabProps) {
  return (
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
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 10)
              .map((log) => {
                const user = users.find(u => u.id === log.userId)
                return (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{user?.name || 'Usuário não encontrado'}</TableCell>
                    <TableCell>{new Date(log.date).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        {log.note ? (
                          <p className="text-sm line-clamp-2">{log.note}</p>
                        ) : (
                          <span className="text-muted-foreground text-sm">Sem descrição</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="default">Registrado</Badge></TableCell>
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
  );
} 