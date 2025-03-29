"use client"

import { useState, type ReactNode } from "react"
import { Button } from "@/components/ui/button"

interface StepNavigationProps {
  steps: {
    title: string
    content: ReactNode
  }[]
  onStepClick?: (stepIndex: number) => void // 新しいプロパティを追加
  isDevelopmentMode?: boolean // 開発モードフラグを追加
}

export default function StepNavigation({ steps, onStepClick, isDevelopmentMode = false }: StepNavigationProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1)
    }
  }

  // ステップ番号をクリックしたときの処理を追加
  const handleStepNumberClick = (index: number) => {
    if (isDevelopmentMode && onStepClick) {
      onStepClick(index + 1) // 1-indexedに変換して親コンポーネントに通知
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">{steps[currentStepIndex].title}</h3>
        <div className="text-sm text-gray-500">
          {isDevelopmentMode ? (
            // 開発モードの場合はクリック可能なステップ番号を表示
            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <span
                  key={index}
                  onClick={() => handleStepNumberClick(index)}
                  className={`cursor-pointer px-2 py-1 rounded ${
                    currentStepIndex === index ? "bg-[#C4BD97] text-white" : "hover:bg-gray-100"
                  }`}
                >
                  {index + 1}
                </span>
              ))}
            </div>
          ) : (
            // 通常モードでは従来通りの表示
            <span>
              ステップ {currentStepIndex + 1}/{steps.length}
            </span>
          )}
        </div>
      </div>

      <div className="mb-4">{steps[currentStepIndex].content}</div>

      <div className="flex justify-between">
        <Button
          onClick={handlePrevious}
          disabled={currentStepIndex === 0}
          variant="outline"
          className="border-[#C4BD97] text-[#4A593D]"
        >
          前へ
        </Button>
        <Button
          onClick={handleNext}
          disabled={currentStepIndex === steps.length - 1}
          className="bg-[#C4BD97] hover:bg-[#B0A97F] text-white"
        >
          次へ
        </Button>
      </div>
    </div>
  )
}

