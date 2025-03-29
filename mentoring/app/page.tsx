"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function Home() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // クライアントサイドでのみ実行されるようにする
    try {
      // ページロード時に自動的にワークシートページに遷移
      const redirectTimer = setTimeout(() => {
        router.push("/worksheet/1")
      }, 1000) // 1秒後に遷移

      return () => clearTimeout(redirectTimer)
    } catch (err) {
      console.error("Navigation error:", err)
      setError("ナビゲーションエラーが発生しました。")
      setIsLoading(false)
    }
  }, [router])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="text-center max-w-md w-full bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">やさしいキャリアデザイン</h1>

        {error ? (
          <div className="text-red-500 mb-4">
            {error}
            <p className="mt-2">
              <button onClick={() => (window.location.href = "/worksheet/1")} className="text-blue-500 underline">
                こちらをクリック
              </button>
              して手動で移動してください。
            </p>
          </div>
        ) : (
          <>
            <p className="mt-2 text-gray-600 mb-4">ワークシートに移動します...</p>
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          </>
        )}
      </div>
    </main>
  )
}

