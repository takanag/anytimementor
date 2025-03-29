"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getAnonymousId } from "@/lib/anonymous-id"
import { syncWorksheetAnalytics, getWorksheetAnalytics } from "@/lib/analytics-sync"

export default function AnalyticsDebugPage() {
  const [anonymousId, setAnonymousId] = useState<string | null>(null)
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [syncStatus, setSyncStatus] = useState<{ success?: boolean; message?: string }>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // 匿名IDを取得
    const id = getAnonymousId()
    setAnonymousId(id)

    // 初期データ取得
    fetchAnalyticsData()
  }, [])

  const fetchAnalyticsData = async () => {
    setLoading(true)
    const result = await getWorksheetAnalytics()
    setLoading(false)

    if (result.success && result.data) {
      setAnalyticsData(result.data)
    } else {
      setAnalyticsData(null)
      setSyncStatus({
        success: false,
        message: result.error || "データの取得に失敗しました",
      })
    }
  }

  const handleSync = async () => {
    setSyncStatus({ message: "同期中..." })
    setLoading(true)

    const result = await syncWorksheetAnalytics()

    if (result.success) {
      setSyncStatus({
        success: true,
        message: "データが正常に同期されました",
      })
      // 同期後にデータを再取得
      await fetchAnalyticsData()
    } else {
      setSyncStatus({
        success: false,
        message: result.error || "同期に失敗しました",
      })
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">分析データデバッグ</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>匿名ID</CardTitle>
          <CardDescription>現在のセッションの匿名ID</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="font-mono">{anonymousId || "匿名IDが見つかりません"}</p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>データ同期</CardTitle>
          <CardDescription>worksheet_progressからworksheet_analyticsへのデータ同期</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <Button onClick={handleSync} disabled={loading}>
                今すぐ同期
              </Button>
              <Button onClick={fetchAnalyticsData} variant="outline" disabled={loading}>
                データを更新
              </Button>
            </div>

            {syncStatus.message && (
              <div
                className={`p-4 rounded-md ${
                  syncStatus.success === undefined
                    ? "bg-gray-100"
                    : syncStatus.success
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                }`}
              >
                {syncStatus.message}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>分析データ</CardTitle>
          <CardDescription>worksheet_analyticsテーブルの現在のデータ</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : analyticsData ? (
            <div className="overflow-auto max-h-[500px]">
              <pre className="text-xs">{JSON.stringify(analyticsData, null, 2)}</pre>
            </div>
          ) : (
            <p>データがありません</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

