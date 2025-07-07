"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { AppHeader } from "@/components/app-header"
import { useUserStore } from "@/lib/user-store"
import { useRewardStore } from "@/lib/reward-store"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trophy, ShoppingBag, Clock, CheckCircle, XCircle } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { Toaster } from "@/components/ui/toaster"
import type { Reward } from "@/lib/types"

export default function StorePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { users } = useUserStore()
  const { rewards, purchases, purchaseReward, getUserPurchases, updatePurchaseStatus } = useRewardStore()

  const [selectedReward, setSelectedReward] = useState<Reward | null>(null)
  const [confirmPurchaseOpen, setConfirmPurchaseOpen] = useState(false)

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

  // Encontrar usuário atual para obter pontos
  const currentUserData = users.find((u) => u.id === user.id)
  const userPoints = currentUserData?.points || 0

  // Obter compras do usuário
  const userPurchases = getUserPurchases(user.id)

  // Filtrar recompensas disponíveis
  const availableRewards = rewards.filter((reward) => reward.available)

  // Função para comprar recompensa
  const handlePurchase = (reward: Reward) => {
    setSelectedReward(reward)
    setConfirmPurchaseOpen(true)
  }

  // Confirmar compra
  const confirmPurchase = () => {
    if (!selectedReward || !user) return

    const success = purchaseReward(user.id, selectedReward.id)

    if (success) {
      toast({
        title: "Compra realizada com sucesso!",
        description: `Você adquiriu "${selectedReward.name}" por ${selectedReward.price} pontos.`,
        action: <ToastAction altText="Ver minhas compras">Ver compras</ToastAction>,
      })
    } else {
      toast({
        variant: "destructive",
        title: "Erro ao realizar compra",
        description: "Você não tem pontos suficientes para esta recompensa.",
      })
    }

    setConfirmPurchaseOpen(false)
    setSelectedReward(null)
  }

  // Formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR")
  }

  // Obter badge de status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> Pendente
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="success" className="bg-green-500 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Aprovado
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" /> Rejeitado
          </Badge>
        )
      case "used":
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Utilizado
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Loja de Recompensas</h1>
          <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 px-3 py-1.5 rounded-md">
            <Trophy className="h-5 w-5 text-amber-500" />
            <span className="text-lg font-bold text-amber-600 dark:text-amber-400">{userPoints}</span>
            <span className="text-sm text-muted-foreground">pontos disponíveis</span>
          </div>
        </div>

        <Tabs defaultValue="rewards">
          <TabsList className="mb-4">
            <TabsTrigger value="rewards" className="flex items-center gap-1">
              <ShoppingBag className="h-4 w-4" />
              Recompensas
            </TabsTrigger>
            <TabsTrigger value="purchases" className="flex items-center gap-1">
              <Trophy className="h-4 w-4" />
              Minhas Compras
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rewards">
            {availableRewards.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">Nenhuma recompensa disponível no momento.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableRewards.map((reward) => (
                  <Card key={reward.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <CardTitle>{reward.name}</CardTitle>
                      <CardDescription>{reward.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                        <Trophy className="h-5 w-5" />
                        <span className="text-lg font-bold">{reward.price}</span>
                        <span className="text-sm text-muted-foreground">pontos</span>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button
                        onClick={() => handlePurchase(reward)}
                        disabled={userPoints < reward.price}
                        variant={userPoints >= reward.price ? "default" : "outline"}
                      >
                        {userPoints >= reward.price ? "Resgatar" : "Pontos insuficientes"}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="purchases">
            {userPurchases.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">Você ainda não resgatou nenhuma recompensa.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Recompensa</TableHead>
                      <TableHead>Pontos</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userPurchases.map((purchase) => (
                      <TableRow key={purchase.id}>
                        <TableCell className="font-medium">{purchase.rewardName}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Trophy className="h-4 w-4 text-amber-500" />
                            <span>{purchase.price}</span>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(purchase.purchaseDate)}</TableCell>
                        <TableCell>{getStatusBadge(purchase.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <AlertDialog open={confirmPurchaseOpen} onOpenChange={setConfirmPurchaseOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Resgate</AlertDialogTitle>
              <AlertDialogDescription>
                Você está prestes a resgatar "{selectedReward?.name}" por {selectedReward?.price} pontos. Seus pontos
                serão deduzidos imediatamente e a solicitação será enviada para aprovação.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmPurchase}>Confirmar Resgate</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Toaster />
      </main>
    </div>
  )
}
