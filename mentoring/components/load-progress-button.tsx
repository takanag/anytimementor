"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useWorksheet } from "@/context/worksheet-context"
import { supabase, getOrCreateAnonymousId } from "@/lib/supabase"
import { Download, Check, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export default function LoadProgressButton() {
  const { updateResponse, setCurrentStep } = useWorksheet()
  const [isLoading, setIsLoading] = useState(false)
  const [loadStatus, setLoadStatus] = useState<"idle" | "success" | "error" | "not-found">("idle")
  const router = useRouter()

  const handleLoad = async () => {
    setIsLoading(true)
    setLoadStatus("idle")

    try {
      const anonymousId = getOrCreateAnonymousId()

      // Supabaseからデータを取得
      const { data, error } = await supabase
        .from("worksheet_progress")
        .select("data")
        .eq("anonymous_id", anonymousId)
        .single()

      if (error) {
        if (error.code === "PGRST116") {
          // データが見つからない場合
          setLoadStatus("not-found")
        } else {
          throw error
        }
        return
      }

      if (!data || !data.data) {
        setLoadStatus("not-found")
        return
      }

      // 保存されたデータを復元
      const savedData = data.data

      // 各セクションのデータを復元
      if (savedData.introduction) {
        Object.entries(savedData.introduction).forEach(([key, value]) => {
          updateResponse("introduction", key, value)
        })
      }

      if (savedData.avatar) {
        // オブジェクト全体を更新
        updateResponse("avatar", "url", savedData.avatar.url)
        console.log("Avatar URL restored:", savedData.avatar.url)
      }

      if (savedData.userAvatar) {
        // オブジェクト全体を更新
        updateResponse("userAvatar", "url", savedData.userAvatar.url)
        console.log("User Avatar URL restored:", savedData.userAvatar.url)
      }

      if (savedData.bias) {
        Object.entries(savedData.bias).forEach(([key, value]) => {
          updateResponse("bias", key, value)
        })
      }

      if (savedData.internalMotivation) {
        Object.entries(savedData.internalMotivation).forEach(([key, value]) => {
          updateResponse("internalMotivation", key, value)
        })
      }

      // 保存されたステップに移動
      if (savedData.currentStep) {
        setCurrentStep(savedData.currentStep)
        router.push(`/worksheet/${savedData.currentStep}`)
      }

      setLoadStatus("success")
      console.log("Progress loaded successfully:", savedData)

      // 3秒後に成功表示をリセット
      setTimeout(() => {
        setLoadStatus("idle")
      }, 3000)
    } catch (error) {
      console.error("Error loading progress:", error)
      setLoadStatus("error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative">
      <Button
        onClick={handleLoad}
        disabled={isLoading}
        variant="outline"
        size="sm"
        className="h-9 flex items-center gap-1"
      >
        {isLoading ? (
          <>
            <span className="animate-pulse">読み込み中...</span>
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            <span>進捗を読み込む</span>
          </>
        )}
      </Button>

      {loadStatus === "success" && (
        <div className="absolute top-full mt-2 right-0 bg-green-100 text-green-800 px-3 py-1 rounded-md text-sm flex items-center">
          <Check className="h-4 w-4 mr-1" />
          読み込みました
        </div>
      )}

      {loadStatus === "error" && (
        <div className="absolute top-full mt-2 right-0 bg-red-100 text-red-800 px-3 py-1 rounded-md text-sm flex items-center">
          <AlertCircle className="h-4 w-4 mr-1" />
          読み込みに失敗しました
        </div>
      )}

      {loadStatus === "not-found" && (
        <div className="absolute top-full mt-2 right-0 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-md text-sm flex items-center">
          <AlertCircle className="h-4 w-4 mr-1" />
          保存データが見つかりません
        </div>
      )}
    </div>
  )
}

