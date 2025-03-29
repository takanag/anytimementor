"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getAnonymousId } from "@/lib/anonymous-id"
import {
  syncDataSyncToAnalytics,
  getWorksheetAnalytics,
  checkDataExists,
  createTestWorksheetData,
  checkTriggerStatus,
  recreateTrigger,
  testTrigger,
} from "@/lib/analytics-sync"

export default function WorksheetSyncDebugPage() {
  const [anonymousId, setAnonymousId] = useState<string | null>(null)
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [syncStatus, setSyncStatus] = useState<{ success?: boolean; message?: string }>({})
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(false)
  const [dataStatus, setDataStatus] = useState<{
    checking: boolean
    worksheetDataExists?: boolean
    analyticsDataExists?: boolean
    error?: string
  }>({ checking: true })
  const [testDataStatus, setTestDataStatus] = useState<{ loading: boolean; success?: boolean; message?: string }>({
    loading: false,
  })
  const [triggerStatus, setTriggerStatus] = useState<{
    checking: boolean
    exists?: boolean
    definition?: string
    error?: string
  }>({ checking: true })
  const [recreateStatus, setRecreateStatus] = useState<{ loading: boolean; success?: boolean; message?: string }>({
    loading: false,
  })
  const [testTriggerStatus, setTestTriggerStatus] = useState<{ loading: boolean; success?: boolean; message?: string }>(
    { loading: false },
  )

  useEffect(() => {
    // 匿名IDを取得
    const id = getAnonymousId()
    setAnonymousId(id)

    // データ存在確認
    checkDataExistence()

    // トリガー状態確認
    checkTriggerExistence()
  }, [])

  const checkDataExistence = async () => {
    setDataStatus({ checking: true })
    try {
      const result = await checkDataExists()
      if (result.success) {
        setDataStatus({
          checking: false,
          worksheetDataExists: result.worksheetDataExists,
          analyticsDataExists: result.analyticsDataExists,
        })
      } else {
        setDataStatus({
          checking: false,
          error: result.error,
          worksheetDataExists: result.worksheetDataExists,
          analyticsDataExists: result.analyticsDataExists,
        })
      }
    } catch (error) {
      setDataStatus({
        checking: false,
        error: error instanceof Error ? error.message : "データ確認中に不明なエラーが発生しました",
      })
    }

    // 初期データ取得
    fetchAnalyticsData()
  }

  const checkTriggerExistence = async () => {
    setTriggerStatus({ checking: true })
    try {
      const result = await checkTriggerStatus()
      if (result.success) {
        setTriggerStatus({
          checking: false,
          exists: result.triggerExists,
          definition: result.triggerFunction,
        })
      } else {
        setTriggerStatus({
          checking: false,
          error: result.message,
          exists: result.triggerExists,
        })
      }
    } catch (error) {
      setTriggerStatus({
        checking: false,
        error: error instanceof Error ? error.message : "トリガー確認中に不明なエラーが発生しました",
      })
    }
  }

  const fetchAnalyticsData = async () => {
    try {
      setFetchLoading(true)
      const result = await getWorksheetAnalytics()

      if (result.success && result.data) {
        setAnalyticsData(result.data)
      } else {
        setAnalyticsData(null)
        if (result.error) {
          setSyncStatus({
            success: false,
            message: result.error,
          })
        }
      }
    } catch (error) {
      console.error("データ取得中にエラーが発生しました:", error)
      setSyncStatus({
        success: false,
        message: error instanceof Error ? error.message : "データ取得中に不明なエラーが発生しました",
      })
    } finally {
      setFetchLoading(false)
    }
  }

  const handleSync = async () => {
    try {
      setSyncStatus({ message: "同期中..." })
      setLoading(true)

      const result = await syncDataSyncToAnalytics()

      if (result.success) {
        setSyncStatus({
          success: true,
          message: "データが正常に同期されました",
        })
        // 同期後にデータを再取得
        await fetchAnalyticsData()
        // データ存在状況も更新
        await checkDataExistence()
      } else {
        setSyncStatus({
          success: false,
          message: result.message || "同期に失敗しました",
        })
      }
    } catch (error) {
      console.error("同期中にエラーが発生しました:", error)
      setSyncStatus({
        success: false,
        message: error instanceof Error ? error.message : "同期中に不明なエラーが発生しました",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTestData = async () => {
    try {
      setTestDataStatus({ loading: true })
      const result = await createTestWorksheetData()

      if (result.success) {
        setTestDataStatus({
          loading: false,
          success: true,
          message: result.message,
        })
        // テストデータ作成後にデータ存在確認を更新
        await checkDataExistence()
      } else {
        setTestDataStatus({
          loading: false,
          success: false,
          message: result.message,
        })
      }
    } catch (error) {
      console.error("テストデータ作成中にエラーが発生しました:", error)
      setTestDataStatus({
        loading: false,
        success: false,
        message: error instanceof Error ? error.message : "テストデータ作成中に不明なエラーが発生しました",
      })
    }
  }

  const handleRecreateTrigger = async () => {
    try {
      setRecreateStatus({ loading: true })
      const result = await recreateTrigger()

      if (result.success) {
        setRecreateStatus({
          loading: false,
          success: true,
          message: result.message,
        })
        // トリガー再作成後に状態を更新
        await checkTriggerExistence()
      } else {
        setRecreateStatus({
          loading: false,
          success: false,
          message: result.message,
        })
      }
    } catch (error) {
      console.error("トリガー再作成中にエラーが発生しました:", error)
      setRecreateStatus({
        loading: false,
        success: false,
        message: error instanceof Error ? error.message : "トリガー再作成中に不明なエラーが発生しました",
      })
    }
  }

  const handleTestTrigger = async () => {
    try {
      setTestTriggerStatus({ loading: true })
      const result = await testTrigger()

      if (result.success) {
        setTestTriggerStatus({
          loading: false,
          success: true,
          message: result.message,
        })
        // テスト後にデータ状態を更新
        await checkDataExistence()
      } else {
        setTestTriggerStatus({
          loading: false,
          success: false,
          message: result.message,
        })
      }
    } catch (error) {
      console.error("トリガーテスト中にエラーが発生しました:", error)
      setTestTriggerStatus({
        loading: false,
        success: false,
        message: error instanceof Error ? error.message : "トリガーテスト中に不明なエラーが発生しました",
      })
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">ワークシートデータ同期デバッグ</h1>

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
          <CardTitle>トリガー状態</CardTitle>
          <CardDescription>データ同期トリガーの状態確認</CardDescription>
        </CardHeader>
        <CardContent>
          {triggerStatus.checking ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-md bg-gray-100">
                <p className="font-semibold">トリガー状態:</p>
                <p className={triggerStatus.exists ? "text-green-600" : "text-red-600"}>
                  {triggerStatus.exists ? "トリガーが存在します" : "トリガーが存在しません"}
                </p>
              </div>

              <div className="flex gap-4">
                <Button onClick={handleRecreateTrigger} disabled={recreateStatus.loading} variant="secondary">
                  {recreateStatus.loading ? (
                    <>
                      <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                      トリガー再作成中...
                    </>
                  ) : (
                    "トリガーを再作成"
                  )}
                </Button>

                <Button
                  onClick={handleTestTrigger}
                  disabled={testTriggerStatus.loading || !triggerStatus.exists}
                  variant="outline"
                >
                  {testTriggerStatus.loading ? (
                    <>
                      <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                      トリガーテスト中...
                    </>
                  ) : (
                    "トリガーをテスト"
                  )}
                </Button>

                <Button onClick={checkTriggerExistence} variant="outline" size="sm" disabled={triggerStatus.checking}>
                  {triggerStatus.checking ? "確認中..." : "再確認"}
                </Button>
              </div>

              {recreateStatus.message && (
                <div
                  className={`mt-2 p-3 rounded-md ${
                    recreateStatus.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {recreateStatus.message}
                </div>
              )}

              {testTriggerStatus.message && (
                <div
                  className={`mt-2 p-3 rounded-md ${
                    testTriggerStatus.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {testTriggerStatus.message}
                </div>
              )}

              {triggerStatus.error && (
                <div className="mt-2 p-3 rounded-md bg-red-100 text-red-800">エラー: {triggerStatus.error}</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>データ存在確認</CardTitle>
          <CardDescription>現在の匿名IDに対するデータの存在確認</CardDescription>
        </CardHeader>
        <CardContent>
          {dataStatus.checking ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-md bg-gray-100">
                  <p className="font-semibold">ワークシートデータ:</p>
                  <p className={dataStatus.worksheetDataExists ? "text-green-600" : "text-red-600"}>
                    {dataStatus.worksheetDataExists ? "存在します" : "存在しません"}
                  </p>
                </div>
                <div className="p-4 rounded-md bg-gray-100">
                  <p className="font-semibold">分析データ:</p>
                  <p className={dataStatus.analyticsDataExists ? "text-green-600" : "text-red-600"}>
                    {dataStatus.analyticsDataExists ? "存在します" : "存在しません"}
                  </p>
                </div>
              </div>

              {!dataStatus.worksheetDataExists && (
                <div className="mt-4">
                  <Button onClick={handleCreateTestData} disabled={testDataStatus.loading} variant="secondary">
                    {testDataStatus.loading ? (
                      <>
                        <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                        テストデータ作成中...
                      </>
                    ) : (
                      "テストデータを作成"
                    )}
                  </Button>

                  {testDataStatus.message && (
                    <div
                      className={`mt-2 p-3 rounded-md ${
                        testDataStatus.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {testDataStatus.message}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-2">
                <Button onClick={checkDataExistence} variant="outline" size="sm" disabled={dataStatus.checking}>
                  {dataStatus.checking ? "確認中..." : "再確認"}
                </Button>
              </div>

              {dataStatus.error && (
                <div className="mt-2 p-3 rounded-md bg-red-100 text-red-800">エラー: {dataStatus.error}</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>データ同期</CardTitle>
          <CardDescription>worksheet_data_syncからworksheet_analyticsへのデータ同期</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <Button onClick={handleSync} disabled={loading || !dataStatus.worksheetDataExists}>
                {loading ? (
                  <>
                    <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                    同期中...
                  </>
                ) : (
                  "今すぐ同期"
                )}
              </Button>
              <Button onClick={fetchAnalyticsData} variant="outline" disabled={fetchLoading || loading}>
                {fetchLoading ? (
                  <>
                    <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                    更新中...
                  </>
                ) : (
                  "データを更新"
                )}
              </Button>
            </div>

            {!dataStatus.worksheetDataExists && (
              <div className="p-3 rounded-md bg-yellow-100 text-yellow-800">
                ワークシートデータが存在しないため、同期できません。先にテストデータを作成してください。
              </div>
            )}

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
          {fetchLoading ? (
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

