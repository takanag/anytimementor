"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { getAnonymousId } from "@/lib/worksheet-sync"

export default function RoadmapRedirectPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // ローカルストレージからanonymous_idを取得
    const anonymousId = getAnonymousId()

    if (anonymousId) {
      // anonymous_idが存在する場合、動的ルートにリダイレクト
      router.push(`/roadmap/${anonymousId}`)
    } else {
      // anonymous_idが存在しない場合、エラーメッセージを表示
      setError("ユーザーIDが見つかりません。ワークシートを完了してからアクセスしてください。")
    }
  }, [router])

  return (
    <div className="flex flex-col justify-center items-center min-h-screen">
      {error ? (
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">エラー</h1>
          <p className="text-gray-700">{error}</p>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <p className="text-gray-700">ロードマップを読み込んでいます...</p>
        </div>
      )}
    </div>
  )
}

