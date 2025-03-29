"use client"

interface ProgressBarProps {
  currentStep: number
  totalSteps: number
  onStepClick?: (step: number) => void
}

export default function ProgressBar({ currentStep, totalSteps, onStepClick }: ProgressBarProps) {
  const progress = (currentStep / totalSteps) * 100

  // ステップのタイトル
  const worksheetTitles = [
    "イントロダクション",
    "ガイダンス",
    "キャリアに対するバイアスに気づく",
    "自分の内発的動機を見つける",
    "新たに始めること見つけ、実行する",
    "予祝エクササイズ",
    "現在のケイパビリティを分析する",
    "あなたの価値を言語化する",
  ]

  // ステップのカテゴリー判定
  const getStepCategory = (stepIndex: number) => {
    if (stepIndex === 3 || stepIndex === 4) {
      return "自分の中にある感性"
    } else if (stepIndex === 5 || stepIndex === 6 || stepIndex === 7 || stepIndex === 8) {
      return "自分の思考"
    }
    return ""
  }

  return (
    <div className="mt-4">
      <div className="flex justify-between mb-1 text-xs text-gray-500">
        <span>
          ステップ {currentStep}/{totalSteps}
        </span>
        <span>{Math.round(progress)}% 完了</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-[#C4BD97] h-2.5 rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="grid grid-cols-8 gap-2 mt-4">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1
          const category = getStepCategory(stepNumber)

          return (
            <div key={index} className="flex flex-col items-center">
              <button
                onClick={() => onStepClick && onStepClick(stepNumber)}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 cursor-pointer ${
                  stepNumber <= currentStep ? "bg-[#C4BD97] text-white" : "bg-gray-200 text-gray-500"
                } hover:opacity-80 mb-1`}
                aria-label={`ステップ ${stepNumber} に移動`}
              >
                {stepNumber}
              </button>
              <span className="text-xs text-center max-w-[80px] line-clamp-2 h-8">{worksheetTitles[index]}</span>
              {category && (
                <div className="text-xs font-medium text-[#4A593D] mt-1 px-2 py-0.5 bg-[#F0EEE4] rounded-full">
                  {category}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

