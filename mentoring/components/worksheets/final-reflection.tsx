"use client"

import { useState } from "react"
import { useWorksheet } from "@/context/worksheet-context"
import MessageBubble from "@/components/message-bubble"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export default function FinalReflectionWorksheet() {
  const { responses, updateResponse } = useWorksheet()
  const userName = responses.introduction?.name || "あなた"

  // 初期値の設定
  const [learnings, setLearnings] = useState(responses.finalReflection?.learnings || "")
  const [nextSteps, setNextSteps] = useState(responses.finalReflection?.nextSteps || "")
  const [gratitude, setGratitude] = useState(responses.finalReflection?.gratitude || "")

  // 表示状態の管理
  const [showLearningsResponse, setShowLearningsResponse] = useState(!!responses.finalReflection?.learnings)
  const [showNextStepsQuestion, setShowNextStepsQuestion] = useState(!!responses.finalReflection?.learnings)
  const [showNextStepsResponse, setShowNextStepsResponse] = useState(!!responses.finalReflection?.nextSteps)
  const [showGratitudeQuestion, setShowGratitudeQuestion] = useState(!!responses.finalReflection?.nextSteps)
  const [showGratitudeResponse, setShowGratitudeResponse] = useState(!!responses.finalReflection?.gratitude)
  const [showFinalMessage, setShowFinalMessage] = useState(!!responses.finalReflection?.gratitude)

  // 学びの提出
  const handleLearningsSubmit = () => {
    if (learnings.trim()) {
      updateResponse("finalReflection", "learnings", learnings)
      setShowLearningsResponse(true)
      setTimeout(() => setShowNextStepsQuestion(true), 500)
    }
  }

  // 次のステップの提出
  const handleNextStepsSubmit = () => {
    if (nextSteps.trim()) {
      updateResponse("finalReflection", "nextSteps", nextSteps)
      setShowNextStepsResponse(true)
      setTimeout(() => setShowGratitudeQuestion(true), 500)
    }
  }

  // 感謝の提出
  const handleGratitudeSubmit = () => {
    if (gratitude.trim()) {
      updateResponse("finalReflection", "gratitude", gratitude)
      setShowGratitudeResponse(true)
      setTimeout(() => setShowFinalMessage(true), 800)

      // ステップ完了イベントを発火
      const event = new CustomEvent("stepStatusChange", {
        detail: { isCompleted: true },
      })
      window.dispatchEvent(event)
    }
  }

  return (
    <div className="space-y-4">
      <MessageBubble>
        <p className="text-lg font-medium mb-2">最終振り返り</p>
        <p className="mb-4">
          {userName}さん、ワークシートの最後のステップです。これまでの取り組みを振り返り、
          学びや次のステップについて考えてみましょう。
        </p>
      </MessageBubble>

      <MessageBubble>
        <p>このワークシートを通して、あなたが得た最も重要な学びや気づきは何ですか？</p>
      </MessageBubble>

      {!showLearningsResponse && (
        <div className="user-input-area">
          <Textarea
            value={learnings}
            onChange={(e) => setLearnings(e.target.value)}
            placeholder="例：自分の内発的動機が何かを理解できたことで、より自分らしいキャリア選択ができそうだと気づきました。"
            className="w-full mb-3"
            rows={4}
          />
          <Button onClick={handleLearningsSubmit} className="bg-[#C4BD97] hover:bg-[#B0A97F]">
            送信
          </Button>
        </div>
      )}

      {showLearningsResponse && (
        <MessageBubble isUser>
          <p>{learnings}</p>
        </MessageBubble>
      )}

      {showNextStepsQuestion && (
        <MessageBubble>
          <p>この学びを活かして、今後どのような行動や変化を起こしていきたいですか？</p>
        </MessageBubble>
      )}

      {showNextStepsQuestion && !showNextStepsResponse && (
        <div className="user-input-area">
          <Textarea
            value={nextSteps}
            onChange={(e) => setNextSteps(e.target.value)}
            placeholder="例：毎週30分でも自分の興味のある分野について学ぶ時間を作り、新しいスキルを身につけていきたいです。"
            className="w-full mb-3"
            rows={4}
          />
          <Button onClick={handleNextStepsSubmit} className="bg-[#C4BD97] hover:bg-[#B0A97F]">
            送信
          </Button>
        </div>
      )}

      {showNextStepsResponse && (
        <MessageBubble isUser>
          <p>{nextSteps}</p>
        </MessageBubble>
      )}

      {showGratitudeQuestion && (
        <MessageBubble>
          <p>
            最後に、このワークシートを通じて感謝の気持ちを持った人や状況はありますか？
            また、自分自身へのメッセージがあれば書いてみてください。
          </p>
        </MessageBubble>
      )}

      {showGratitudeQuestion && !showGratitudeResponse && (
        <div className="user-input-area">
          <Textarea
            value={gratitude}
            onChange={(e) => setGratitude(e.target.value)}
            placeholder="例：このワークシートを通じて自己理解を深める機会を与えてくれた上司に感謝しています。また、自分自身にも、ここまで真摯に取り組んだことを褒めてあげたいです。"
            className="w-full mb-3"
            rows={4}
          />
          <Button onClick={handleGratitudeSubmit} className="bg-[#C4BD97] hover:bg-[#B0A97F]">
            送信
          </Button>
        </div>
      )}

      {showGratitudeResponse && (
        <MessageBubble isUser>
          <p>{gratitude}</p>
        </MessageBubble>
      )}

      {showFinalMessage && (
        <MessageBubble>
          <p>
            {userName}さん、素晴らしい振り返りですね。このワークシートを通じて得た学びや気づきを 大切にしてください。
          </p>
          <p className="mt-2">
            次のステップに進むと、ワークシートの完了画面に移動します。
            これまでの取り組みを振り返り、新たな一歩を踏み出す準備ができていますね。
          </p>
          <p className="mt-2">あなたの今後の成長と成功を心より応援しています！</p>
        </MessageBubble>
      )}
    </div>
  )
}

