"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useWorksheet } from "@/context/worksheet-context" // 正しいパスを確認
import WorksheetLayout from "@/components/worksheet-layout"
import ProtectedRoute from "@/components/protected-route"
import IntroductionWorksheet from "@/components/worksheets/introduction"
import GuidanceWorksheet from "@/components/worksheets/guidance"
import BiasWorksheet from "@/components/worksheets/bias"
import InternalMotivationWorksheet from "@/components/worksheets/internal-motivation"
import SeedPlantingWorksheet from "@/components/worksheets/seed-planting"
import CapabilityWorksheet from "@/components/worksheets/capability"
import CelebrationWorksheet from "@/components/worksheets/celebration"
import ValueArticulationWorksheet from "@/components/worksheets/value-articulation"
import { toast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { ArrowRight, ExternalLink, WifiOff } from "lucide-react"
import { saveData, isLocalStorageOnlyMode, setLocalStorageOnlyMode, resetConsecutiveFailures } from "@/lib/data" // 新しいデータ管理ライブラリを使用

export default function WorksheetPage() {
  const router = useRouter()
  const params = useParams()
  const { currentStep, setCurrentStep, responses } = useWorksheet() // worksheetData を削除
  const [isStepCompleted, setIsStepCompleted] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [showCompletionOptions, setShowCompletionOptions] = useState(false)
  const [isTestMode, setIsTestMode] = useState(false) // テストモードフラグを追加
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const totalSteps = 8
  const [isLocalStorageOnly, setIsLocalStorageOnly] = useState(false)

  const step = Number(params.step)

  useEffect(() => {
    // ローカルストレージのみモードをリセット（新規追加）
    if (typeof window !== "undefined") {
      // ローカルストレージのみモードを無効化
      setLocalStorageOnlyMode(false)
      // 連続失敗カウンターもリセット
      resetConsecutiveFailures()
      console.log("ローカルストレージのみモードをリセットしました")
    }

    // オンライン状態を監視
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // 初期状態を設定
    setIsOnline(navigator.onLine)
    setIsLocalStorageOnly(isLocalStorageOnlyMode())

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  useEffect(() => {
    if (isNaN(step) || step < 1 || step > 8) {
      router.push("/worksheet/1")
      return
    }

    setCurrentStep(step)

    // ステップ8の場合、テストモードが有効ならisStepCompletedを常にtrueに設定
    if (step === 8 && isTestMode) {
      setIsStepCompleted(true)
      return
    }

    // ステップ2、3、4、5、7、8の場合のみ、デフォルトでisStepCompletedをfalseに設定
    if (step === 2 || step === 3 || step === 4 || step === 5 || step === 7 || step === 8) {
      setIsStepCompleted(false)

      // ステップの完了状態を監視するイベントリスナーを追加
      const handleStepStatusChange = (event: CustomEvent) => {
        // テストモードが有効でステップ8の場合は常にtrueを返す
        if (step === 8 && isTestMode) {
          setIsStepCompleted(true)
          return
        }
        setIsStepCompleted(event.detail.isCompleted)
      }

      window.addEventListener("stepStatusChange", handleStepStatusChange as EventListener)

      return () => {
        window.removeEventListener("stepStatusChange", handleStepStatusChange as EventListener)
      }
    } else {
      // それ以外のステップでは常にtrueに設定
      setIsStepCompleted(true)
    }
  }, [step, router, setCurrentStep, isTestMode])

  // 現在のステップが変わったときにshowCompletionOptionsをリセット
  useEffect(() => {
    if (step === 1) {
      setShowCompletionOptions(false)
    }
  }, [step])

  // handleNext関数を最適化して、ページ遷移を高速化します
  const handleNext = async () => {
    console.log(`handleNext called. Current step: ${currentStep}`)

    // ステップ8の場合は完了ページに関するオプションを表示
    if (currentStep === 8) {
      console.log("Final step completed. Showing completion options...")
      console.log("環境変数確認:", {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "設定済み" : "未設定",
        keyExists: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "設定済み" : "未設定",
      })

      // まずデータを保存
      setIsSaving(true)
      try {
        // 新しいデータ管理ライブラリを使用してデータを保存
        const result = await saveData(responses, currentStep)
        console.log("データ保存結果:", result)

        if (!result.success && result.message) {
          toast({
            title: "注意",
            description: result.message,
          })
        }

        // 保存処理が完了したら、完了オプションを表示
        setShowCompletionOptions(true)
      } catch (error) {
        console.error("Error saving data:", error)
        // 保存に失敗した場合はエラーメッセージを表示
        toast({
          title: "エラー",
          description: "データの保存中にエラーが発生しました。データはローカルに保存されました。",
          variant: "destructive",
        })
        // エラーが発生しても完了オプションを表示
        setShowCompletionOptions(true)
      } finally {
        setIsSaving(false)
      }

      return // 早期リターンで以降のコードが実行されないようにする
    }

    // ステップ1-7の場合は次のステップに移動
    if (currentStep < 8) {
      console.log(`Moving to next step: ${currentStep + 1}`)
      setIsSaving(true)

      try {
        // 新しいデータ管理ライブラリを使用してデータを保存
        const result = await saveData(responses, currentStep + 1)
        console.log("Save progress result:", result)

        if (result.message && !result.success) {
          toast({
            title: "注意",
            description: result.message,
          })
        }
      } catch (error) {
        console.error("Error saving progress:", error)
        toast({
          title: "注意",
          description: "サーバーへの保存に失敗しましたが、データはローカルに保存されました。",
        })
      } finally {
        setIsSaving(false)

        // 次のステップへ移動
        console.log(`Navigating to step ${currentStep + 1}...`)
        router.push(`/worksheet/${currentStep + 1}`)
      }
    }
  }

  const handlePrevious = async () => {
    if (currentStep > 1) {
      setIsSaving(true)
      try {
        // 新しいデータ管理ライブラリを使用してデータを保存
        const result = await saveData(responses, currentStep - 1)
        if (!result.success && result.message) {
          toast({
            title: "注意",
            description: result.message,
          })
        }
      } catch (error) {
        console.error("Error saving progress:", error)
        toast({
          title: "エラー",
          description: "データの保存中にエラーが発生しました。もう一度お試しください。",
          variant: "destructive",
        })
      } finally {
        setIsSaving(false)
        router.push(`/worksheet/${currentStep - 1}`)
      }
    }
  }

  // handleStepClick関数を修正して、エラーハンドリングを強化します
  const handleStepClick = async (direction: "next" | "prev" | number) => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      // 現在のデータを保存
      const saveResult = await saveData(responses, currentStep) // worksheetData を responses に変更

      // 保存に失敗した場合でも、ローカルには保存されているのでナビゲーションは許可
      if (!saveResult.success) {
        console.warn("Data save warning:", saveResult.message)

        // モードが自動的に切り替わった場合は通知
        if (saveResult.switchedToLocalOnly) {
          toast({
            title: "自動モード切替",
            description: "接続問題が続いているため、ローカルストレージのみモードに切り替えました。",
          })
        } else {
          // それ以外のエラーの場合は通知
          toast({
            title: "保存の警告",
            description: saveResult.message,
          })
        }
      }

      // 次のステップに移動
      // 次のステップを決定
      let nextStep: number

      // 数値が直接渡された場合はそのステップに移動
      if (typeof direction === "number") {
        nextStep = direction
        console.log(`直接ステップ ${nextStep} に移動します`)
      } else {
        // 従来の次へ/前へナビゲーション
        nextStep = direction === "next" ? currentStep + 1 : currentStep - 1
      }

      // 有効なステップ範囲をチェック
      if (nextStep < 1) nextStep = 1
      if (nextStep > totalSteps) {
        router.push("/roadmap")
        return
      }

      router.push(`/worksheet/${nextStep}`)
    } catch (error: any) {
      console.error("Error during navigation:", error)
      setErrorMessage(`ナビゲーション中にエラーが発生しました: ${error.message}`)

      // エラーの詳細をログに記録
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        code: error.code,
        name: error.name,
        cause: error.cause,
      })

      toast({
        title: "エラー",
        description: `ナビゲーション中にエラーが発生しました: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const renderWorksheet = () => {
    switch (currentStep) {
      case 1:
        return <IntroductionWorksheet />
      case 2:
        return <GuidanceWorksheet />
      case 3:
        return <BiasWorksheet />
      case 4:
        return <InternalMotivationWorksheet />
      case 5:
        return <SeedPlantingWorksheet />
      case 6:
        return <CelebrationWorksheet />
      case 7:
        return <CapabilityWorksheet />
      case 8:
        return <ValueArticulationWorksheet />
      default:
        return <IntroductionWorksheet />
    }
  }

  // テストモードの切り替え
  const toggleTestMode = () => {
    setIsTestMode(!isTestMode)
    if (currentStep === 8) {
      setIsStepCompleted(!isTestMode) // テストモードを切り替えたときにステップ8の完了状態も更新
    }
  }

  return (
    <ProtectedRoute>
      <WorksheetLayout
        onNext={handleNext}
        onPrevious={handlePrevious}
        currentStep={currentStep}
        totalSteps={8}
        isStepCompleted={isStepCompleted}
        onStepClick={handleStepClick} // 修正したhandleStepClick関数を渡す
        isSaving={isSaving}
        isOffline={!isOnline || isLocalStorageOnly}
      >
        {/* オンライン/オフライン状態表示 */}
        {(!isOnline || isLocalStorageOnly) && (
          <div className="mb-4 p-2 rounded-md flex items-center bg-amber-50 text-amber-700">
            <WifiOff className="h-4 w-4 mr-2" />
            <span className="text-sm">
              {isLocalStorageOnly
                ? "ローカルストレージのみモード：データはローカルにのみ保存されます"
                : "オフライン状態：データはローカルにのみ保存され、オンラインに戻ったときに同期されます"}
            </span>
          </div>
        )}

        {/* テストモード切り替えボタン */}
        {currentStep === 8 && (
          <div className="mb-4 p-2 rounded-md bg-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">テストモード（入力チェックをスキップ）:</span>
              <Button variant="outline" size="sm" onClick={toggleTestMode} className={isTestMode ? "bg-blue-100" : ""}>
                {isTestMode ? "有効" : "無効"}
              </Button>
            </div>
            {isTestMode && (
              <p className="text-xs text-gray-500 mt-1">
                テストモードが有効です。入力チェックをスキップして次のステップに進むことができます。
              </p>
            )}
          </div>
        )}

        {renderWorksheet()}

        {/* 完了オプションの表示 */}
        {showCompletionOptions && (
          <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-xl font-bold text-green-800 mb-4">おめでとうございます！</h3>
            <p className="mb-4">
              すべてのワークシートを完了しました。データは正常に保存されました。
              以下のボタンをクリックして、完了ページを表示してください。
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              {/* 同じタブで完了ページに遷移するように変更 */}
              <Button
                className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                onClick={() => {
                  router.push("/roadmap")
                }}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                メンタリングの成果物を見る
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  setShowCompletionOptions(false)
                  router.push("/worksheet/1")
                }}
                className="w-full sm:w-auto"
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                ステップ1に戻る
              </Button>
            </div>
          </div>
        )}
      </WorksheetLayout>
    </ProtectedRoute>
  )
}
