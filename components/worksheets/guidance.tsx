"use client"

import { useState, useEffect } from "react"
import MessageBubble from "@/components/message-bubble"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { useWorksheet } from "@/context/worksheet-context"

export default function GuidanceWorksheet() {
  const { responses } = useWorksheet()
  const userName = responses.introduction?.name || "あなた"
  const mentorName = responses.introduction?.mentorName || "キャリアメンター"
  const [currentStep, setCurrentStep] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [hasAcknowledged, setHasAcknowledged] = useState(false)

  // 親コンポーネントにステップの完了状態を伝えるためのカスタムイベント
  useEffect(() => {
    // 最後のステップでチェックボックスがチェックされたらisCompletedをtrueに設定
    const isLastStep = currentStep === guidanceSteps.length - 1
    const isCompletedStatus = isLastStep && hasAcknowledged

    setIsCompleted(isCompletedStatus)

    // カスタムイベントを発火して親コンポーネントに通知
    const event = new CustomEvent("stepStatusChange", {
      detail: { isCompleted: isCompletedStatus },
    })
    window.dispatchEvent(event)

    return () => {
      // コンポーネントのアンマウント時にもイベントを発火（リセット）
      const resetEvent = new CustomEvent("stepStatusChange", { detail: { isCompleted: false } })
      window.dispatchEvent(resetEvent)
    }
  }, [currentStep, hasAcknowledged])

  const guidanceSteps = [
    {
      title: "メンタリングのガイダンス",
      content: (
        <>
          <p className="text-lg font-medium mb-4">メンタリングのガイダンス</p>

          <div className="bg-[#F0EEE4] p-4 rounded-lg border-l-4 border-[#C4BD97] mb-4">
            <p className="font-medium">
              このガイダンスでは、メンタリングの目的や進め方について5つのポイントをご紹介します。
            </p>
          </div>

          <p>
            メンタリングを通じて、{userName}
            さん自身のキャリアについて新しい視点を得ることができます。画面下部の矢印ボタンで進めていってください。
          </p>
        </>
      ),
    },
    {
      title: "1. メンタリングの目的",
      content: (
        <>
          <h3 className="font-medium text-lg text-[#4F6228] mb-4">1. メンタリングの目的</h3>

          <div className="mb-6">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image_guidance_1.jpg-R5nSmHBc2agkZ4oAhfkoVyHrcjzjsP.jpeg"
              alt="メンタリングの目的"
              width={500}
              height={400}
              className="mx-auto rounded-lg"
            />
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-4">
            <p className="mb-2">
              メンタリングの目的は、
              <span className="font-medium">
                プロフェッショナルとして社会に貢献しながら、自分自身の価値を高め続けること
              </span>
              です。
            </p>
            <p>
              そのためには、受け身ではなく<span className="font-medium">「自律的キャリア形成」</span>
              を目指すことが大切です。
            </p>
          </div>

          <div className="bg-[#F0EEE4] p-4 rounded-lg">
            <p className="font-medium mb-2">具体的には、</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                自分の中にある<span className="font-medium">「内発的動機」（＝心からやりたいこと）</span>
                を見つけて、それをキャリアに活かしていくこと。
              </li>
              <li>
                そのための第一歩として、<span className="font-medium">メンタリングを習慣化すること</span>です。
              </li>
            </ul>
          </div>
        </>
      ),
    },
    {
      title: "2. 自律的キャリア形成とは？",
      content: (
        <>
          <h3 className="font-medium text-lg text-[#4F6228] mb-4">2. 自律的キャリア形成とは？</h3>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6">
            <p>
              キャリアを「会社や社会に決められるもの」ではなく、
              <span className="font-medium">自分で主体的に作っていく</span>ことを指します。
            </p>
          </div>

          <div className="space-y-4 mb-4">
            <div className="bg-[#F0EEE4] p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-[#C4BD97] rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm font-bold">1</span>
                </div>
                <p className="font-medium">自分の価値観や強みを理解する</p>
              </div>
              <p className="text-sm text-gray-600 pl-11">
                自分が大切にしていることや得意なことを知ることから始まります。
              </p>
            </div>

            <div className="bg-[#F0EEE4] p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-[#C4BD97] rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm font-bold">2</span>
                </div>
                <p className="font-medium">環境の変化に適応する</p>
              </div>
              <p className="text-sm text-gray-600 pl-11">変化を恐れず、新しい状況に柔軟に対応する姿勢を持ちます。</p>
            </div>

            <div className="bg-[#F0EEE4] p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-[#C4BD97] rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm font-bold">3</span>
                </div>
                <p className="font-medium">自ら行動し続ける</p>
              </div>
              <p className="text-sm text-gray-600 pl-11">受け身ではなく、自分から積極的に行動を起こします。</p>
            </div>
          </div>

          <div className="bg-[#4A593D] text-white p-3 rounded-lg text-center">
            <p className="font-medium">自分の人生は自分で選択し、創造していくものです</p>
          </div>
        </>
      ),
    },
    {
      title: "3. メンタリングのアプローチ",
      content: (
        <>
          <h3 className="font-medium text-lg text-[#4F6228] mb-4">
            3. メンタリングのアプローチ：「やさしいキャリアデザイン」
          </h3>

          <div className="mb-6">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image_guidance_2.jpg-iqC5GLZp8fpNOdk38drP0jBtlS3AbI.jpeg"
              alt="やさしいアプローチ"
              width={500}
              height={400}
              className="mx-auto rounded-lg"
            />
          </div>

          <div className="bg-[#F0EEE4] p-4 rounded-lg mb-4 border-l-4 border-[#C4BD97]">
            <p className="font-medium">
              私たちが大切にしているのは<span className="font-medium">「やさしいキャリアデザイン」</span>です。
            </p>
            <p>
              これは、<span className="font-medium">思考ではなく感性を使いながら自己肯定感を高めていく</span>
              アプローチです。
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <h4 className="font-medium text-[#4A593D] mb-2">感性を大切にする</h4>
              <p>
                思考ばかりに頼らず、<span className="font-medium">自分の中にある感性を大切にすること</span>。
              </p>
              <p className="text-sm text-gray-600 mt-2">（「自分の感性はコントロールできる」という考え方ですね。）</p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <h4 className="font-medium text-[#4A593D] mb-2">心理学の知識を活用</h4>
              <p>心理学の知識も活用しながら、自分の内面にしっかり向き合っていきます。</p>
            </div>
          </div>
        </>
      ),
    },
    {
      title: "4. メンタリングのルール",
      content: (
        <>
          <h3 className="font-medium text-lg text-[#4F6228] mb-4">4. メンタリングのルール（約束）</h3>

          <div className="bg-[#F0EEE4] p-4 rounded-lg mb-6">
            <p className="font-medium">
              メンタリングを効果的に進めるために、<span className="font-medium">大切なルール</span>があります。
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border-t-4 border-[#C4BD97]">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-[#4A593D] rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm font-bold">1</span>
                </div>
                <h4 className="font-medium">アイメッセージを使う</h4>
              </div>
              <p className="text-sm pl-11">「〇〇すべき」ではなく、「{userName}さんはどうしたいか」を大事にする。</p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border-t-4 border-[#C4BD97]">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-[#4A593D] rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm font-bold">2</span>
                </div>
                <h4 className="font-medium">無条件受容</h4>
              </div>
              <ul className="text-sm space-y-1 pl-11">
                <li>{userName}さんの考えや感じたことは、すべて正解です。</li>
                <li>答えたくない質問は パスしてOK！</li>
                <li>相手はAIなので、忖度（そんたく）や「正しい答え」を探す必要はありません。</li>
              </ul>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border-t-4 border-[#C4BD97]">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-[#4A593D] rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm font-bold">3</span>
                </div>
                <h4 className="font-medium">機密保持</h4>
              </div>
              <ul className="text-sm space-y-1 pl-11">
                <li>ここで話したことは 誰にも言いません。</li>
                <li>安心して話せる場所を守ります。</li>
              </ul>
            </div>
          </div>
        </>
      ),
    },
    {
      title: "5. なぜ「感性」を使うのか？",
      content: (
        <>
          <h3 className="font-medium text-lg text-[#4F6228] mb-4">5. なぜ「感性」を使うのか？</h3>

          <div className="mb-6">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image_guidance_3.jpg-BtFGiBDT5jTXbNHwtYn56THuUJAw2N.jpeg"
              alt="感性と理性"
              width={500}
              height={400}
              className="mx-auto rounded-lg"
            />
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-4">
            <p>
              多くの人は、<span className="font-medium">「理性（思考）」</span>によってキャリアを考えがちです。
              でも、それが<span className="font-medium">不安や恐怖の引き金</span>になることもあります。
            </p>
          </div>

          <div className="bg-[#F0EEE4] p-4 rounded-lg mb-4">
            <p className="italic text-gray-700">
              「期待される自分」を意識しすぎて、
              <br />
              「失敗したらどうしよう…」
              <br />
              「期待に応えられなかったら仕事がなくなるかも…」
            </p>
            <p className="mt-2">と考えてしまうこと、{userName}さんもありませんか？</p>
          </div>

          <div className="space-y-4 mb-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border-t-4 border-[#C4BD97]">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-[#4A593D] rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm font-bold">1</span>
                </div>
                <h4 className="font-medium">理性の限界</h4>
              </div>
              <p className="text-sm pl-11">
                理性は〇✕で判断しやすいため、
                <span className="font-medium">「正解を求めすぎて本当の自分を抑えてしまう」</span>
                ことがあるんですね。
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border-t-4 border-[#C4BD97]">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 bg-[#4A593D] rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm font-bold">2</span>
                </div>
                <h4 className="font-medium">感性の力</h4>
              </div>
              <p className="text-sm pl-11">
                <span className="font-medium">「感性（身体感覚）」はウソをつきません</span>。
                自分の本当の気持ちに気づき、それを受け入れ、必要ならコントロールすることもできます。
              </p>
            </div>
          </div>

          <div className="bg-[#4A593D] text-white p-3 rounded-lg text-center">
            <p className="font-medium">感性を大切にすることで、自分らしいキャリアを見つけられます</p>
          </div>
        </>
      ),
    },
    {
      title: "まとめ",
      content: (
        <>
          <p className="font-medium text-lg mb-4">これでガイダンスは終了です</p>

          <div className="bg-[#F0EEE4] p-4 rounded-lg mb-6">
            <h4 className="font-medium text-[#4A593D] mb-2">ポイントのおさらい</h4>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                メンタリングの目的は<span className="font-medium">自律的キャリア形成</span>を支援すること
              </li>
              <li>
                <span className="font-medium">「やさしいキャリアデザイン」</span>のアプローチで進めていく
              </li>
              <li>
                アイメッセージ、無条件受容、機密保持の<span className="font-medium">3つのルール</span>を大切に
              </li>
              <li>
                <span className="font-medium">感性</span>を大切にして、自分らしいキャリアを見つける
              </li>
            </ul>
          </div>

          <p className="mb-6">
            {userName}さん、これらのポイントを念頭に置きながら、これからのワークシートに取り組んでいきましょう。
            何か質問があれば、いつでも聞いてくださいね。私は{userName}さんの{mentorName}として、精一杯サポートします。
          </p>

          <div className="p-4 bg-[#F0EEE4] rounded-lg border-l-4 border-[#C4BD97]">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="acknowledge-guidance"
                checked={hasAcknowledged}
                onCheckedChange={(checked) => {
                  setHasAcknowledged(checked === true)
                }}
              />
              <Label htmlFor="acknowledge-guidance" className="text-sm font-medium cursor-pointer">
                ガイダンスの内容を理解し、メンタリングを始める準備ができました。次のステップに進みます。
              </Label>
            </div>
          </div>
        </>
      ),
    },
  ]

  const goToNextStep = () => {
    if (currentStep < guidanceSteps.length - 1) {
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
      <MessageBubble>{guidanceSteps[currentStep].content}</MessageBubble>

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
          {guidanceSteps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${index === currentStep ? "bg-[#C4BD97]" : "bg-gray-300"}`}
            />
          ))}
        </div>

        {currentStep < guidanceSteps.length - 1 ? (
          <Button variant="outline" size="sm" onClick={goToNextStep} className="flex items-center gap-1">
            次へ
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <div className="w-[72px]"></div> // Empty div to maintain layout spacing
        )}
      </div>
    </div>
  )
}

