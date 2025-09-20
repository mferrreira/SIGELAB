import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import ClientLayout from "./client-layout"
import { initCronService } from "@/lib/services/init-cron"

// Inicializar o serviço de cron no servidor
if (typeof window === 'undefined') {
  initCronService()
}

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sistema de Gerenciamento de Tarefas",
  description: "Aplicativo de gerenciamento de tarefas com quadro Kanban",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}