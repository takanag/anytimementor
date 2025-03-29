"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useWorksheet } from "@/context/worksheet-context"
import MessageBubble from "@/components/message-bubble"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, AlertCircle, SproutIcon as Seedling, Sprout } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Image from "next/image"

export default function SeedPlantingWorksheet() {
  const { responses, updateResponse } = useWorksheet()
  const userName = responses.introduction?.name || "あなた"

  // ステップ管理
  const [currentStep, setCurrentStep] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)

  // エクササイズの完了状態
  const [exerciseCompleted, setExerciseCompleted] = useState(!!responses.seedPlanting?.action)

  // エラーメッセージ表示状態
  const [showErrorMessage, setShowErrorMessage] = useState(false)

  // 親コンポーネントにステップの完了状態を伝えるためのカスタムイベント
  useEffect(() => {
    // 最後のステップに到達し、エクササイズが完了していればisCompletedをtrueに設定
    const isAllCompleted = currentStep === steps.length - 1 && exerciseCompleted
    setIsCompleted(isAllCompleted)

    // カスタムイベントを発火して親コンポーネントに通知
    const event = new CustomEvent("stepStatusChange", {
      detail: { isCompleted: isAllCompleted },
    })
    window.dispatchEvent(event)

    return () => {
      // コンポーネントのアンマウント時にもイベントを発火（リセット）
      const resetEvent = new CustomEvent("stepStatusChange", { detail: { isCompleted: false } })
      window.dispatchEvent(resetEvent)
    }
  }, [currentStep, exerciseCompleted])

  // 選択したアクション
  const [selectedAction, setSelectedAction] = useState(responses.seedPlanting?.action || "")
  const [customAction, setCustomAction] = useState(responses.seedPlanting?.customAction || "")

  // 表示状態管理
  const [showActionResponse, setShowActionResponse] = useState(!!responses.seedPlanting?.action)

  // エクササイズタイトルコンポーネント
  const ExerciseTitle = ({ number, title, icon }: { number: number; title: string; icon: React.ReactNode }) => (
    <div className="bg-[#4A593D] text-white p-3 rounded-lg mb-4 flex items-center">
      <div className="bg-white text-[#4A593D] w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium">エクササイズ {number}</p>
        <p className="text-lg font-medium">{title}</p>
      </div>
    </div>
  )

  // エラーメッセージコンポーネント
  const ErrorMessage = () => (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-md flex items-start">
      <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-red-700 font-medium">回答が必要です</p>
        <p className="text-red-600 text-sm">次のステップに進む前に、このエクササイズに回答してください。</p>
      </div>
    </div>
  )

  // ステップコンテンツ
  const steps = [
    // ステップ0: イントロダクション
    {
      title: "チャンスの種まきとは",
      content: (
        <>
          <MessageBubble>
            <p className="text-lg font-medium mb-4">
              「新たに始めること見つけ、実行する」というテーマについて考えてみましょう。
            </p>

            <div className="relative w-full aspect-video max-w-2xl mx-auto mb-6 rounded-lg overflow-hidden">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image_seedplanning.jpg-tAJ7Cn7ZhRyLKqByeBIyBlAbZDKwCN.jpeg"
                alt="チャンスの種まきのイメージ"
                fill
                className="object-cover animate-fade-in rounded-lg"
                priority
              />
            </div>

            <div className="space-y-4">
              <div className="bg-[#F0EEE4] p-4 rounded-lg">
                <p className="mb-2">
                  <span className="font-medium">このステップで行うこと</span>
                </p>
                <p className="mb-2">
                  このステップでは、新たに始めること見つけ、実行する習慣を身に着けるためのきっかけとして、
                  <span className="font-medium">「チャンスの種まき」エクササイズ</span>を行います。
                  このエクササイズは、クランボルツ博士の「計画的偶発性理論」を基に、
                  内発的動機を活かして小さなアクションを起こす習慣づけを目的としています。
                </p>
              </div>

              <p className="mb-2">
                クランボルツ博士の「計画的偶発性理論」では、キャリアの重要な転機の多くが、
                事前に計画されたものではなく、予期せぬ偶然の出会いや機会から生まれることを示しています。
                しかし、この「偶然」は完全に偶然ではなく、
                <span className="font-medium">
                  オープンマインドで好奇心を持ち、機会に気づき、行動する準備ができている人にこそ訪れるもの
                </span>
                です。
              </p>

              <div className="bg-[#F0EEE4] p-4 rounded-lg">
                <p className="mb-2">
                  <span className="font-medium">計画的偶発性とは</span>
                </p>
                <p>
                  「計画的偶発性」とは、偶然の出来事を自分のキャリアや人生にとって意味のある機会に変換する能力のことです。
                  前のステップで見つけた内発的動機は、あなたが本当に情熱を感じる方向性を示しています。
                </p>
              </div>

              <ul className="list-disc pl-5 space-y-2">
                <li>
                  内発的動機を周囲に伝え、理解してもらうことで、周りの人があなたに関連する機会を教えてくれる可能性が高まります
                </li>
                <li>自分の内発的動機を意識することで、日常の中で関連する小さなチャンスに気づきやすくなります</li>
                <li>
                  「いいな」と思ったら即座に小さな一歩を踏み出す習慣を身につけることで、偶然の出会いをチャンスに変えることができます
                </li>
              </ul>

              <div className="bg-[#F0EEE4] p-4 rounded-lg">
                <p className="font-medium mb-2">小さなアクションの事例：</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    Aさん：料理への情熱を周囲に伝えたところ、友人からローカルシェフとの交流会を紹介され、現在は週末の料理教室を開催
                  </li>
                  <li>
                    Bさん：環境問題への関心を職場で話したことから、社内のサステナビリティプロジェクトに誘われ、新しいキャリアパスが開けた
                  </li>
                  <li>
                    Cさん：子どもの教育に関する内発的動機を持ち、地域の放課後プログラムに週1回ボランティアとして参加したことから、教育関連の起業アイデアが生まれた
                  </li>
                </ul>
              </div>

              <p>
                では、さっそく<span className="font-medium">「チャンスの種まき」エクササイズ</span>
                をやってみましょう！
              </p>
            </div>
          </MessageBubble>
        </>
      ),
      isCompleted: true, // イントロダクションは常に完了状態
    },
    // ステップ1: エクササイズ
    {
      title: "エクササイズ：小さな種まきアクション",
      content: (
        <>
          <MessageBubble>
            <ExerciseTitle number={1} title="小さな種まきアクション" icon={<Seedling className="h-5 w-5" />} />

            <p className="mb-4">
              あなたの内発的動機に基づいて、今日または明日にでも実行できる小さなアクションを選びましょう。
            </p>

            <div className="bg-[#F0EEE4] p-4 rounded-lg mb-4">
              <p className="font-medium mb-2">前のステップで見つけた「自分の中にある感性」：</p>
              <div className="space-y-3">
                <div className="bg-white p-3 rounded-lg">
                  <h5 className="font-medium text-[#4A593D] mb-2">内発的動機（尊敬する人物に感じること）：</h5>
                  <ul className="list-disc pl-5">
                    {responses.internalMotivation?.admiredTraits?.map((trait, index) => (
                      <li key={index} className="text-sm">
                        {trait}
                      </li>
                    )) || <li className="text-sm">データがありません</li>}
                  </ul>
                </div>

                {responses.motivation?.values?.some((v) => v.trim() !== "") && (
                  <div className="bg-white p-3 rounded-lg">
                    <h5 className="font-medium text-[#4A593D] mb-2">大切にしている価値観：</h5>
                    <ul className="list-disc pl-5">
                      {responses.motivation?.values
                        ?.filter((v) => v.trim() !== "")
                        .map((value, index) => (
                          <li key={index} className="text-sm">
                            {value}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}

                {responses.motivation?.activities && (
                  <div className="bg-white p-3 rounded-lg">
                    <h5 className="font-medium text-[#4A593D] mb-2">没頭できる活動：</h5>
                    <p className="text-sm pl-2">{responses.motivation?.activities}</p>
                  </div>
                )}
              </div>
            </div>

            <p>これらの内発的動機を踏まえて、以下から実行したい小さなアクションを1つ選んでください。</p>
          </MessageBubble>

          {showErrorMessage && currentStep === 1 && !exerciseCompleted && <ErrorMessage />}

          <div className="user-input-area">
            <RadioGroup
              value={selectedAction}
              onValueChange={(value) => {
                setSelectedAction(value)
                if (value !== "custom") {
                  console.log("Updating seedPlanting action:", value)
                  updateResponse("seedPlanting", "action", value)
                  updateResponse("seedPlanting", "customAction", "")
                  setCustomAction("")
                }
              }}
              className="space-y-4"
            >
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-start space-x-2 mb-2">
                  <RadioGroupItem value="5min" id="action-5min" />
                  <div>
                    <Label htmlFor="action-5min" className="font-medium">
                      5分アクション：
                    </Label>
                    <ul className="list-disc pl-5 mt-1 text-sm space-y-1">
                      <li>内発的動機に関連するキーワードでSNSを5分間だけ検索し、気になる投稿を1つブックマークする</li>
                      <li>興味のある分野の記事を1つだけ読む（読み終わらなくてもOK）</li>
                      <li>関連テーマについて考えたことをメモアプリに3行だけ書き出す</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-start space-x-2 mb-2">
                  <RadioGroupItem value="share" id="action-share" />
                  <div>
                    <Label htmlFor="action-share" className="font-medium">
                      つぶやきシェア：
                    </Label>
                    <ul className="list-disc pl-5 mt-1 text-sm space-y-1">
                      <li>LINEやSNSで、親しい友人1人だけに「最近○○に興味があるんだ」と伝える</li>
                      <li>オンラインコミュニティで「初心者ですが○○に興味があります」と自己紹介する</li>
                      <li>家族や同僚との会話で、さりげなく自分の興味について1文だけ話してみる</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-start space-x-2 mb-2">
                  <RadioGroupItem value="digital" id="action-digital" />
                  <div>
                    <Label htmlFor="action-digital" className="font-medium">
                      デジタル種まき：
                    </Label>
                    <ul className="list-disc pl-5 mt-1 text-sm space-y-1">
                      <li>関連するYouTubeチャンネルやPodcastを1つだけ登録する</li>
                      <li>興味のある分野のニュースレターに1つだけ登録する</li>
                      <li>関連する無料のオンラインイベントを1つだけカレンダーに登録する（参加は後で決めてもOK）</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-start space-x-2 mb-2">
                  <RadioGroupItem value="environment" id="action-environment" />
                  <div>
                    <Label htmlFor="action-environment" className="font-medium">
                      身近な環境変化：
                    </Label>
                    <ul className="list-disc pl-5 mt-1 text-sm space-y-1">
                      <li>
                        デスクトップの壁紙や手帳のカバーなど、毎日目にするものを内発的動機を思い出させるものに変える
                      </li>
                      <li>スマホのホーム画面に関連アプリを1つだけ追加する</li>
                      <li>内発的動機に関連する本や雑誌を本棚の見える位置に置く</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-start space-x-2 mb-2">
                  <RadioGroupItem value="learning" id="action-learning" />
                  <div>
                    <Label htmlFor="action-learning" className="font-medium">
                      マイクロ学習：
                    </Label>
                    <ul className="list-disc pl-5 mt-1 text-sm space-y-1">
                      <li>関連するテーマの5分以内の動画を1つだけ視聴する</li>
                      <li>興味のある分野の用語を3つだけ調べる</li>
                      <li>関連する簡単なクイズやチェックリストに答えてみる</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="custom" id="action-custom" />
                  <div className="w-full">
                    <Label htmlFor="action-custom" className="font-medium">
                      自分で考えたアクション：
                    </Label>
                    {selectedAction === "custom" && (
                      <Textarea
                        value={customAction}
                        onChange={(e) => {
                          setCustomAction(e.target.value)
                          console.log("Updating seedPlanting customAction:", e.target.value)
                          updateResponse("seedPlanting", "customAction", e.target.value)
                          updateResponse("seedPlanting", "action", "custom")
                        }}
                        placeholder="あなた自身のアイデアを入力してください"
                        className="mt-2"
                      />
                    )}
                  </div>
                </div>
              </div>
            </RadioGroup>

            <Button
              onClick={() => {
                if (selectedAction && (selectedAction !== "custom" || customAction.trim())) {
                  setShowActionResponse(true)
                  setExerciseCompleted(true)
                  setShowErrorMessage(false)
                } else {
                  setShowErrorMessage(true)
                }
              }}
              className="bg-[#C4BD97] hover:bg-[#B0A97F] mt-4"
              disabled={!selectedAction || (selectedAction === "custom" && !customAction.trim())}
            >
              回答する
            </Button>
          </div>

          {showActionResponse && (
            <MessageBubble isUser>
              <p>私が選んだアクション：</p>
              {selectedAction === "custom" ? (
                <p className="mt-1">{customAction}</p>
              ) : (
                <p className="mt-1">
                  {selectedAction === "5min" && "5分アクション"}
                  {selectedAction === "share" && "つぶやきシェア"}
                  {selectedAction === "digital" && "デジタル種まき"}
                  {selectedAction === "environment" && "身近な環境変化"}
                  {selectedAction === "learning" && "マイクロ学習"}
                </p>
              )}
            </MessageBubble>
          )}

          {showActionResponse && (
            <MessageBubble>
              <p>
                素晴らしい選択です！「
                {selectedAction === "5min" && "5分アクション"}
                {selectedAction === "share" && "つぶやきシェア"}
                {selectedAction === "digital" && "デジタル種まき"}
                {selectedAction === "environment" && "身近な環境変化"}
                {selectedAction === "learning" && "マイクロ学習"}
                {selectedAction === "custom" && "自分で考えたアクション"}
                」は、内発的動機を活かすための素晴らしい第一歩になります。
              </p>
              <p className="mt-2">
                このような小さなアクションが、予想外の出会いや機会につながることがあります。
                重要なのは、完璧にやろうとせず、まずは行動してみることです。
              </p>
              <p className="mt-2">次のステップでは、このアクションを実行する際のヒントについて解説します。</p>
            </MessageBubble>
          )}
        </>
      ),
      isCompleted: () => exerciseCompleted,
    },
    // ステップ2: 解説
    {
      title: "解説：小さな一歩を踏み出すためのヒント",
      content: (
        <>
          <MessageBubble>
            <ExerciseTitle number={2} title="小さな一歩を踏み出すためのヒント" icon={<Sprout className="h-5 w-5" />} />

            <p className="mb-4">
              選んだアクションを実行するための具体的なヒントをご紹介します。
              これらのヒントを参考に、小さな一歩を確実に踏み出しましょう。
            </p>

            <div className="bg-[#F0EEE4] p-4 rounded-lg mb-4">
              <p className="font-medium mb-2">小さな一歩を確実に踏み出すためのヒント：</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>今日のちょっとしたすき間時間に実行できることを選びましょう</li>
                <li>3分以上かからないものが理想的です</li>
                <li>特別な準備や道具が不要なことを選びましょう</li>
                <li>「やらなければ」ではなく「試してみたい」という気持ちで取り組みましょう</li>
                <li>1つだけ選んで実行すれば十分です</li>
                <li>結果は気にせず、アクションを起こしたこと自体を成功と捉えましょう</li>
              </ul>
            </div>

            <div className="bg-white p-4 rounded-lg border-l-4 border-[#C4BD97] mb-4">
              <p className="font-medium text-[#4A593D] mb-2">アクションを習慣化するコツ：</p>
              <p>
                最初は週に1回、同じ曜日の同じ時間に実行することを決めておくと習慣化しやすくなります。
                例えば「毎週月曜日の朝のコーヒーを飲みながら5分間」など、 既存の習慣と紐づけると続けやすくなります。
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg border-l-4 border-[#C4BD97] mb-4">
              <p className="font-medium text-[#4A593D] mb-2">偶然の出会いを見逃さないために：</p>
              <p>
                内発的動機に関連する話題が出たとき、「それ、私も興味があります」と一言伝えるだけでも、
                思わぬ情報やつながりが生まれることがあります。
                日常の中で、自分の内発的動機に関連する「偶然」に敏感になりましょう。
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg border-l-4 border-[#C4BD97]">
              <p className="font-medium text-[#4A593D] mb-2">記録することの効果：</p>
              <p>
                小さなアクションとその結果を簡単にメモしておくと、後から振り返ったときに
                「偶然」がどのように自分のキャリアに影響したかを理解する助けになります。
                スマホのメモアプリなどを活用して、簡単に記録する習慣をつけてみましょう。
              </p>
            </div>
          </MessageBubble>
        </>
      ),
      isCompleted: true, // 解説は常に完了状態
    },
    // ステップ3: まとめ
    {
      title: "まとめ",
      content: (
        <>
          <MessageBubble>
            <div className="bg-[#4A593D] text-white p-3 rounded-t-lg flex items-center">
              <div className="bg-white text-[#4A593D] w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <span className="font-bold">✓</span>
              </div>
              <p className="font-medium text-lg">まとめ：チャンスの種まき</p>
            </div>

            <div className="border-2 border-t-0 border-[#4A593D] rounded-b-lg p-4 mb-4">
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-[#C4BD97] text-white w-7 h-7 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <span className="font-bold">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-[#4A593D]">計画的偶発性</p>
                    <p>
                      キャリアの重要な転機は、<span className="font-medium">予期せぬ偶然の出会いや機会</span>
                      から生まれることが多いですが、それは準備ができている人にこそ訪れます。
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-[#C4BD97] text-white w-7 h-7 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <span className="font-bold">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-[#4A593D]">小さなアクション</p>
                    <p>
                      内発的動機に基づいた<span className="font-medium">小さなアクションを日常的に起こすこと</span>
                      で、偶然の出会いをチャンスに変えることができます。
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-[#C4BD97] text-white w-7 h-7 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <span className="font-bold">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-[#4A593D]">習慣化のコツ</p>
                    <p>
                      <span className="font-medium">3分以内で完了できる簡単なアクション</span>
                      を選び、既存の習慣と紐づけることで継続しやすくなります。
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-[#C4BD97] text-white w-7 h-7 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <span className="font-bold">4</span>
                  </div>
                  <div>
                    <p className="font-medium text-[#4A593D]">成功の定義</p>
                    <p>
                      結果ではなく、<span className="font-medium">アクションを起こしたこと自体を成功</span>
                      と捉え、小さな一歩を積み重ねていきましょう。
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#F0EEE4] p-4 rounded-lg border-l-4 border-[#C4BD97] mb-4">
              <p className="font-medium">
                {userName}さん、選んだアクションを実行してみましょう。小さな一歩の積み重ねが、
                やがて大きな変化につながります。
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <p className="text-[#4A593D] font-medium">次のステップ</p>
              <p>
                次のステップでは、未来の成功を先取りして祝う「予祝」エクササイズを行います。
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
    // 現在のステップが完了しているかチェック
    const currentStepData = steps[currentStep]
    let isCurrentStepCompleted

    if (typeof currentStepData.isCompleted === "function") {
      isCurrentStepCompleted = currentStepData.isCompleted()
    } else {
      isCurrentStepCompleted = currentStepData.isCompleted
    }

    if (isCurrentStepCompleted) {
      // 完了している場合は次のステップへ進む
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1)
        setShowErrorMessage(false)
      }
    } else {
      // 完了していない場合はエラーメッセージを表示
      setShowErrorMessage(true)
    }
  }

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      setShowErrorMessage(false)
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

