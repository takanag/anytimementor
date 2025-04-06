"use client"

import type React from "react"

import { useState } from "react"
import { useWorksheet } from "@/context/worksheet-context"
import MessageBubble from "@/components/message-bubble"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"

export default function MotivationWorksheet() {
  const { responses, updateResponse } = useWorksheet()
  const userName = responses.introduction?.name || "あなた"
  const [enjoyment, setEnjoyment] = useState<number[]>(
    responses.motivation?.enjoyment ? [responses.motivation.enjoyment] : [50],
  )
  const [values, setValues] = useState<string[]>(responses.motivation?.values || ["", "", ""])
  const [activities, setActivities] = useState(responses.motivation?.activities || "")

  const [showEnjoymentResponse, setShowEnjoymentResponse] = useState(!!responses.motivation?.enjoyment)
  const [showValuesQuestion, setShowValuesQuestion] = useState(!!responses.motivation?.enjoyment)
  const [showValuesResponse, setShowValuesResponse] = useState(
    responses.motivation?.values?.some((v) => v.trim() !== ""),
  )
  const [showActivitiesQuestion, setShowActivitiesQuestion] = useState(
    responses.motivation?.values?.some((v) => v.trim() !== ""),
  )
  const [showActivitiesResponse, setShowActivitiesResponse] = useState(!!responses.motivation?.activities)
  const [showFinalMessage, setShowFinalMessage] = useState(!!responses.motivation?.activities)

  const handleEnjoymentChange = (value: number[]) => {
    setEnjoyment(value)
    updateResponse("motivation", "enjoyment", value[0])
  }

  const handleEnjoymentSubmit = () => {
    setShowEnjoymentResponse(true)
    setTimeout(() => setShowValuesQuestion(true), 500)
  }

  const handleValueChange = (index: number, value: string) => {
    const newValues = [...values]
    newValues[index] = value
    setValues(newValues)
    updateResponse("motivation", "values", newValues)
  }

  const handleValuesSubmit = () => {
    if (values.some((v) => v.trim() !== "")) {
      setShowValuesResponse(true)
      setTimeout(() => setShowActivitiesQuestion(true), 500)
    }
  }

  const handleActivitiesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setActivities(e.target.value)
    updateResponse("motivation", "activities", e.target.value)
  }

  const handleActivitiesSubmit = () => {
    if (activities.trim()) {
      setShowActivitiesResponse(true)
      setTimeout(() => setShowFinalMessage(true), 800)
    }
  }

  return (
    <div className="space-y-4">
      <MessageBubble>
        <p className="text-lg font-medium mb-2">自分の内発的動機を見つけましょう</p>
        <p className="mb-4">
          キャリアの満足度を高めるためには、外的な報酬だけでなく、内発的な動機を理解することが重要です。{userName}
          さんが本当に大切にしている価値観や、没頭できる活動について考えてみましょう。
        </p>
      </MessageBubble>

      <MessageBubble>
        <p>{userName}さんは現在の仕事や活動にどれくらい楽しさを感じていますか？</p>
      </MessageBubble>

      <div className="user-input-area">
        <div className="px-2 mb-4">
          <Slider value={enjoyment} onValueChange={handleEnjoymentChange} max={100} step={1} className="mb-2" />
          <div className="flex justify-between text-xs text-gray-500">
            <span>全く楽しくない</span>
            <span>とても楽しい</span>
          </div>
        </div>
        <Button onClick={handleEnjoymentSubmit} className="bg-[#C4BD97] hover:bg-[#B0A97F]">
          回答する
        </Button>
      </div>

      {showEnjoymentResponse && (
        <MessageBubble isUser>
          <p>楽しさのレベル: {enjoyment[0]}%</p>
        </MessageBubble>
      )}

      {showValuesQuestion && (
        <MessageBubble>
          <p className="mb-1">{userName}さんが大切にしている価値観を3つ挙げてください。</p>
          <p className="text-sm text-gray-600">例: 創造性、貢献、自律性、成長、安定など</p>
        </MessageBubble>
      )}

      {showValuesQuestion && (
        <div className="user-input-area">
          <div className="space-y-2 mb-4">
            {[0, 1, 2].map((index) => (
              <Textarea
                key={index}
                value={values[index]}
                onChange={(e) => handleValueChange(index, e.target.value)}
                placeholder={`価値観 ${index + 1}`}
                className="w-full"
              />
            ))}
          </div>
          <Button onClick={handleValuesSubmit} className="bg-[#C4BD97] hover:bg-[#B0A97F]">
            回答する
          </Button>
        </div>
      )}

      {showValuesResponse && (
        <MessageBubble isUser>
          <p>私が大切にしている価値観:</p>
          <ul className="list-disc pl-5 mt-1">
            {values
              .filter((v) => v.trim() !== "")
              .map((value, index) => (
                <li key={index}>{value}</li>
              ))}
          </ul>
        </MessageBubble>
      )}

      {showActivitiesQuestion && (
        <MessageBubble>
          <p>時間を忘れて没頭できる活動は何ですか？</p>
        </MessageBubble>
      )}

      {showActivitiesQuestion && (
        <div className="user-input-area">
          <Textarea
            value={activities}
            onChange={handleActivitiesChange}
            placeholder="例：新しいアイデアを考えること、人に教えること、問題解決に取り組むこと"
            className="w-full mb-4"
            rows={4}
          />
          <Button onClick={handleActivitiesSubmit} className="bg-[#C4BD97] hover:bg-[#B0A97F]">
            回答する
          </Button>
        </div>
      )}

      {showActivitiesResponse && (
        <MessageBubble isUser>
          <p>{activities}</p>
        </MessageBubble>
      )}

      {showFinalMessage && (
        <MessageBubble>
          <p>
            {userName}さん、素晴らしいですね！{userName}
            さんの価値観と没頭できる活動を知ることで、内発的動機がより明確になってきました。 これらは、{userName}
            さんが本当にやりたいことや、長期的に満足感を得られる方向性を示すヒントになります。
          </p>
          <p className="mt-2">
            次のステップでは、これらの内発的動機に基づいて、新しく始められることを考えていきましょう。
          </p>
        </MessageBubble>
      )}
    </div>
  )
}

