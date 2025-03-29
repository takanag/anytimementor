"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useWorksheet } from "@/context/worksheet-context"
import MessageBubble from "@/components/message-bubble"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Lightbulb, BookOpen, Glasses, AlertCircle } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import Image from "next/image"

export default function BiasWorksheet() {
  const { responses, updateResponse } = useWorksheet()
  const userName = responses.introduction?.name || "あなた"

  // ステップ管理
  const [currentStep, setCurrentStep] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)

  // 各エクササイズの完了状態
  const [exercise1Completed, setExercise1Completed] = useState(!!responses.bias?.workMeanings?.length)
  const [exercise2Completed, setExercise2Completed] = useState(!!responses.bias?.thoughtOrigins?.length)
  const [exercise3Completed, setExercise3Completed] = useState(!!responses.bias?.changeLens)

  // エラーメッセージ表示状態
  const [showErrorMessage, setShowErrorMessage] = useState(false)

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

  // エクササイズ1: 仕事の意味
  const [workMeanings, setWorkMeanings] = useState<string[]>(responses.bias?.workMeanings || [])
  const [otherWorkMeaning, setOtherWorkMeaning] = useState(responses.bias?.otherWorkMeaning || "")

  // エクササイズ2: 考えの由来
  const [thoughtOrigins, setThoughtOrigins] = useState<string[]>(responses.bias?.thoughtOrigins || [])
  const [otherThoughtOrigin, setOtherThoughtOrigin] = useState(responses.bias?.otherThoughtOrigin || "")

  // エクササイズ3: メガネの変え方
  const [changeLens, setChangeLens] = useState(responses.bias?.changeLens || "")
  const [otherChangeLens, setOtherChangeLens] = useState(responses.bias?.otherChangeLens || "")

  // 表示状態管理
  const [showWorkMeaningsResponse, setShowWorkMeaningsResponse] = useState(!!responses.bias?.workMeanings?.length)
  const [showThoughtOriginsResponse, setShowThoughtOriginsResponse] = useState(!!responses.bias?.thoughtOrigins?.length)
  const [showChangeLensResponse, setShowChangeLensResponse] = useState(!!responses.bias?.changeLens)

  // エクササイズ1: 仕事の意味の選択肢
  const workMeaningOptions = [
    "自己成長の場",
    "生活のための手段",
    "社会に貢献する手段",
    "チームや仲間との協働の場",
    "自分の価値を試す場",
    "挑戦し続けるためのフィールド",
    "クリエイティビティを発揮する機会",
    "影響力を発揮するための手段",
    "楽しむもの・ワクワクするもの",
    "習慣・ルーチンの一部",
    "その他",
  ]

  // エクササイズ2: 考えの由来の選択肢
  const thoughtOriginOptions = [
    "影響を受けた上司・メンターとの出会い",
    "成功体験や達成感を得た瞬間",
    "失敗を通じた学びや気づき",
    "書籍・講演・研修でのインスピレーション",
    "仕事を通じての顧客や同僚との対話",
    "環境の変化（転職・異動・昇進など）",
    "家庭やプライベートでの経験",
    "大きな社会課題や使命感の影響",
    "業界・社会の変化を感じたタイミング",
    "学生時代の経験やアルバイト",
    "その他",
  ]

  // エクササイズ3: メガネの変え方の選択肢
  const changeLensOptions = [
    "新しい環境に飛び込む",
    "違う業界・職種の人と対話する",
    "仕事に対する別の視点を持つ人の話を聞く",
    "一度仕事から離れてみる（休暇・リフレッシュ）",
    "意図的に異なる役割を経験してみる",
    "逆の立場で考えてみる（部下・顧客の視点）",
    "フィードバックを受ける・自己評価を振り返る",
    "新しい知識・スキルを学ぶ",
    "過去の仕事経験を振り返り、見方の変遷を確認する",
    "仕事の目的を改めて見直し、再定義する",
    "その他",
  ]

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

  // handleWorkMeaningsChange関数（新規追加）
  const handleWorkMeaningsChange = (option: string, isSelected: boolean) => {
    let newWorkMeanings

    if (isSelected) {
      newWorkMeanings = workMeanings.filter((item) => item !== option)
    } else {
      if (workMeanings.length < 3) {
        newWorkMeanings = [...workMeanings, option]
      } else {
        newWorkMeanings = [...workMeanings]
      }
    }

    setWorkMeanings(newWorkMeanings)
    // 確実に更新されるように、直接値を渡す
    updateResponse("bias", "workMeanings", newWorkMeanings)
  }

  // ステップコンテンツ
  const steps = [
    // ステップ0: イントロダクション
    {
      title: "バイアスとは何か",
      content: (
        <>
          <MessageBubble>
            <p className="text-lg font-medium mb-4">
              「キャリアに対するバイアスに気づく」というテーマについて考えてみましょう。
            </p>

            <div className="relative w-full aspect-square max-w-2xl mx-auto mb-6 rounded-lg overflow-hidden">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image_bias1.jpg-WT2xcQ1czCjJbOSNViOg0pt9witoJ3.jpeg"
                alt="様々な色のメガネをかけた様子"
                fill
                className="object-cover animate-fade-in rounded-lg"
                priority
              />
            </div>

            <div className="space-y-4">
              <div className="bg-[#F0EEE4] p-4 rounded-lg">
                <p className="mb-2">
                  <span className="font-medium">バイアスって何？</span>
                </p>
                <p className="mb-2">
                  バイアスとは、
                  <span className="font-medium">知らず知らずのうちに身につけてしまった思い込みや信念</span>
                  のことです。上の写真のように、私たちは様々な「色眼鏡（バイアス）」を重ねてものごとを見ています。
                </p>
              </div>

              <p className="mb-2">
                私たちは、家庭や学校での教育、仕事での経験、人との関わりを通じて、知らず知らずのうちに「バイアスのメガネ」をかけています。このメガネは、その時々の環境や状況に適応するために役立つこともありますが、無意識にかけていると
                <span className="font-medium">視野が狭くなること</span>もあるんですね。
              </p>

              <div className="bg-[#F0EEE4] p-4 rounded-lg">
                <p className="mb-2">
                  でも、大事なのは
                  <span className="font-medium">
                    「バイアスをなくすこと」ではなく、「どんなメガネをかけているのかに気づくこと」
                  </span>
                  です。この気づきを「ビリーフリセット」と呼びます。
                </p>
              </div>

              <p>
                では、さっそく<span className="font-medium">「自分のバイアスのメガネ」に気づくためのエクササイズ</span>
                をやってみましょう！
              </p>
            </div>
          </MessageBubble>
        </>
      ),
      isCompleted: true, // イントロダクションは常に完了状態
    },
    // ステップ1: エクササイズ1
    {
      title: "エクササイズ①：あなたにとって仕事とは？",
      content: (
        <>
          <MessageBubble>
            <ExerciseTitle number={1} title="あなたにとって仕事とは？" icon={<Lightbulb className="h-5 w-5" />} />
            <p className="mb-2">まずは、{userName}さんにとって「仕事」とは何かを考えてみましょう。</p>
            <p>
              次の中から<span className="font-medium">3つ選んで</span>ください。
            </p>
          </MessageBubble>

          {showErrorMessage && currentStep === 1 && !exercise1Completed && <ErrorMessage />}

          <div className="user-input-area">
            <div className="space-y-2 mb-4">
              {workMeaningOptions.map((option, index) => (
                <div key={index} className="flex items-start space-x-2">
                  {option !== "その他" ? (
                    <>
                      <Checkbox
                        id={`work-meaning-${index}`}
                        checked={workMeanings.includes(option)}
                        onCheckedChange={() => {
                          const isSelected = workMeanings.includes(option)
                          // let newWorkMeanings

                          // if (isSelected) {
                          //   newWorkMeanings = workMeanings.filter((item) => item !== option)
                          // } else {
                          //   // 3つまでしか選べないようにする
                          //   if (workMeanings.length < 3) {
                          //     newWorkMeanings = [...workMeanings, option]
                          //   } else {
                          //     newWorkMeanings = [...workMeanings]
                          //   }
                          // }

                          // setWorkMeanings(newWorkMeanings)
                          // updateResponse("bias", "workMeanings", newWorkMeanings)
                          handleWorkMeaningsChange(option, isSelected)
                        }}
                        disabled={!workMeanings.includes(option) && workMeanings.length >= 3}
                      />
                      <Label htmlFor={`work-meaning-${index}`} className="text-sm">
                        {option}
                      </Label>
                    </>
                  ) : (
                    <>
                      <Checkbox
                        id={`work-meaning-${index}`}
                        checked={workMeanings.includes(option)}
                        onCheckedChange={() => {
                          const isSelected = workMeanings.includes(option)
                          let newWorkMeanings

                          if (isSelected) {
                            newWorkMeanings = workMeanings.filter((item) => item !== option)
                            setOtherWorkMeaning("")
                            updateResponse("bias", "otherWorkMeaning", "")
                          } else {
                            // 3つまでしか選べないようにする
                            if (workMeanings.length < 3) {
                              newWorkMeanings = [...workMeanings, option]
                            } else {
                              newWorkMeanings = [...workMeanings]
                            }
                          }

                          setWorkMeanings(newWorkMeanings)
                          updateResponse("bias", "workMeanings", newWorkMeanings)
                        }}
                        disabled={!workMeanings.includes(option) && workMeanings.length >= 3}
                      />
                      <div className="flex flex-col space-y-1 flex-1">
                        <Label htmlFor={`work-meaning-${index}`} className="text-sm">
                          {option}
                        </Label>
                        {workMeanings.includes(option) && (
                          <Textarea
                            value={otherWorkMeaning}
                            onChange={(e) => {
                              setOtherWorkMeaning(e.target.value)
                              updateResponse("bias", "otherWorkMeaning", e.target.value)
                            }}
                            placeholder="その他の意味を入力してください"
                            className="w-full text-sm"
                          />
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
            <Button
              onClick={() => {
                if (workMeanings.length > 0) {
                  setShowWorkMeaningsResponse(true)
                  setExercise1Completed(true)
                  setShowErrorMessage(false)
                }
              }}
              className="bg-[#C4BD97] hover:bg-[#B0A97F]"
              disabled={workMeanings.length === 0}
            >
              回答する
            </Button>
          </div>

          {showWorkMeaningsResponse && (
            <MessageBubble isUser>
              <p>私にとって仕事とは：</p>
              <ul className="list-disc pl-5 mt-1">
                {workMeanings.map((meaning, index) => (
                  <li key={index}>{meaning === "その他" ? `その他: ${otherWorkMeaning}` : meaning}</li>
                ))}
              </ul>
            </MessageBubble>
          )}

          {showWorkMeaningsResponse && (
            <MessageBubble>
              <p>
                素晴らしい選択ですね！仕事に対する見方は人それぞれで、{userName}さんが選んだものは{userName}
                さんの価値観を反映しています。
              </p>
              <p className="mt-2">
                これらの価値観は、{userName}さんのキャリア選択や仕事への取り組み方に大きな影響を与えています。
              </p>
              <p className="mt-2">では、次の質問に進みましょう。その考え方はどこから来たのでしょうか？</p>
            </MessageBubble>
          )}
        </>
      ),
      isCompleted: () => exercise1Completed,
    },
    // ステップ2: エクササイズ2
    {
      title: "エクササイズ②：その考えはどこから来た？",
      content: (
        <>
          <MessageBubble>
            <ExerciseTitle number={2} title="その考えはどこから来た？" icon={<BookOpen className="h-5 w-5" />} />
            <p className="mb-2">次に、「仕事」に対するその考え方は、どのように身についたのかを考えてみましょう。</p>
            <p>
              次の中から<span className="font-medium">当てはまるものをすべて選んでください</span>。
            </p>
          </MessageBubble>

          {showErrorMessage && currentStep === 2 && !exercise2Completed && <ErrorMessage />}

          <div className="user-input-area">
            <div className="space-y-2 mb-4">
              {thoughtOriginOptions.map((option, index) => (
                <div key={index} className="flex items-start space-x-2">
                  {option !== "その他" ? (
                    <>
                      <Checkbox
                        id={`thought-origin-${index}`}
                        checked={thoughtOrigins.includes(option)}
                        onCheckedChange={() => {
                          const isSelected = thoughtOrigins.includes(option)
                          let newThoughtOrigins

                          if (isSelected) {
                            newThoughtOrigins = thoughtOrigins.filter((item) => item !== option)
                          } else {
                            newThoughtOrigins = [...thoughtOrigins, option]
                          }

                          setThoughtOrigins(newThoughtOrigins)
                          updateResponse("bias", "thoughtOrigins", newThoughtOrigins)
                        }}
                      />
                      <Label htmlFor={`thought-origin-${index}`} className="text-sm">
                        {option}
                      </Label>
                    </>
                  ) : (
                    <>
                      <Checkbox
                        id={`thought-origin-${index}`}
                        checked={thoughtOrigins.includes(option)}
                        onCheckedChange={() => {
                          const isSelected = thoughtOrigins.includes(option)
                          let newThoughtOrigins

                          if (isSelected) {
                            newThoughtOrigins = thoughtOrigins.filter((item) => item !== option)
                            setOtherThoughtOrigin("")
                            updateResponse("bias", "otherThoughtOrigin", "")
                          } else {
                            newThoughtOrigins = [...thoughtOrigins, option]
                          }

                          setThoughtOrigins(newThoughtOrigins)
                          updateResponse("bias", "thoughtOrigins", newThoughtOrigins)
                        }}
                      />
                      <div className="flex flex-col space-y-1 flex-1">
                        <Label htmlFor={`thought-origin-${index}`} className="text-sm">
                          {option}
                        </Label>
                        {thoughtOrigins.includes(option) && (
                          <Textarea
                            value={otherThoughtOrigin}
                            onChange={(e) => {
                              setOtherThoughtOrigin(e.target.value)
                              updateResponse("bias", "otherThoughtOrigin", e.target.value)
                            }}
                            placeholder="その他の由来を入力してください"
                            className="w-full text-sm"
                          />
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
            <Button
              onClick={() => {
                if (thoughtOrigins.length > 0) {
                  setShowThoughtOriginsResponse(true)
                  setExercise2Completed(true)
                  setShowErrorMessage(false)
                }
              }}
              className="bg-[#C4BD97] hover:bg-[#B0A97F]"
              disabled={thoughtOrigins.length === 0}
            >
              回答する
            </Button>
          </div>

          {showThoughtOriginsResponse && (
            <MessageBubble isUser>
              <p>私の考えの由来：</p>
              <ul className="list-disc pl-5 mt-1">
                {thoughtOrigins.map((origin, index) => (
                  <li key={index}>{origin === "その他" ? `その他: ${otherThoughtOrigin}` : origin}</li>
                ))}
              </ul>
            </MessageBubble>
          )}

          {showThoughtOriginsResponse && (
            <MessageBubble>
              <p>興味深い振り返りですね！私たちの仕事に対する考え方は、様々な経験や出会いから形作られています。</p>
              <p className="mt-2">
                あなたが選んだ項目からは、これまでの人生経験が今のキャリア観に大きく影響していることがわかります。
              </p>
              <p className="mt-2">
                このように自分の考えの由来を理解することで、「なぜ自分はこう考えるのか」という気づきが生まれ、より
                {userName}さんらしいキャリア選択ができるようになります。
              </p>
              <p className="mt-2">
                では、次のステップに進みましょう。バイアスのメガネを変える方法について考えてみましょう。
              </p>
            </MessageBubble>
          )}
        </>
      ),
      isCompleted: () => exercise2Completed,
    },
    // ステップ3: エクササイズ3
    {
      title: "エクササイズ③：メガネを外したり、かけ直したりするには？",
      content: (
        <>
          <MessageBubble>
            <ExerciseTitle
              number={3}
              title="メガネを外したり、かけ直したりするには？"
              icon={<Glasses className="h-5 w-5" />}
            />
            <p className="mb-2">
              最後に、「バイアスのメガネ」を意識的に外したり、新しいメガネをかけたりする方法を考えてみましょう。
            </p>
            <p>
              次の中から<span className="font-medium">できそうなものを1つ選んでください</span>。
            </p>
          </MessageBubble>

          {showErrorMessage && currentStep === 3 && !exercise3Completed && <ErrorMessage />}

          <div className="user-input-area">
            <RadioGroup
              value={changeLens}
              onValueChange={(value) => {
                setChangeLens(value)
                updateResponse("bias", "changeLens", value)
                if (value === "その他") {
                  // その他を選んだ場合は何もしない
                } else {
                  setOtherChangeLens("")
                  updateResponse("bias", "otherChangeLens", "")
                  setShowChangeLensResponse(true)
                  setExercise3Completed(true)
                  setShowErrorMessage(false)
                }
              }}
            >
              <div className="space-y-2 mb-4">
                {changeLensOptions.map((option, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    {option !== "その他" ? (
                      <>
                        <RadioGroupItem value={option} id={`change-lens-${index}`} />
                        <Label htmlFor={`change-lens-${index}`} className="text-sm">
                          {option}
                        </Label>
                      </>
                    ) : (
                      <>
                        <RadioGroupItem value={option} id={`change-lens-${index}`} />
                        <div className="flex flex-col space-y-1 flex-1">
                          <Label htmlFor={`change-lens-${index}`} className="text-sm">
                            {option}
                          </Label>
                          {changeLens === "その他" && (
                            <Textarea
                              value={otherChangeLens}
                              onChange={(e) => {
                                setOtherChangeLens(e.target.value)
                                updateResponse("bias", "otherChangeLens", e.target.value)
                              }}
                              placeholder="その他の方法を入力してください"
                              className="w-full text-sm"
                            />
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </RadioGroup>
            {changeLens === "その他" && (
              <Button
                onClick={() => {
                  if (otherChangeLens.trim()) {
                    setShowChangeLensResponse(true)
                    setExercise3Completed(true)
                    setShowErrorMessage(false)
                  }
                }}
                className="bg-[#C4BD97] hover:bg-[#B0A97F]"
                disabled={!otherChangeLens.trim()}
              >
                回答する
              </Button>
            )}
          </div>

          {showChangeLensResponse && (
            <MessageBubble isUser>
              <p>私が選んだ方法：</p>
              <p className="mt-1">{changeLens === "その他" ? `その他: ${otherChangeLens}` : changeLens}</p>
            </MessageBubble>
          )}

          {showChangeLensResponse && (
            <MessageBubble>
              <p>
                素晴らしい選択です！「{changeLens === "その他" ? otherChangeLens : changeLens}
                」は、新しい視点を得るための効果的な方法ですね。
              </p>
              <p className="mt-2">
                このような意識的な行動を通じて、私たちは自分のバイアスに気づき、必要に応じて視点を変えることができます。
              </p>
              <p className="mt-2">
                バイアスのメガネは「良い・悪い」ではなく、
                <span className="font-medium">状況に応じて外したり、かけ直したりするもの</span>です。
              </p>
              <p className="mt-2">
                {userName}さんが選んだ方法を実践することで、より柔軟にキャリアを考えられるようになりますよ！
              </p>
            </MessageBubble>
          )}
        </>
      ),
      isCompleted: () => exercise3Completed,
    },
    // ステップ4: まとめ
    {
      title: "まとめ",
      content: (
        <>
          <MessageBubble>
            <div className="bg-[#4A593D] text-white p-3 rounded-t-lg flex items-center">
              <div className="bg-white text-[#4A593D] w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <span className="font-bold">✓</span>
              </div>
              <p className="font-medium text-lg">まとめ：バイアスに気づく</p>
            </div>

            <div className="border-2 border-t-0 border-[#4A593D] rounded-b-lg p-4 mb-4">
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-[#C4BD97] text-white w-7 h-7 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <span className="font-bold">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-[#4A593D]">バイアスとは</p>
                    <p>
                      <span className="font-medium">無意識のうちに身につけた思い込みや信念</span>のことです。
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-[#C4BD97] text-white w-7 h-7 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <span className="font-bold">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-[#4A593D]">気づくことが大切</p>
                    <p>
                      まずは「どんなメガネをかけているのか」に<span className="font-medium">気づくことが大切</span>
                      です。
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-[#C4BD97] text-white w-7 h-7 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <span className="font-bold">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-[#4A593D]">メガネの付け替え</p>
                    <p>
                      バイアスのメガネは、意識的に
                      <span className="font-medium">外したり、かけ直したりすることができます</span>。
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-[#C4BD97] text-white w-7 h-7 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <span className="font-bold">4</span>
                  </div>
                  <div>
                    <p className="font-medium text-[#4A593D]">視野を広げる</p>
                    <p>
                      こうした視点を持つことで、
                      <span className="font-medium">より広い選択肢の中からキャリアをデザインできる</span>
                      ようになります。
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#F0EEE4] p-4 rounded-lg border-l-4 border-[#C4BD97] mb-4">
              <p className="font-medium">
                {userName}さん、これらの気づきを大事にしながら、自分のキャリアについて考えてみましょう！
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <p className="text-[#4A593D] font-medium">次のステップ</p>
              <p>
                次のステップでは、あなたの内発的動機について探っていきます。「次のステップへ」ボタンをクリックして進みましょう。
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

