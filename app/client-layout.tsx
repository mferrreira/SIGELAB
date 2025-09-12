"use client"

import { ThemeProvider } from "@/components/layout/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { UserProvider } from "@/contexts/user-context"
import { ProjectProvider } from "@/contexts/project-context"
import { TaskProvider } from "@/contexts/task-context"
import { RewardProvider } from "@/contexts/reward-context"
import { ResponsibilityProvider } from "@/contexts/responsibility-context"
import { DailyLogProvider } from "@/contexts/daily-log-context"
import { ScheduleProvider } from "@/contexts/schedule-context"
import { LaboratoryScheduleProvider } from "@/contexts/laboratory-schedule-context"
import { WeeklyReportProvider } from "@/contexts/weekly-report-context"
import { WorkSessionProvider } from "@/contexts/work-session-context"
import { SessionProvider } from "next-auth/react"
import { LabEventsProvider } from "@/contexts/lab-events-context"
import { AppHeader } from "@/components/layout/app-header"

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
        <AuthProvider>
          <LabEventsProvider>
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
                              <AppHeader />
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
         </LabEventsProvider>
        </AuthProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}
