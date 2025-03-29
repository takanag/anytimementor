"use client"

import { useEffect, useState } from "react"
import WorksheetCompletion from "@/components/worksheet-completion"
import { Loader2 } from "lucide-react"

export default function CompletePage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // ページロード時に短い遅延後にローディング状態を解除
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  // ローディング中は簡易的なローディングインジケータを表示
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return <WorksheetCompletion />
}

