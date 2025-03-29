"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ApiMonitorPage() {
  const [logs, setLogs] = useState<string[]>([])
  const [isMonitoring, setIsMonitoring] = useState(false)

  // APIリクエストをモニタリングする関数
  const startMonitoring = () => {
    setIsMonitoring(true)
    setLogs((prev) => [...prev, "モニタリングを開始しました..."])

    // オリジナルのfetchメソッドを保存
    const originalFetch = window.fetch

    // fetchをオーバーライド
    window.fetch = async (input, init) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.toString()
            : input instanceof Request
              ? input.url
              : String(input)

      // Supabaseのリクエストのみをログに記録
      if (url.includes("supabase.co")) {
        const method = init?.method || "GET"
        const logMessage = `${new Date().toISOString()} - ${method} ${url}`
        setLogs((prev) => [...prev, logMessage])

        // リクエストボディがある場合はそれもログに記録
        if (init?.body) {
          try {
            const bodyContent = typeof init.body === "string" ? init.body : JSON.stringify(init.body)
            setLogs((prev) => [...prev, `Body: ${bodyContent}`])
          } catch (e) {
            setLogs((prev) => [...prev, `Body: [非シリアライズ可能なデータ]`])
          }
        }
      }

      // オリジナルのfetchを呼び出す
      return originalFetch.apply(window, [input, init])
    }

    return () => {
      // クリーンアップ時にオリジナルのfetchを復元
      window.fetch = originalFetch
      setIsMonitoring(false)
      setLogs((prev) => [...prev, "モニタリングを停止しました"])
    }
  }

  // コンポーネントがマウントされたときにモニタリングを開始
  useEffect(() => {
    const stopMonitoring = startMonitoring()
    return stopMonitoring
  }, [])

  // ログをクリアする関数
  const clearLogs = () => {
    setLogs([])
  }

  // テストリクエストを送信する関数
  const sendTestRequest = async () => {
    try {
      setLogs((prev) => [...prev, "テストリクエストを送信しています..."])

      // 新しいテーブルにテストデータを保存
      const { getSupabaseClient } = await import("@/lib/supabase")
      const supabase = getSupabaseClient()

      const { error } = await supabase.from("worksheet_data_sync").insert({
        anonymous_id: "test_" + Date.now(),
        worksheet_id: "test",
        data: { test: true },
        current_step: 1,
        completed: false,
        updated_at: new Date().toISOString(),
      })

      if (error) {
        setLogs((prev) => [...prev, `テストリクエストエラー: ${error.message}`])
      } else {
        setLogs((prev) => [...prev, "テストリクエスト成功"])
      }
    } catch (error: any) {
      setLogs((prev) => [...prev, `テストリクエスト例外: ${error.message}`])
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>APIモニター</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Button onClick={clearLogs}>ログをクリア</Button>
            <Button onClick={sendTestRequest}>テストリクエスト送信</Button>
          </div>

          <div className="bg-gray-100 p-4 rounded-md h-[500px] overflow-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">ログはまだありません</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1 font-mono text-sm">
                  {log}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

