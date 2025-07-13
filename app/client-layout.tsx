"use client"

import type React from "react"

import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/lib/auth-context"
import { UserProvider } from "@/lib/user-context"
import { ProjectProvider } from "@/lib/project-context"
import { TaskProvider } from "@/lib/task-context"
import { RewardProvider } from "@/lib/reward-context"
import { ResponsibilityProvider } from "@/lib/responsibility-context"
import { DailyLogProvider } from "@/lib/daily-log-context"
import { ScheduleProvider } from "@/lib/schedule-context"
import { LaboratoryScheduleProvider } from "@/lib/laboratory-schedule-context"
import { WeeklyReportProvider } from "@/lib/weekly-report-context"
import { WorkSessionProvider } from "@/lib/work-session-context"
import { SessionProvider } from "next-auth/react"

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
        <AuthProvider>
          <UserProvider>
            <ProjectProvider>
              <TaskProvider>
                <RewardProvider>
                  <ResponsibilityProvider>
                    <DailyLogProvider>
                      <ScheduleProvider>
                        <LaboratoryScheduleProvider>
                          <WorkSessionProvider>
                            <WeeklyReportProvider>
                              {children}
                            </WeeklyReportProvider>
                          </WorkSessionProvider>
                        </LaboratoryScheduleProvider>
                      </ScheduleProvider>
                    </DailyLogProvider>
                  </ResponsibilityProvider>
                </RewardProvider>
              </TaskProvider>
            </ProjectProvider>
          </UserProvider>
        </AuthProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}
