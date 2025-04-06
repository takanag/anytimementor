"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Database } from "lucide-react"
import { getSampleRecords, checkTableExists, getTableColumns } from "@/lib/debug-supabase"

export default function SupabaseDebugPage() {
  const [tableExists, setTableExists] = useState<boolean | null>(null)
  const [tableColumns, setTableColumns] = useState<any[] | null>(null)
  const [sampleRecords, setSampleRecords] = useState<any[] | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const tableName = "worksheet_progress"

  useEffect(() => {
    checkTable()
  }, [])

  const checkTable = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // テーブルの存在を確認
      const exists = await checkTableExists(tableName)
      setTableExists(exists)

      if (exists) {
        // テーブルのカラム情報を取得
        const columnsResult = await getTableColumns(tableName)
        if (columnsResult.success && columnsResult.columns) {
          setTableColumns(columnsResult.columns)
        } else {
          setError(columnsResult.message || "カラム情報の取得に失敗しました。")
        }

        // サンプルレコードを取得
        const recordsResult = await getSampleRecords(tableName, 3)
        if (recordsResult.success && recordsResult.records) {
          setSampleRecords(recordsResult.records)
        } else {
          setError(recordsResult.message || "レコードの取得に失敗しました。")
        }
      }
    } catch (err: any) {
      setError(`テーブル情報の取得中にエラーが発生しました: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Supabaseデバッグページ</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="mr-2 h-5 w-5" />
            テーブル情報: {tableName}
          </CardTitle>
          <CardDescription>Supabaseデータベースのテーブル構造と内容を確認します。</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2">データを読み込み中...</p>
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>エラー</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <Tabs defaultValue="structure">
              <TabsList className="mb-4">
                <TabsTrigger value="structure">テーブル構造</TabsTrigger>
                <TabsTrigger value="records">サンプルレコード</TabsTrigger>
              </TabsList>

              <TabsContent value="structure">
                {tableExists === null ? (
                  <p>テーブル情報を確認中...</p>
                ) : tableExists ? (
                  <div>
                    <Alert className="bg-green-50 border-green-200 mb-4">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertTitle className="text-green-800">テーブルが存在します</AlertTitle>
                    </Alert>

                    <h3 className="font-medium mb-2">カラム情報:</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              カラム名
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              データ型
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              NULL許可
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              デフォルト値
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {tableColumns ? (
                            tableColumns.map((column, index) => (
                              <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {column.column_name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {column.data_type}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {column.is_nullable === "YES" ? "許可" : "不許可"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {column.column_default || "-"}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                                カラム情報を取得できませんでした。
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>テーブルが存在しません</AlertTitle>
                    <AlertDescription>
                      {tableName} テーブルがデータベースに存在しません。テーブルを作成する必要があります。
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              <TabsContent value="records">
                {tableExists === null ? (
                  <p>テーブル情報を確認中...</p>
                ) : !tableExists ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>テーブルが存在しません</AlertTitle>
                    <AlertDescription>
                      {tableName} テーブルがデータベースに存在しません。テーブルを作成する必要があります。
                    </AlertDescription>
                  </Alert>
                ) : sampleRecords && sampleRecords.length > 0 ? (
                  <div>
                    <h3 className="font-medium mb-2">サンプルレコード ({sampleRecords.length}):</h3>
                    <div className="overflow-x-auto">
                      <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
                        {JSON.stringify(sampleRecords, null, 2)}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>レコードがありません</AlertTitle>
                    <AlertDescription>
                      {tableName} テーブルにはレコードが存在しないか、取得できませんでした。
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={checkTable} disabled={isLoading} className="w-full">
            {isLoading ? "読み込み中..." : "テーブル情報を更新"}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>テーブル作成SQL</CardTitle>
          <CardDescription>テーブルが存在しない場合は、以下のSQLを実行してテーブルを作成してください。</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
            {`CREATE TABLE IF NOT EXISTS public.worksheet_progress (
  id SERIAL PRIMARY KEY,
  anonymous_id UUID NOT NULL,
  current_step INTEGER NOT NULL DEFAULT 0,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT worksheet_progress_anonymous_id_key UNIQUE (anonymous_id)
);

-- インデックスを作成
CREATE INDEX IF NOT EXISTS worksheet_progress_anonymous_id_idx ON public.worksheet_progress (anonymous_id);
`}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}

