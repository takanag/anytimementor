"use client"

import type { ReactNode } from "react"
import ProgressBar from "@/components/progress-bar"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useWorksheet } from "@/context/worksheet-context"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface WorksheetLayoutProps {
  children: ReactNode
  onNext?: () => void
  onPrevious?: () => void
  currentStep: number
  totalSteps: number
  isStepCompleted?: boolean
  onStepClick?: (step: number) => void
  isSaving?: boolean
  isOffline?: boolean
  hideProgress?: boolean // 進捗表示を非表示にするためのプロパティを追加
  title?: string
  description?: string
}

export default function WorksheetLayout({
  children,
  onNext = () => {},
  onPrevious = () => {},
  currentStep,
  totalSteps,
  isStepCompleted = true,
  onStepClick,
  isSaving = false,
  isOffline = false,
  hideProgress = false, // デフォルト値はfalse
  title = "やさしいキャリアデザイン",
  description = "",
}: WorksheetLayoutProps) {
  const { responses } = useWorksheet()
  const router = useRouter()

  // メンターのアバター画像URLを更新
  const mentorAvatarUrl =
    responses.avatar?.url ||
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/avator%201-UqQV1NQPIICexukdQNCSwWbBBozxWa.jpeg"

  // メンターの呼び方
  const mentorName = responses.introduction?.mentorName || "キャリアメンター"

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー部分 - 保存と読み込みボタンを削除 */}
        <div className="mb-4 flex flex-wrap justify-between items-center">
          <div className="w-full sm:w-auto mb-2 sm:mb-0">
            <h1 className="text-2xl font-bold text-gray-900 text-center sm:text-left">{title}</h1>
            {description && <p className="text-sm text-gray-500">{description}</p>}
          </div>
          <div className="w-full sm:w-auto flex justify-center sm:justify-end items-center gap-3">
            <div className="w-24 sm:w-32 h-auto">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Any%20time%20mentor%20logo-hrwCVNIlEi4MTREuCxD4w14Z79z3dN.jpeg"
                alt="ANY TIME MENTOR logo"
                width={128}
                height={128}
                className="object-contain"
              />
            </div>
          </div>
        </div>

        {/* 進捗表示 - hideProgressがtrueの場合は表示しない */}
        {!hideProgress && <ProgressBar currentStep={currentStep} totalSteps={totalSteps} onStepClick={onStepClick} />}

        <div className="bg-white rounded-lg shadow-lg overflow-hidden mt-4">
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {currentStep !== 1 && (
                <div className="md:w-1/4">
                  <div className="flex flex-col items-center">
                    <div className="w-32 h-32 relative rounded-full overflow-hidden border-4 border-[#C4BD97]">
                      <Image
                        src={mentorAvatarUrl || "/placeholder.svg"}
                        alt={`${mentorName}のアバター`}
                        fill
                        className="object-cover"
                        priority
                      />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mt-3">{mentorName}</h3>
                    <p className="text-sm text-gray-500">
                      {responses.introduction?.name
                        ? `${responses.introduction.name}さんのキャリアをサポートします`
                        : "あなたのキャリアをサポートします"}
                    </p>
                  </div>
                </div>
              )}
              <div className={`${currentStep !== 1 ? "md:w-3/4" : "w-full"} fade-in`}>{children}</div>
            </div>

            <div className="mt-8 flex justify-between">
              <Button
                variant="outline"
                onClick={onPrevious}
                disabled={currentStep === 1 || isSaving}
                className="flex items-center gap-1"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    保存中...
                  </>
                ) : (
                  "前のステップへ"
                )}
              </Button>

              {/* ステップに応じたボタン表示 */}
              {currentStep === 7 ? (
                <Button
                  onClick={onNext}
                  disabled={!isStepCompleted || isSaving}
                  className={`bg-[#C4BD97] hover:bg-[#B0A97F] text-white transition-all duration-300 ${
                    !isStepCompleted ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      保存中...
                    </>
                  ) : (
                    "次のステップへ"
                  )}
                </Button>
              ) : currentStep === 8 ? (
                <Button
                  onClick={onNext}
                  disabled={!isStepCompleted || isSaving}
                  className={`bg-[#C4BD97] hover:bg-[#B0A97F] text-white transition-all duration-300 ${
                    !isStepCompleted ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      保存中...
                    </>
                  ) : (
                    "完了"
                  )}
                </Button>
              ) : (
                <Button
                  onClick={onNext}
                  disabled={!isStepCompleted || isSaving}
                  className={`bg-[#C4BD97] hover:bg-[#B0A97F] text-white transition-all duration-300 ${
                    !isStepCompleted ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      保存中...
                    </>
                  ) : (
                    "次のステップへ"
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

