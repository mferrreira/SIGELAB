import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { DailyLogsAPI } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import type { DailyLog } from "@/lib/types";

interface DailyLogContextType {
  logs: DailyLog[];
  loading: boolean;
  error: string | null;
  fetchLogs: (userId?: number, date?: string) => Promise<void>;
  createLog: (log: { userId: number; date: string; note?: string }) => Promise<DailyLog>;
  updateLog: (id: number, data: { note?: string; date?: string }) => Promise<DailyLog>;
  deleteLog: (id: number) => Promise<void>;
}

const DailyLogContext = createContext<DailyLogContextType | undefined>(undefined);

export function DailyLogProvider({ children }: { children: ReactNode }) {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchLogs = useCallback(async (userId?: number, date?: string) => {
    try {
      setLoading(true);
      setError(null);
      const { logs } = await DailyLogsAPI.getAll(userId, date);
      setLogs(logs);
    } catch (err) {
      setError("Erro ao carregar logs diários");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchLogs(user.id);
    } else {
      setLogs([]);
    }
  }, [user, fetchLogs]);

  const createLog = async (log: { userId: number; date: string; note?: string }) => {
    try {
      setLoading(true);
      setError(null);
      const { log: newLog } = await DailyLogsAPI.create(log);
      setLogs((prev) => [newLog, ...prev]);
      return newLog;
    } catch (err) {
      setError("Erro ao criar log diário");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateLog = async (id: number, data: { note?: string; date?: string }) => {
    try {
      setLoading(true);
      setError(null);
      const { log: updated } = await DailyLogsAPI.update(id, data);
      setLogs((prev) => prev.map((l) => (l.id === id ? updated : l)));
      return updated;
    } catch (err) {
      setError("Erro ao atualizar log diário");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteLog = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await DailyLogsAPI.delete(id);
      setLogs((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      setError("Erro ao deletar log diário");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <DailyLogContext.Provider value={{ logs, loading, error, fetchLogs, createLog, updateLog, deleteLog }}>
      {children}
    </DailyLogContext.Provider>
  );
}

export function useDailyLogs() {
  const context = useContext(DailyLogContext);
  if (context === undefined) {
    throw new Error("useDailyLogs deve ser usado dentro de um DailyLogProvider");
  }
  return context;
} 