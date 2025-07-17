"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("VOLUNTARIO")
  const [weekHours, setWeekHours] = useState(0)
  const [error, setError] = useState("")
  const { register } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      await register(name, email, password, [role] as any, weekHours)
      // Show success message and redirect to login
      alert("Conta criada com sucesso! Sua solicitação será analisada por um coordenador ou laboratorista. Você receberá um email quando sua conta for aprovada.")
      router.push("/login")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao registrar")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Criar uma conta</CardTitle>
          <CardDescription>Digite suas informações para criar uma conta</CardDescription>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Após o registro, sua conta será analisada por um coordenador ou laboratorista. 
              Você receberá uma notificação quando sua conta for aprovada.
            </AlertDescription>
          </Alert>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                placeholder="João Silva"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nome@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Função</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a função" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VOLUNTARIO">Voluntário</SelectItem>
                  <SelectItem value="COLABORADOR">Colaborador</SelectItem>
                  <SelectItem value="GERENTE_PROJETO">Gerente de Projeto</SelectItem>
                  <SelectItem value="LABORATORISTA">Laboratorista</SelectItem>
                  <SelectItem value="COORDENADOR">Coordenador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="weekHours">Horas Semanais no Laboratório</Label>
              <Input
                id="weekHours"
                type="number"
                min="0"
                max="168"
                value={weekHours}
                onChange={(e) => setWeekHours(Number(e.target.value))}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Criar conta
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Já tem uma conta?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Faça login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
