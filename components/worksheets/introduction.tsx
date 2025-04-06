"use client"

import { useState } from "react"
import { useWorksheet } from "@/context/worksheet-context"
import MessageBubble from "@/components/message-bubble"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Avatar from "@/components/avatar"
import UserAvatar from "@/components/user-avatar"

// IntroductionWorksheet コンポーネントに mentorName の状態と関連する表示状態を追加
export default function IntroductionWorksheet() {
  const { responses, updateResponse } = useWorksheet()
  const [name, setName] = useState(responses.introduction?.name || "")
  const [mentorName, setMentorName] = useState(responses.introduction?.mentorName || "")
  const [experience, setExperience] = useState(responses.introduction?.experience || "")
  const [showNameResponse, setShowNameResponse] = useState(!!responses.introduction?.name)
  const [showMentorNameQuestion, setShowMentorNameQuestion] = useState(!!responses.introduction?.name)
  const [showMentorNameResponse, setShowMentorNameResponse] = useState(!!responses.introduction?.mentorName)
  const [showExperienceQuestion, setShowExperienceQuestion] = useState(!!responses.introduction?.mentorName)
  const [showExperienceResponse, setShowExperienceResponse] = useState(!!responses.introduction?.experience)
  const [showFinalMessage, setShowFinalMessage] = useState(!!responses.introduction?.experience)

  const handleNameSubmit = () => {
    if (name.trim()) {
      updateResponse("introduction", "name", name)
      setShowNameResponse(true)
      setTimeout(() => setShowMentorNameQuestion(true), 500)
    }
  }

  const handleMentorNameSubmit = () => {
    if (mentorName.trim()) {
      updateResponse("introduction", "mentorName", mentorName)
      setShowMentorNameResponse(true)
      setTimeout(() => setShowExperienceQuestion(true), 500)
    }
  }

  const handleExperienceChange = (value: string) => {
    setExperience(value)
    updateResponse("introduction", "experience", value)
    setShowExperienceResponse(true)
    setTimeout(() => setShowFinalMessage(true), 800)
  }

  // 既存のコンポーネントの return 部分を修正して、メンターの呼び方を聞く質問を追加
  return (
    <div className="space-y-6">
      <MessageBubble>
        <p className="text-lg font-medium mb-2">こんにちは！やさしいキャリアデザインへようこそ。</p>
        <p>
          私はあなたのキャリアメンターです。これからのワークシートを通じて、あなたのキャリアについて一緒に考えていきましょう。
          まずは簡単な自己紹介からはじめましょう。
        </p>
      </MessageBubble>

      <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-6">
        <div className="flex flex-col items-center">
          <p className="text-sm text-gray-600 mb-2">メンターのアバターを選んでください</p>
          <Avatar />
          <p className="text-xs text-gray-500 mt-2">（画像をクリックして変更できます）</p>
        </div>

        <div className="flex flex-col items-center">
          <p className="text-sm text-gray-600 mb-2">あなたの写真を設定してください</p>
          <UserAvatar />
          <p className="text-xs text-gray-500 mt-2">（画像をクリックして変更できます）</p>
        </div>
      </div>

      <MessageBubble>
        <p>お名前を教えていただけますか？（ニックネームでも構いません）</p>
      </MessageBubble>

      <div className="user-input-area">
        <div className="flex gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例：田中 太郎"
            className="flex-1"
            onKeyDown={(e) => e.key === "Enter" && handleNameSubmit()}
          />
          <Button onClick={handleNameSubmit} className="bg-[#C4BD97] hover:bg-[#B0A97F]">
            送信
          </Button>
        </div>
      </div>

      {showNameResponse && (
        <MessageBubble isUser>
          <p>{name}</p>
        </MessageBubble>
      )}

      {showMentorNameQuestion && (
        <MessageBubble>
          <p className="mb-1">{name}さん、はじめまして！</p>
          <p>私のことをどのように呼んでいただけますか？</p>
        </MessageBubble>
      )}

      {showMentorNameQuestion && (
        <div className="user-input-area">
          <div className="flex gap-2">
            <Input
              value={mentorName}
              onChange={(e) => setMentorName(e.target.value)}
              placeholder="例：メンター、コーチ、先生、など"
              className="flex-1"
              onKeyDown={(e) => e.key === "Enter" && handleMentorNameSubmit()}
            />
            <Button onClick={handleMentorNameSubmit} className="bg-[#C4BD97] hover:bg-[#B0A97F]">
              送信
            </Button>
          </div>
        </div>
      )}

      {showMentorNameResponse && (
        <MessageBubble isUser>
          <p>{mentorName}</p>
        </MessageBubble>
      )}

      {showExperienceQuestion && (
        <MessageBubble>
          <p className="mb-1">
            {name}さん、これからは「{mentorName}
            」として、あなたのキャリアをサポートしていきますね。よろしくお願いします。
          </p>
          <p>キャリア設計の経験はありますか？</p>
        </MessageBubble>
      )}

      {showExperienceQuestion && (
        <div className="user-input-area">
          <RadioGroup value={experience} onValueChange={handleExperienceChange}>
            <div className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value="none" id="experience-none" />
              <Label htmlFor="experience-none">初めてです</Label>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value="some" id="experience-some" />
              <Label htmlFor="experience-some">少し考えたことがあります</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="experienced" id="experience-experienced" />
              <Label htmlFor="experience-experienced">定期的に考えています</Label>
            </div>
          </RadioGroup>
        </div>
      )}

      {showExperienceResponse && (
        <MessageBubble isUser>
          <p>
            {experience === "none" && "初めてです"}
            {experience === "some" && "少し考えたことがあります"}
            {experience === "experienced" && "定期的に考えています"}
          </p>
        </MessageBubble>
      )}

      {showFinalMessage && (
        <MessageBubble>
          <p>
            {experience === "none" && "初めてのキャリア設計、一緒に進めていきましょう！"}
            {experience === "some" &&
              "キャリアについて考えた経験があるんですね。その経験を活かしながら、さらに深めていきましょう。"}
            {experience === "experienced" &&
              "定期的にキャリアについて考えているんですね。素晴らしいです！さらに新しい視点を提供できるよう努めます。"}
          </p>
          <p className="mt-2">
            次のステップでは、{name}さんの{mentorName}
            として、メンタリングの目的やアプローチについてご説明します。「次のステップへ」ボタンをクリックして進みましょう。
          </p>
        </MessageBubble>
      )}
    </div>
  )
}

