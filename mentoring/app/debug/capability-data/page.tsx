"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { diagnoseCapabilityData, fixCapabilityData } from "@/lib/debug-capability"
import { Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function CapabilityDataDebugPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [fixResult, setFixResult] = useState<any>(null)

  // データを診断する関数
  const handleDiagnose = async () => {
    setIsLoading(true)
    setError(null)
    setResult(null)
    setFixResult(null)

    try {
      const diagnosisResult = await diagnoseCapabilityData()
      setResult(diagnosisResult)

      if (!diagnosisResult.success) {
        setError(diagnosisResult.message)
      }
    } catch (err: any) {
      console.error("診断エラー:", err)
      setError(`診断中にエラーが発生しました: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // データを修正する関数
  const handleFix = async () => {
    setIsLoading(true)
    setError(null)
    setFixResult(null)

    try {
      const fixResult = await fixCapabilityData()
      setFixResult(fixResult)

      if (!fixResult.success) {
        setError(fixResult.message)
      } else {
        // 修正後に再診断
        const diagnosisResult = await diagnoseCapabilityData()
        setResult(diagnosisResult)
      }
    } catch (err: any) {
      console.error("修正エラー:", err)
      setError(`修正中にエラーが発生しました: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>ケイパビリティデータ診断</CardTitle>
          <CardDescription>ステップ7のアセスメント結果（capability）データの診断と修正を行います</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Button onClick={handleDiagnose} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                データを診断
              </Button>

              <Button onClick={handleFix} disabled={isLoading || !result} variant="outline">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                データを修正
              </Button>

              <Button onClick={() => window.location.reload()} variant="secondary">
                ページを再読み込み
              </Button>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>エラー</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {fixResult && fixResult.success && (
              <Alert variant="success" className="bg-green-50 border-green-200 text-green-800">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle>修正完了</AlertTitle>
                <AlertDescription>{fixResult.message}</AlertDescription>
              </Alert>
            )}

            {result && result.success && (
              <div className="mt-4 space-y-4">
                <h3 className="text-lg font-medium">診断結果</h3>

                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-medium mb-2">capability データの状態</h4>
                  <ul className="space-y-2">
                    <li>
                      <strong>データの有無:</strong> {result.data.diagnosis.hasCapabilityData ? "あり" : "なし"}
                    </li>
                    <li>
                      <strong>データ型:</strong> {result.data.diagnosis.dataType}
                    </li>
                    <li>
                      <strong>オブジェクト型か:</strong> {result.data.diagnosis.isObject ? "はい" : "いいえ"}
                    </li>
                    <li>
                      <strong>キー数:</strong> {result.data.diagnosis.keys.length}
                    </li>
                  </ul>
                </div>

                {result.data.diagnosis.keys.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h4 className="font-medium mb-2">サンプルデータ</h4>
                    <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                      {JSON.stringify(result.data.diagnosis.sampleValues, null, 2)}
                    </pre>
                  </div>
                )}

                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-medium mb-2">生データ</h4>
                  <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto max-h-96">
                    {JSON.stringify(result.data.rawData, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-gray-500">問題が解決しない場合は、開発者に連絡してください。</div>
        </CardFooter>
      </Card>
    </div>
  )
}

