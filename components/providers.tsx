"use client"

import type { ReactNode } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import { WorksheetProvider } from "@/context/worksheet-context"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WorksheetProvider>{children}</WorksheetProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
