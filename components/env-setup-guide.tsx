// 新しいファイル: 環境変数設定ガイド
"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function EnvSetupGuide() {
  const [showGuide, setShowGuide] = useState(false)

  useEffect(() => {
    // 環境変数が正しく設定されているかチェック
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (
      !supabaseUrl ||
      supabaseUrl === "https://your-project-url.supabase.co" ||
      !supabaseKey ||
      supabaseKey === "your-anon-key"
    ) {
      setShowGuide(true)
    }
  }, [])

  if (!showGuide) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6">
        <h2 className="text-2xl font-bold mb-4">環境変数の設定が必要です</h2>

        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>接続エラー</AlertTitle>
          <AlertDescription>
            Supabaseの接続情報が正しく設定されていません。以下の手順に従って設定してください。
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">環境変数の設定方法:</h3>

          <div className="bg-gray-100 p-4 rounded-md">
            <h4 className="font-medium mb-2">1. ローカル開発環境の場合:</h4>
            <p className="mb-2">
              プロジェクトのルートディレクトリに <code>.env.local</code> ファイルを作成し、以下の内容を追加してください:
            </p>
            <pre className="bg-gray-800 text-white p-3 rounded text-sm overflow-x-auto">
              {`NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key`}
            </pre>
          </div>

          <div className="bg-gray-100 p-4 rounded-md">
            <h4 className="font-medium mb-2">2. Vercelにデプロイしている場合:</h4>
            <p>
              Vercelのダッシュボードで、プロジェクトの「Settings」→「Environment
              Variables」から上記の環境変数を追加してください。
            </p>
          </div>

          <div className="bg-gray-100 p-4 rounded-md">
            <h4 className="font-medium mb-2">3. Supabaseの接続情報の取得方法:</h4>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Supabaseダッシュボードにログインします。</li>
              <li>プロジェクトを選択します。</li>
              <li>左側のメニューから「Project Settings」→「API」を選択します。</li>
              <li>「Project URL」と「anon public」キーをコピーして、上記の環境変数に設定します。</li>
            </ol>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={() => setShowGuide(false)}>閉じる</Button>
        </div>
      </div>
    </div>
  )
}

