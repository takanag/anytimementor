"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useWorksheet } from "@/context/worksheet-context"
import MessageBubble from "@/components/message-bubble"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Lightbulb } from "lucide-react"
import Image from "next/image"

export default function ShadowExplanationWorksheet() {
  const { responses } = useWorksheet()
  const userName = responses.introduction?.name || "あなた"
  const [currentStep, setCurrentStep] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)

  // 親コンポーネントにステップの完了状態を伝えるためのカスタムイベント
  useEffect(() => {
    // 最後のステップに到達したらisCompletedをtrueに設定
    setIsCompleted(currentStep === steps.length - 1)

    // カスタムイベントを発火して親コンポーネントに通知
    const event = new CustomEvent("stepStatusChange", {
      detail: { isCompleted: currentStep === steps.length - 1 },
    })
    window.dispatchEvent(event)

    return () => {
      // コンポーネントのアンマウント時にもイベントを発火（リセット）
      const resetEvent = new CustomEvent("stepStatusChange", { detail: { isCompleted: false } })
      window.dispatchEvent(resetEvent)
    }
  }, [currentStep])

  // エクササイズ1の回答を取得
  const admiredTraits = responses.internalMotivation?.admiredTraits || ["", "", ""]

  // エクササイズタイトルコンポーネント
  const ExerciseTitle = ({ title, icon }: { title: string; icon: React.ReactNode }) => (
    <div className="bg-[#4A593D] text-white p-3 rounded-lg mb-4 flex items-center">
      <div className="bg-white text-[#4A593D] w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-lg font-medium">{title}</p>
      </div>
    </div>
  )

  // ステップコンテンツ
  const steps = [
    // ステップ0: シャドウの解説
    {
      title: "シャドウと内発的動機の解説",
      content: (
        <>
          <MessageBubble>
            <ExerciseTitle title="シャドウと内発的動機の解説" icon={<Lightbulb className="h-5 w-5" />} />

            <p className="mb-4">
              先ほど行ったエクササイズは、自分の中にある
              <span className="font-medium">無意識（シャドウ）を投影する</span>エクササイズでした。
            </p>

            <div className="relative w-full aspect-video max-w-2xl mx-auto mb-6 rounded-lg overflow-hidden">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/iceberg-metaphor.jpg-kiUwJMUj9wgmv6H97ayYwRbYJXq3PV.jpeg"
                alt="氷山の比喩"
                fill
                className="object-cover animate-fade-in rounded-lg"
                priority
              />
            </div>

            <div className="bg-[#F0EEE4] p-4 rounded-lg mb-4">
              <p className="mb-2">
                <span className="font-medium">氷山の比喩</span>
              </p>
              <p>
                私たちの心は氷山のようなものです。日頃意識できている部分（海の上に見える部分）だけでなく、
                日頃意識できていない部分（海の下にある部分）にも目を向けることが重要です。
                無意識は理性によるバイアスがかからないため、自分の内発的動機を探すためにとても重要な手がかりとなります。
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-[#C4BD97]">
                <p className="font-medium text-[#4A593D] mb-2">ホワイトシャドウ</p>
                <p>
                  無意識のうち、「ホワイトシャドウ」と呼ばれるものは、自分の中に既にあるものを相手に尊敬として感じることができます。
                  つまり、<span className="font-medium">尊敬する相手に感じるものは、自分の中にもある</span>
                  ということです。
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-[#C4BD97]">
                <p className="font-medium text-[#4A593D] mb-2">無意識の強み</p>
                <p>
                  無意識に持っているもの、自然と滲み出るものが本当の強みです。
                  自分で認識できている強みは、理性や思考で見つけたものですが、
                  <span className="font-medium">無意識に持っているものを意識すると、元気になる、ワクワクする</span>
                  ことがあります。それが自分の無意識の強みなのです。
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-[#C4BD97]">
                <p className="font-medium text-[#4A593D] mb-2">嫌いな人物から学ぶ</p>
                <p>
                  嫌いな人物に感じることも、自分自身の投影である場合があります。
                  それは自分が認めたくない側面や、自分が持っていると認識していない特性かもしれません。
                  これらを理解することで、自己認識が深まり、より自分らしい選択ができるようになります。
                </p>
              </div>
            </div>
          </MessageBubble>
        </>
      ),
      isCompleted: true, // 解説は常に完了状態
    },
    // ステップ1: まとめ
    {
      title: "まとめ",
      content: (
        <>
          <MessageBubble>
            <div className="bg-[#4A593D] text-white p-3 rounded-t-lg flex items-center">
              <div className="bg-white text-[#4A593D] w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <span className="font-bold">✓</span>
              </div>
              <p className="font-medium text-lg">まとめ：内発的動機を見つける</p>
            </div>

            <div className="border-2 border-t-0 border-[#4A593D] rounded-b-lg p-4 mb-4">
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-[#C4BD97] text-white w-7 h-7 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <span className="font-bold">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-[#4A593D]">内発的動機とは</p>
                    <p>
                      <span className="font-medium">心で感じるもの</span>
                      であり、理由がなく、それ自体が目的で、自然に湧いてくるものです。
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-[#C4BD97] text-white w-7 h-7 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <span className="font-bold">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-[#4A593D]">無意識に目を向ける</p>
                    <p>
                      無意識（シャドウ）は、<span className="font-medium">理性によるバイアスがかからない</span>
                      ため、内発的動機を探る重要な手がかりとなります。
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-[#C4BD97] text-white w-7 h-7 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <span className="font-bold">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-[#4A593D]">投影から学ぶ</p>
                    <p>
                      尊敬する人物や嫌いな人物に感じることは、<span className="font-medium">自分自身の投影</span>
                      である場合が多く、自己理解の手がかりになります。
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-[#C4BD97] text-white w-7 h-7 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <span className="font-bold">4</span>
                  </div>
                  <div>
                    <p className="font-medium text-[#4A593D]">本当の強み</p>
                    <p>
                      無意識に持っているもの、自然と滲み出るものが<span className="font-medium">本当の強み</span>
                      です。それを意識すると、元気になる、ワクワクすることがあります。
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#F0EEE4] p-4 rounded-lg border-l-4 border-[#C4BD97] mb-4">
              <p className="font-medium">
                {userName}さん、内発的動機に気づくことで、より自分らしいキャリア選択ができるようになります。
                自分の心が自然に動く方向に注目してみましょう！
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <p className="text-[#4A593D] font-medium">次のステップ</p>
              <p>
                次のステップでは、新たに始めることを見つけ、実行するための計画を立てていきます。
                「次のステップへ」ボタンをクリックして進みましょう。
              </p>
            </div>
          </MessageBubble>
        </>
      ),
      isCompleted: true, // まとめは常に完了状態
    },
  ]

  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="space-y-4">
      {steps[currentStep].content}

      <div className="flex items-center justify-between mt-6">
        <Button
          variant="outline"
          size="sm"
          onClick={goToPreviousStep}
          disabled={currentStep === 0}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          前へ
        </Button>

        <div className="flex items-center gap-1">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${index === currentStep ? "bg-[#C4BD97]" : "bg-gray-300"}`}
            />
          ))}
        </div>

        {currentStep < steps.length - 1 ? (
          <Button variant="outline" size="sm" onClick={goToNextStep} className="flex items-center gap-1">
            次へ
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <div className="w-[72px]"></div> // 空のスペースを確保して左右のバランスを保つ
        )}
      </div>
    </div>
  )
}

