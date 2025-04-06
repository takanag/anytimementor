"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, RefreshCw, WifiOff } from "lucide-react"
import { testSupabaseConnection } from "@/lib/data"
import {
  isLocalStorageOnlyMode,
  setLocalStorageOnlyMode,
  getConsecutiveFailures,
  resetConsecutiveFailures,
  getOrCreateAnonymousId,
} from "@/lib/data"

export default function DebugPage() {
  const [connectionStatus, setConnectionStatus] = useState<"loading" | "success" | "error">("loading")
  const [statusMessage, setStatusMessage] = useState<string>("")
  const [isLocalOnly, setIsLocalOnly] = useState<boolean>(false)
  const [isOnline, setIsOnline] = useState<boolean>(true)
  const [isTesting, setIsTesting] = useState<boolean>(false)
  const [failureCount, setFailureCount] = useState<number>(0)
  const [anonymousId, setAnonymousId] = useState<string>("")
  const [logs, setLogs] = useState<string[]>([])
  const [localStorageData, setLocalStorageData] = useState<{
    anonymousId: string | null
    worksheetData: string | null
    useLocalStorageOnly: string | null
    consecutiveFailures: string | null
  }>({
    anonymousId: null,
    worksheetData: null,
    useLocalStorageOnly: null,
    consecutiveFailures: null,
  })

  useEffect(() => {
    // オンライン状態を監視
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // 初期状態を設定
    setIsOnline(navigator.onLine)
    setIsLocalOnly(isLocalStorageOnlyMode())
    setFailureCount(getConsecutiveFailures())
    setAnonymousId(getOrCreateAnonymousId())

    // ローカルストレージのデータを取得
    setLocalStorageData({
      anonymousId: localStorage.getItem("anonymousId"),
      worksheetData: localStorage.getItem("worksheetData"),
      useLocalStorageOnly: localStorage.getItem("useLocalStorageOnly"),
      consecutiveFailures: localStorage.getItem("consecutiveFailures"),
    })

    // コンソールログをキャプチャ
    const originalConsoleLog = console.log
    const originalConsoleError = console.error
    const originalConsoleWarn = console.warn

    console.log = (...args) => {
      originalConsoleLog(...args)
      setLogs((prev) => [
        ...prev,
        `[LOG] ${args.map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : arg)).join(" ")}`,
      ])
    }

    console.error = (...args) => {
      originalConsoleError(...args)
      setLogs((prev) => [
        ...prev,
        `[ERROR] ${args.map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : arg)).join(" ")}`,
      ])
    }

    console.warn = (...args) => {
      originalConsoleWarn(...args)
      setLogs((prev) => [
        ...prev,
        `[WARN] ${args.map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : arg)).join(" ")}`,
      ])
    }

    // 初回接続テスト
    testConnection()

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      console.log = originalConsoleLog
      console.error = originalConsoleError
      console.warn = originalConsoleWarn
    }
  }, [])

  const testConnection = async () => {
    setIsTesting(true)
    setConnectionStatus("loading")
    setStatusMessage("接続をテスト中...")
    setLogs([])

    try {
      const result = await testSupabaseConnection()
      if (result.success) {
        setConnectionStatus("success")
      } else {
        setConnectionStatus("error")
      }
      setStatusMessage(result.message)
    } catch (error: any) {
      setConnectionStatus("error")
      setStatusMessage(`テスト中にエラーが発生しました: ${error.message}`)
      console.error("Connection test error:", error)
    } finally {
      setIsTesting(false)
      // 最新の状態を取得
      setIsLocalOnly(isLocalStorageOnlyMode())
      setFailureCount(getConsecutiveFailures())
      setAnonymousId(getOrCreateAnonymousId())

      // ローカルストレージのデータを更新
      setLocalStorageData({
        anonymousId: localStorage.getItem("anonymousId"),
        worksheetData: localStorage.getItem("worksheetData"),
        useLocalStorageOnly: localStorage.getItem("useLocalStorageOnly"),
        consecutiveFailures: localStorage.getItem("consecutiveFailures"),
      })
    }
  }

  const toggleLocalStorageMode = () => {
    const newMode = !isLocalOnly
    setLocalStorageOnlyMode(newMode)
    setIsLocalOnly(newMode)
    if (!newMode) {
      resetConsecutiveFailures()
      setFailureCount(0)
    }

    // ローカルストレージのデータを更新
    setLocalStorageData({
      ...localStorageData,
      useLocalStorageOnly: localStorage.getItem("useLocalStorageOnly"),
      consecutiveFailures: localStorage.getItem("consecutiveFailures"),
    })
  }

  const resetFailureCounter = () => {
    resetConsecutiveFailures()
    setFailureCount(0)

    // ローカルストレージのデータを更新
    setLocalStorageData({
      ...localStorageData,
      consecutiveFailures: localStorage.getItem("consecutiveFailures"),
    })
  }

  const clearLocalStorage = () => {
    if (confirm("本当にローカルストレージをクリアしますか？この操作は元に戻せません。")) {
      localStorage.clear()
      window.location.reload()
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">デバッグページ</h1>

      <Tabs defaultValue="connection">
        <TabsList className="mb-4">
          <TabsTrigger value="connection">接続状態</TabsTrigger>
          <TabsTrigger value="storage">ストレージ</TabsTrigger>
          <TabsTrigger value="logs">ログ</TabsTrigger>
        </TabsList>

        <TabsContent value="connection">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Supabase接続ステータス
                  <Badge
                    variant={
                      connectionStatus === "success"
                        ? "success"
                        : connectionStatus === "error"
                          ? "destructive"
                          : "outline"
                    }
                  >
                    {connectionStatus === "success" ? "接続済み" : connectionStatus === "error" ? "エラー" : "テスト中"}
                  </Badge>
                </CardTitle>
                <CardDescription>Supabaseサーバーとの接続状態を確認します。</CardDescription>
              </CardHeader>
              <CardContent>
                {connectionStatus === "loading" ? (
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <p>接続をテスト中...</p>
                  </div>
                ) : connectionStatus === "success" ? (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">接続成功</AlertTitle>
                    <AlertDescription className="text-green-700">{statusMessage}</AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>接続エラー</AlertTitle>
                    <AlertDescription>{statusMessage}</AlertDescription>
                  </Alert>
                )}

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">ネットワーク状態:</span>
                    <Badge variant={isOnline ? "outline" : "destructive"}>
                      {isOnline ? "オンライン" : "オフライン"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">ローカルストレージのみモード:</span>
                    <Badge variant={isLocalOnly ? "destructive" : "outline"}>{isLocalOnly ? "有効" : "無効"}</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">連続失敗回数:</span>
                    <Badge variant={failureCount > 0 ? "destructive" : "outline"}>{failureCount}</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">匿名ID:</span>
                    <code className="text-xs bg-gray-100 p-1 rounded">{anonymousId}</code>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={resetFailureCounter} disabled={failureCount === 0}>
                  失敗カウンターをリセット
                </Button>
                <Button onClick={testConnection} disabled={isTesting}>
                  {isTesting ? "テスト中..." : "接続をテスト"}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>接続モード設定</CardTitle>
                <CardDescription>
                  データ保存モードを切り替えます。ローカルストレージのみモードでは、データはブラウザにのみ保存されます。
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLocalOnly ? (
                  <Alert variant="destructive">
                    <WifiOff className="h-4 w-4" />
                    <AlertTitle>ローカルストレージのみモード</AlertTitle>
                    <AlertDescription>
                      現在、データはローカルストレージにのみ保存されています。Supabaseへの保存は無効になっています。
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">通常モード</AlertTitle>
                    <AlertDescription className="text-green-700">
                      データはローカルストレージとSupabaseの両方に保存されます。
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  variant={isLocalOnly ? "default" : "destructive"}
                  onClick={toggleLocalStorageMode}
                  className="w-full"
                >
                  {isLocalOnly ? "通常モードに切り替え" : "ローカルストレージのみモードに切り替え"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="storage">
          <Card>
            <CardHeader>
              <CardTitle>ローカルストレージの内容</CardTitle>
              <CardDescription>ブラウザに保存されているデータを表示します。</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-1">匿名ID:</h3>
                  <code className="text-xs bg-gray-100 p-2 rounded block overflow-x-auto">
                    {localStorageData.anonymousId || "未設定"}
                  </code>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-1">ワークシートデータ:</h3>
                  <pre className="text-xs bg-gray-100 p-2 rounded block overflow-x-auto max-h-40">
                    {localStorageData.worksheetData
                      ? JSON.stringify(JSON.parse(localStorageData.worksheetData), null, 2)
                      : "未設定"}
                  </pre>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-1">ローカルストレージのみモード:</h3>
                  <code className="text-xs bg-gray-100 p-2 rounded block">
                    {localStorageData.useLocalStorageOnly || "false"}
                  </code>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-1">連続失敗回数:</h3>
                  <code className="text-xs bg-gray-100 p-2 rounded block">
                    {localStorageData.consecutiveFailures || "0"}
                  </code>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="destructive" onClick={clearLocalStorage} className="w-full">
                ローカルストレージをクリア
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>デバッグログ</CardTitle>
              <CardDescription>接続テスト中のログを表示します</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 p-4 rounded text-xs font-mono h-96 overflow-y-auto">
                {logs.length > 0 ? (
                  logs.map((log, index) => (
                    <div
                      key={index}
                      className={`mb-1 ${log.includes("[ERROR]") ? "text-red-600" : log.includes("[WARN]") ? "text-amber-600" : ""}`}
                    >
                      {log}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">ログはまだありません。接続テストを実行してください。</p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => setLogs([])} variant="outline" className="w-full">
                ログをクリア
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

