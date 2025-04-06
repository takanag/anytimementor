import type React from "react"
import { Noto_Sans_JP } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import { WorksheetProvider } from "@/context/worksheet-context"
import './globals.css'

const notoSansJP = Noto_Sans_JP({ subsets: ["latin"] })

export const metadata = {
  title: "AnyTimeMentor",
  description: "ワークシートとメンタリングで自己成長をサポート",
  generator: 'v0.dev'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={notoSansJP.className} suppressHydrationWarning>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="light">
            <WorksheetProvider>{children}</WorksheetProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
