"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import MessageBubble from "@/components/message-bubble"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { supabase } from "@/lib/supabase"
import { getAnonymousId } from "@/lib/anonymous-id"

export default function CareerMentor() {
  const [step, setStep] = useState<"intro" | "chat">("intro")
  const [userName, setUserName] = useState("")
  const [selectedAvatar, setSelectedAvatar] = useState("/placeholder.svg?height=100&width=100")
  const [userAvatar, setUserAvatar] = useState("/placeholder.svg?height=100&width=100")
  const [mentorName, setMentorName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)

  const [messages, setMessages] = useState<{ content: string; isUser: boolean }[]>([
    {
      content:
        "こんにちは！やさしいキャリアデザインへようこそ。\n\n私はあなたのキャリアメンターです。これからのワークシートを通じて、あなたのキャリアについて一緒に考えていきましょう。まずは簡単な自己紹介からはじめましょう。",
      isUser: false,
    },
  ])
  const [input, setInput] = useState("")

  // データベースからユーザーとメンターの情報を取得
  useEffect(() => {
    async function fetchUserData() {
      try {
        setDataLoading(true)
        const anonymousId = getAnonymousId()

        const { data, error } = await supabase
          .from("worksheet_analytics")
          .select("introduction_mentor_name, avatar_url, introduction_name, user_avatar_url")
          .eq("anonymous_id", anonymousId)
          .single()

        if (error) {
          console.error("データ取得エラー:", error)
          return
        }

        if (data) {
          // メンター名の設定
          if (data.introduction_mentor_name) {
            setMentorName(data.introduction_mentor_name)

            // 初期メッセージを更新
            setMessages([
              {
                content: `こんにちは！やさしいキャリアデザインへようこそ。\n\n私は${data.introduction_mentor_name || "あなたのキャリアメンター"}です。これからのワークシートを通じて、あなたのキャリアについて一緒に考えていきましょう。まずは簡単な自己紹介からはじめましょう。`,
                isUser: false,
              },
            ])
          }

          // メンターのアバター設定
          if (data.avatar_url) {
            setSelectedAvatar(data.avatar_url)
          }

          // ユーザー名の設定
          if (data.introduction_name) {
            setUserName(data.introduction_name)
          }

          // ユーザーアバターの設定
          if (data.user_avatar_url) {
            setUserAvatar(data.user_avatar_url)
          }
        }
      } catch (err) {
        console.error("データ取得中にエラーが発生しました:", err)
      } finally {
        setDataLoading(false)
      }
    }

    fetchUserData()
  }, [])

  const handleStartChat = () => {
    if (!userName.trim()) return
    setStep("chat")

    // 初期メッセージを追加
    setMessages([
      {
        content: `こんにちは、${userName}さん！キャリアについて何か質問や悩みがありましたら、お気軽にお聞かせください。`,
        isUser: false,
      },
    ])
  }

  const handleSend = async () => {
    if (!input.trim()) return

    // ユーザーメッセージを追加
    const userMessage = { content: input, isUser: true }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // AIの応答を生成（実際のAPIリクエストに置き換える）
      // 実装例: const response = await fetch('/api/career-advice', { method: 'POST', body: JSON.stringify({ message: input }) })

      // 仮の応答（実際のAPIレスポンスに置き換える）
      setTimeout(() => {
        const aiResponse = {
          content:
            "ご質問ありがとうございます。キャリア形成においては、ご自身の強みや価値観を理解することが重要です。もう少し具体的なご状況や悩みについて教えていただけますか？",
          isUser: false,
        }
        setMessages((prev) => [...prev, aiResponse])
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      console.error("Error generating response:", error)
      setMessages((prev) => [
        ...prev,
        { content: "申し訳ありません。応答の生成中にエラーが発生しました。後ほど再度お試しください。", isUser: false },
      ])
      setIsLoading(false)
    }
  }

  // ファイル選択ハンドラー
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          setUserAvatar(e.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  if (dataLoading) {
    return <div className="flex justify-center items-center p-8">データを読み込み中...</div>
  }

  if (step === "intro") {
    return (
      <div className="flex flex-col space-y-8 max-w-3xl mx-auto">
        {/* 初期メッセージ */}
        <div className="flex gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={selectedAvatar} alt="メンター" />
            <AvatarFallback>CM</AvatarFallback>
          </Avatar>
          <div className="bg-gray-100 rounded-lg p-4 flex-1">
            <p className="text-gray-800">{messages[0].content}</p>
          </div>
        </div>

        {/* アバター選択 */}
        <div>
          <h3 className="text-center mb-4">メンターのアバターを選んでください</h3>
          <div className="flex justify-center gap-4">
            <button
              className={`rounded-full overflow-hidden border-4 ${selectedAvatar === "/placeholder.svg?height=100&width=100" ? "border-blue-500" : "border-transparent"}`}
              onClick={() => setSelectedAvatar("/placeholder.svg?height=100&width=100")}
            >
              <Avatar className="h-24 w-24">
                <AvatarImage src="/placeholder.svg?height=100&width=100" alt="メンター1" />
                <AvatarFallback>M1</AvatarFallback>
              </Avatar>
            </button>
          </div>
          <p className="text-center mt-2 text-sm text-gray-500">(画像をクリックして変更できます)</p>
        </div>

        {/* ユーザーアバター */}
        <div>
          <h3 className="text-center mb-4">あなたの写真を設定してください</h3>
          <div className="flex justify-center">
            <label htmlFor="avatar-upload" className="cursor-pointer">
              <Avatar className="h-24 w-24 border-2 border-dashed border-gray-300 flex items-center justify-center">
                <AvatarImage src={userAvatar} alt="ユーザー" />
                <AvatarFallback>
                  <span className="text-2xl">+</span>
                </AvatarFallback>
              </Avatar>
              <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
          </div>
          <p className="text-center mt-2 text-sm text-gray-500">(画像をクリックして変更できます)</p>
        </div>

        {/* 名前入力 */}
        <div>
          <div className="flex gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={selectedAvatar} alt="メンター" />
              <AvatarFallback>CM</AvatarFallback>
            </Avatar>
            <div className="bg-gray-100 rounded-lg p-4 flex-1">
              <p className="text-gray-800 mb-3">お名前を教えていただけますか？（ニックネームでも構いません）</p>
              <Input
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="名前を入力してください"
                className="mb-3"
              />
              <Button onClick={handleStartChat} disabled={!userName.trim()}>
                会話を始める
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col space-y-4 max-h-[500px] overflow-y-auto p-4">
        {messages.map((message, index) => (
          <MessageBubble key={index} isUser={message.isUser}>
            {message.content}
          </MessageBubble>
        ))}
        {isLoading && (
          <div className="flex justify-center">
            <div className="animate-pulse text-gray-400">応答を生成中...</div>
          </div>
        )}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex space-x-2">
            <Textarea
              placeholder="質問や悩みを入力してください..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
            />
            <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
              送信
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

