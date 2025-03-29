"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useWorksheet } from "@/context/worksheet-context"
import MessageBubble from "@/components/message-bubble"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, AlertCircle, ThumbsUp, ThumbsDown, Lightbulb } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import Image from "next/image"

export default function InternalMotivationWorksheet() {
  const { responses, updateResponse } = useWorksheet()
  const userName = responses.introduction?.name || "あなた"

  // ステップ管理
  const [currentStep, setCurrentStep] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)

  // 各エクササイズの完了状態
  const [exercise1Completed, setExercise1Completed] = useState(
    responses.internalMotivation?.admiredTraits?.every((trait) => trait.trim() !== ""),
  )
  const [exercise2Completed, setExercise2Completed] = useState(
    responses.internalMotivation?.dislikedTraits?.every((trait) => trait.trim() !== ""),
  )

  // エラーメッセージ表示状態
  const [showErrorMessage, setShowErrorMessage] = useState(false)

  // 親コンポーネントにステップの完了状態を伝えるためのカスタムイベント
  useEffect(() => {
    // エクササイズ1、2が完了し、かつ解説（ステップ3）まで進んだ場合にのみisCompletedをtrueにする
    const isAllCompleted = exercise1Completed && exercise2Completed && currentStep >= 3
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
  }, [currentStep, exercise1Completed, exercise2Completed])

  // エクササイズ1: 尊敬する人物に感じること
  const [admiredTraits, setAdmiredTraits] = useState<string[]>(
    responses.internalMotivation?.admiredTraits || ["", "", ""],
  )

  // エクササイズ2: 嫌いな人物に感じること
  const [dislikedTraits, setDislikedTraits] = useState<string[]>(
    responses.internalMotivation?.dislikedTraits || ["", "", ""],
  )

  // 表示状態管理
  const [showAdmiredTraitsResponse, setShowAdmiredTraitsResponse] = useState(
    responses.internalMotivation?.admiredTraits?.every((trait) => trait.trim() !== ""),
  )
  const [showDislikedTraitsResponse, setShowDislikedTraitsResponse] = useState(
    responses.internalMotivation?.dislikedTraits?.every((trait) => trait.trim() !== ""),
  )

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
      title: "内発的動機とは何か",
      content: (
        <>
          <MessageBubble>
            <p className="text-lg font-medium mb-4">
              「自分の内発的動機を見つける」というテーマについて考えてみましょう。
            </p>

            <div className="relative w-full aspect-video max-w-2xl mx-auto mb-6 rounded-lg overflow-hidden">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image_guidance_2.jpg-n831xQrrvbaLplCmVK6ywTXyaxrgmM.jpeg"
                alt="内発的動機のイメージ"
                fill
                className="object-cover animate-fade-in rounded-lg"
                priority
              />
            </div>

            <div className="space-y-4">
              <div className="bg-[#F0EEE4] p-4 rounded-lg">
                <p className="mb-2">
                  <span className="font-medium">内発的動機とは何？</span>
                </p>
                <p className="mb-2">
                  内発的動機とは、<span className="font-medium">心で感じるもの</span>です。
                  理由がなく、それ自体が目的であり、ただ自然に湧いてくるものです。
                </p>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex-1">
                  <p className="font-medium text-[#4A593D] mb-2">内発的動機</p>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>心で感じるもの</li>
                    <li>理由がない</li>
                    <li>それ自体が目的</li>
                    <li>自然に湧いてくる</li>
                  </ul>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex-1">
                  <p className="font-medium text-[#4A593D] mb-2">外発的動機</p>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>頭で思考するもの</li>
                    <li>理由がある</li>
                    <li>他の何かの手段</li>
                    <li>恐れや不安が根底にある</li>
                  </ul>
                </div>
              </div>

              <p className="mb-2">
                外発的動機は、不安や恐怖が癒やされない限り求め続けます。他人と比較するから終わりがありません。
                外側には本当の自分のやりたいことは見つかりません。「やりたいことがない」という人は、
                <span className="font-medium">内発的動機が見つけられていない</span>状態なのです。
              </p>

              <div className="bg-[#F0EEE4] p-4 rounded-lg">
                <p className="mb-2">
                  メガネに気づいて付け替え自由になったら、次は内発的動機を見つけましょう。
                  身体や心で感じたことを言語化してみることが大切です。
                </p>
              </div>

              <p>
                では、さっそく<span className="font-medium">「自分の内発的動機」を見つけるためのエクササイズ</span>
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
      title: "エクササイズ①：尊敬する人物に感じること",
      content: (
        <>
          <MessageBubble>
            <ExerciseTitle number={1} title="尊敬する人物に感じること" icon={<ThumbsUp className="h-5 w-5" />} />
            <p className="mb-4">
              {userName}
              さんが尊敬する人物について考えてみましょう。その人に対して、どのような感情や印象を持っていますか？
            </p>
            <p>
              尊敬する人物に感じることを<span className="font-medium">3つ</span>挙げてください。
            </p>
          </MessageBubble>

          {showErrorMessage && currentStep === 1 && !exercise1Completed && <ErrorMessage />}

          <div className="user-input-area">
            <div className="space-y-3 mb-4">
              {[0, 1, 2].map((index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="bg-[#C4BD97] text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium">{index + 1}</span>
                  </div>
                  <Textarea
                    value={admiredTraits[index]}
                    onChange={(e) => {
                      const newTraits = [...admiredTraits]
                      newTraits[index] = e.target.value
                      setAdmiredTraits(newTraits)
                      updateResponse("internalMotivation", "admiredTraits", newTraits)
                    }}
                    placeholder={`尊敬する人物に感じること ${index + 1}`}
                    className="w-full"
                  />
                </div>
              ))}
            </div>
            <Button
              onClick={() => {
                if (admiredTraits.every((trait) => trait.trim() !== "")) {
                  setShowAdmiredTraitsResponse(true)
                  setExercise1Completed(true)
                  setShowErrorMessage(false)
                } else {
                  setShowErrorMessage(true)
                }
              }}
              className="bg-[#C4BD97] hover:bg-[#B0A97F]"
            >
              回答する
            </Button>
          </div>

          {showAdmiredTraitsResponse && (
            <MessageBubble isUser>
              <p>尊敬する人物に感じること：</p>
              <ul className="list-disc pl-5 mt-1">
                {admiredTraits.map((trait, index) => (
                  <li key={index}>{trait}</li>
                ))}
              </ul>
            </MessageBubble>
          )}

          {showAdmiredTraitsResponse && (
            <MessageBubble>
              <p>
                素晴らしい洞察ですね！尊敬する人物に感じる特性は、実は{userName}
                さん自身の中にも存在している可能性が高いものです。
              </p>
              <p className="mt-2">
                これらの特性は、{userName}さんが無意識のうちに価値を置いているものであり、{userName}
                さんの内発的動機を探る重要な手がかりとなります。
              </p>
              <p className="mt-2">では、次の質問に進みましょう。</p>
            </MessageBubble>
          )}
        </>
      ),
      isCompleted: () => exercise1Completed,
    },
    // ステップ2: エクササイズ2
    {
      title: "エクササイズ②：嫌いな人物に感じること",
      content: (
        <>
          <MessageBubble>
            <ExerciseTitle number={2} title="嫌いな人物に感じること" icon={<ThumbsDown className="h-5 w-5" />} />
            <p className="mb-4">
              次に、{userName}
              さんが苦手に感じる人物について考えてみましょう。その人に対して、あなたはどのような感情や印象を持っていますか？
            </p>
            <p>
              嫌いな人物に感じることを<span className="font-medium">3つ</span>挙げてください。
            </p>
          </MessageBubble>

          {showErrorMessage && currentStep === 2 && !exercise2Completed && <ErrorMessage />}

          <div className="user-input-area">
            <div className="space-y-3 mb-4">
              {[0, 1, 2].map((index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="bg-[#C4BD97] text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium">{index + 1}</span>
                  </div>
                  <Textarea
                    value={dislikedTraits[index]}
                    onChange={(e) => {
                      const newTraits = [...dislikedTraits]
                      newTraits[index] = e.target.value
                      setDislikedTraits(newTraits)
                      updateResponse("internalMotivation", "dislikedTraits", newTraits)
                    }}
                    placeholder={`嫌いな人物に感じること ${index + 1}`}
                    className="w-full"
                  />
                </div>
              ))}
            </div>
            <Button
              onClick={() => {
                if (dislikedTraits.every((trait) => trait.trim() !== "")) {
                  setShowDislikedTraitsResponse(true)
                  setExercise2Completed(true)
                  setShowErrorMessage(false)
                } else {
                  setShowErrorMessage(true)
                }
              }}
              className="bg-[#C4BD97] hover:bg-[#B0A97F]"
            >
              回答する
            </Button>
          </div>

          {showDislikedTraitsResponse && (
            <MessageBubble isUser>
              <p>嫌いな人物に感じること：</p>
              <ul className="list-disc pl-5 mt-1">
                {dislikedTraits.map((trait, index) => (
                  <li key={index}>{trait}</li>
                ))}
              </ul>
            </MessageBubble>
          )}

          {showDislikedTraitsResponse && (
            <MessageBubble>
              <p>
                興味深い回答をありがとうございます。嫌いな人物に感じる特性も、実はあなた自身の内面を映し出す鏡となります。
              </p>
              <p className="mt-2">
                これらの特性に対する強い感情は、{userName}さんが無意識のうちに避けようとしている側面や、{userName}
                さんの価値観と対立するものを示している可能性があります。
              </p>
              <p className="mt-2">次のステップでは、これらのエクササイズの意味について解説します。</p>
            </MessageBubble>
          )}
        </>
      ),
      isCompleted: () => exercise2Completed,
    },
    // ステップ3: エクササイズ3 (修正: 説明部分を削除)
    {
      title: "エクササイズ③：シャドウと内発的動機",
      content: (
        <>
          <MessageBubble>
            <ExerciseTitle number={3} title="シャドウと内発的動機" icon={<Lightbulb className="h-5 w-5" />} />

            <p className="mb-4">
              直前にエクササイズした「尊敬する人物」に感じる3つの点を、{userName}
              さんを良く知る周囲の人に「これは誰の強みだと思う？」と聞いてみましょう。{userName}
              さんが気づいていない驚きの回答が得られるはずです。
            </p>

            <div className="bg-[#F0EEE4] p-4 rounded-lg mb-4">
              <p className="font-medium mb-2">{userName}さんが尊敬する人物に感じる3つの点：</p>
              <ul className="list-disc pl-5">
                {admiredTraits.map((trait, index) => (
                  <li key={index}>{trait}</li>
                ))}
              </ul>
            </div>
          </MessageBubble>
        </>
      ),
      isCompleted: true, // エクササイズ3は常に完了状態
    },
    // ステップ4: シャドウの解説 (新規追加)
    {
      title: "シャドウと内発的動機の解説",
      content: (
        <>
          <MessageBubble>
            <ExerciseTitle number={3} title="シャドウと内発的動機の解説" icon={<Lightbulb className="h-5 w-5" />} />

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
    // ステップ5: まとめ (元のステップ4を移動)
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

            <p className="mt-4 mb-2">
              ここまでのステップでは「自分の中にある感性」に目を向け、本当の自分を理解するエクササイズをしてきました。
              以下がこれまで理解してきた「自分の中にある感性」をまとめたものです。どのように感じられますか？
              もしやり直したいエクササイズがあれば、その上部メニューにあるステップの番号を押して戻ってやり直してみてください。
            </p>

            <div className="bg-[#F0EEE4] p-6 rounded-lg border-2 border-[#C4BD97] mt-4 mb-6">
              <h4 className="font-medium text-lg text-[#4A593D] mb-4">自分の中にある感性</h4>

              <div className="space-y-6">
                <div className="bg-white p-4 rounded-lg">
                  <h5 className="font-medium text-[#4A593D] mb-3">仕事に対するバイアス</h5>
                  <div className="space-y-3">
                    <div className="border-2 border-[#C4BD97] rounded-lg p-3">
                      <p className="text-sm font-medium text-gray-600 mb-2">かけているメガネ：</p>
                      <ul className="list-disc pl-5">
                        {responses.bias?.workMeanings?.map((meaning, index) => (
                          <li key={index} className="text-sm">
                            {meaning === "その他" ? responses.bias?.otherWorkMeaning : meaning}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="border-2 border-[#C4BD97] rounded-lg p-3">
                      <p className="text-sm font-medium text-gray-600 mb-2">メガネを身に着けた経緯：</p>
                      <ul className="list-disc pl-5">
                        {responses.bias?.thoughtOrigins?.map((origin, index) => (
                          <li key={index} className="text-sm">
                            {origin === "その他" ? responses.bias?.otherThoughtOrigin : origin}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="border-2 border-[#C4BD97] rounded-lg p-3">
                      <p className="text-sm font-medium text-gray-600 mb-2">メガネを外す方法：</p>
                      <p className="text-sm pl-5">
                        {responses.bias?.changeLens === "その他"
                          ? responses.bias?.otherChangeLens
                          : responses.bias?.changeLens}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg">
                  <h5 className="font-medium text-[#4A593D] mb-3">内発的動機</h5>
                  <div className="space-y-3">
                    <div className="border-2 border-[#C4BD97] rounded-lg p-3">
                      <p className="text-sm font-medium text-gray-600 mb-2">憧れ（尊敬する人物に感じること）：</p>
                      <ul className="list-disc pl-5">
                        {responses.internalMotivation?.admiredTraits?.map((trait, index) => (
                          <li key={index} className="text-sm">
                            {trait}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="border-2 border-[#C4BD97] rounded-lg p-3">
                      <p className="text-sm font-medium text-gray-600 mb-2">怒り（嫌いな人物に感じること）：</p>
                      <ul className="list-disc pl-5">
                        {responses.internalMotivation?.dislikedTraits?.map((trait, index) => (
                          <li key={index} className="text-sm">
                            {trait}
                          </li>
                        ))}
                      </ul>
                    </div>
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

