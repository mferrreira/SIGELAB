"use client"

import type React from "react"

import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/lib/auth-context"
import { UserProvider } from "@/lib/user-context"
import { ProjectProvider } from "@/lib/project-context"
import { TaskProvider } from "@/lib/task-context"
import { RewardProvider } from "@/lib/reward-context"
import { ResponsibilityProvider } from "@/lib/responsibility-context"

const inter = Inter({ subsets: ["latin"] })

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <UserProvider>
              <ProjectProvider>
                <TaskProvider>
                  <RewardProvider>
                    <ResponsibilityProvider>{children}</ResponsibilityProvider>
                  </RewardProvider>
                </TaskProvider>
              </ProjectProvider>
            </UserProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
