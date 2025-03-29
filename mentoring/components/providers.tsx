"use client"

import type { ReactNode } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/context/auth-context"
import { WorksheetProvider } from "@/context/worksheet-context"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <AuthProvider>
        <WorksheetProvider>{children}</WorksheetProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

