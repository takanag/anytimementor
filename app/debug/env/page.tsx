"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function EnvDebugPage() {
  const [envStatus, setEnvStatus] = useState<{
    supabaseUrl: string | null
    supabaseKeyExists: boolean
    supabaseKeyLength: number
    connectionStatus: string
  }>({
    supabaseUrl: null,
    supabaseKeyExists: false,
    supabaseKeyLength: 0,
    connectionStatus: "確認中...",
  })

  useEffect(() => {
    // 環境変数の状態を取得
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || null
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || null

    // Supabase接続テスト
    const testConnection = async () => {
      try {
        const { data, error } = await supabase.from("worksheet_data_sync").select("count(*)").limit(1)

        if (error) {
          return `接続エラー: ${error.message}`
        }
        return "接続成功"
      } catch (err) {
        return `接続例外: ${err instanceof Error ? err.message : String(err)}`
      }
    }

    testConnection().then((status) => {
      setEnvStatus({
        supabaseUrl,
        supabaseKeyExists: !!supabaseKey,
        supabaseKeyLength: supabaseKey?.length || 0,
        connectionStatus: status,
      })
    })
  }, [])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">環境変数デバッグ</h1>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-4">
        <h2 className="text-xl font-semibold mb-2">Supabase設定</h2>
        <div className="space-y-2">
          <p>
            <strong>NEXT_PUBLIC_SUPABASE_URL:</strong> {envStatus.supabaseUrl || "未設定"}
          </p>
          <p>
            <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong>{" "}
            {envStatus.supabaseKeyExists ? `設定済み (${envStatus.supabaseKeyLength}文字)` : "未設定"}
          </p>
          <p>
            <strong>接続ステータス:</strong>{" "}
            <span className={envStatus.connectionStatus.includes("成功") ? "text-green-500" : "text-red-500"}>
              {envStatus.connectionStatus}
            </span>
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">トラブルシューティング</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>`.env.local`ファイルがプロジェクトのルートディレクトリに存在することを確認してください</li>
          <li>アプリケーションを再起動して、環境変数が正しく読み込まれるようにしてください</li>
          <li>
            Vercelにデプロイしている場合は、環境変数がプロジェクト設定で正しく設定されていることを確認してください
          </li>
        </ul>
      </div>
    </div>
  )
}

