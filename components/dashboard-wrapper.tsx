"use client"

import ProtectedRoute from "@/components/protected-route"
import type { ReactNode } from "react"

export default function DashboardWrapper({ children }: { children: ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>
}

