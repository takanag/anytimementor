import type React from "react"
export default function CompleteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">{children}</div>
}

