"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useWorksheet } from "@/context/worksheet-context"
import { Check, AlertCircle, Save } from "lucide-react"
import { saveProgressToSupabase } from "@/lib/save-progress"

export default function SaveProgressButton() {
  const { responses, currentStep } = useWorksheet()
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle")

  const handleSave = async () => {
    setIsSaving(true)
    setSaveStatus("idle")

    try {
      const result = await saveProgressToSupabase(responses, currentStep)

      if (result.success) {
        setSaveStatus("success")
        // 3秒後に成功表示をリセット
        setTimeout(() => {
          setSaveStatus("idle")
        }, 3000)
      } else {
        throw result.error
      }
    } catch (error) {
      console.error("Error saving progress:", error)
      setSaveStatus("error")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="relative">
      <Button
        onClick={handleSave}
        disabled={isSaving}
        variant="outline"
        size="sm"
        className="h-9 flex items-center gap-1"
      >
        {isSaving ? (
          <>
            <span className="animate-pulse">保存中...</span>
          </>
        ) : (
          <>
            <Save className="h-4 w-4" />
            <span>保存</span>
          </>
        )}
      </Button>

      {saveStatus === "success" && (
        <div className="absolute top-full mt-2 right-0 bg-green-100 text-green-800 px-3 py-1 rounded-md text-xs flex items-center whitespace-nowrap z-10">
          <Check className="h-3 w-3 mr-1" />
          保存しました
        </div>
      )}

      {saveStatus === "error" && (
        <div className="absolute top-full mt-2 right-0 bg-red-100 text-red-800 px-3 py-1 rounded-md text-xs flex items-center whitespace-nowrap z-10">
          <AlertCircle className="h-3 w-3 mr-1" />
          保存に失敗しました
        </div>
      )}
    </div>
  )
}

