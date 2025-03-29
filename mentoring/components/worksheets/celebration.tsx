"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useWorksheet } from "@/context/worksheet-context"
import MessageBubble from "@/components/message-bubble"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Sparkles, AlertCircle } from "lucide-react" // AlertCircleアイコンを追加

export default function CelebrationWorksheet() {
  const { responses, updateResponse } = useWorksheet()
  const userName = responses.introduction?.name || "あなた"
  const mentorName = responses.introduction?.mentorName || "メンター"

  // ステップの状態管理
  const [currentStep, setCurrentStep] = useState(1)
  const [currentPart, setCurrentPart] = useState(1)
  const [isStepComplete, setIsStepComplete] = useState(false)

  // パート1: タイムスリップ・インタビュー
  const [interviewAnswers, setInterviewAnswers] = useState({
    work: responses.celebration?.interviewAnswers?.work || "",
    fulfillment: responses.celebration?.interviewAnswers?.fulfillment || "",
    schedule: responses.celebration?.interviewAnswers?.schedule || "",
    freeTime: responses.celebration?.interviewAnswers?.freeTime || "",
    advice: responses.celebration?.interviewAnswers?.advice || "",
  })

  // パート2: ニュース記事
  const [newsArticle, setNewsArticle] = useState({
    headline: responses.celebration?.newsArticle?.headline || "",
    lead: responses.celebration?.newsArticle?.lead || "",
    content: responses.celebration?.newsArticle?.content || "",
    quote: responses.celebration?.newsArticle?.quote || "",
  })

  // パート3: お祝いの儀式
  const [ritualType, setRitualType] = useState(responses.celebration?.ritual?.type || "toast")
  const [ritualToast, setRitualToast] = useState(responses.celebration?.ritual?.toast || "")
  const [ritualGift, setRitualGift] = useState(responses.celebration?.ritual?.gift || "")
  const [ritualLetter, setRitualLetter] = useState(responses.celebration?.ritual?.letter || "")

  // 現在の質問インデックス (パート1用)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  // 質問リスト (パート1用)
  const questions = [
    "あなたは今、どんな仕事をしていますか？",
    "仕事の中で最もやりがいを感じることは何ですか？",
    "一日のスケジュールはどのようなものですか？",
    "仕事以外の時間は何をして過ごしていますか？",
    "現在の自分（10年前の自分）に伝えたいことは？",
  ]

  // フィールド名のマッピング (パート1用)
  const fieldMapping = ["work", "fulfillment", "schedule", "freeTime", "advice"]

  // パート1: インタビュー回答の更新
  const handleInterviewAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const field = fieldMapping[currentQuestionIndex]
    const newValue = e.target.value

    setInterviewAnswers((prev) => ({
      ...prev,
      [field]: newValue,
    }))
  }

  // パート2: ニュース記事の更新
  const handleNewsArticleChange = (field: string, value: string) => {
    setNewsArticle((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // パート1: 次の質問へ進む
  const handleNextQuestion = () => {
    const field = fieldMapping[currentQuestionIndex]
    const currentAnswer = interviewAnswers[field as keyof typeof interviewAnswers]

    if (!currentAnswer || !currentAnswer.trim()) {
      alert("回答を入力してください")
      return
    }

    // 回答をコンテキストに保存
    updateResponse("celebration", "interviewAnswers", {
      ...responses.celebration?.interviewAnswers,
      [field]: currentAnswer,
    })

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      // 全ての質問が終了したら、パート2へ
      setCurrentPart(2)
    }
  }

  // パート1: 前の質問に戻る
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  // パート2: 次へ進む
  const handleNewsArticleNext = () => {
    // 全てのフィールドが入力されているか確認
    if (
      !newsArticle.headline.trim() ||
      !newsArticle.lead.trim() ||
      !newsArticle.content.trim() ||
      !newsArticle.quote.trim()
    ) {
      alert("全ての項目を入力してください")
      return
    }

    // コンテキストに保存
    updateResponse("celebration", "newsArticle", newsArticle)

    // パート3へ進む
    setCurrentPart(3)
  }

  // パート3: 完了
  const handleRitualComplete = () => {
    // 選択された儀式タイプに応じたフィールドが入力されているか確認
    let isValid = false
    let ritualContent = ""

    switch (ritualType) {
      case "toast":
        isValid = !!ritualToast.trim()
        ritualContent = ritualToast
        break
      case "gift":
        isValid = !!ritualGift.trim()
        ritualContent = ritualGift
        break
      case "letter":
        isValid = !!ritualLetter.trim()
        ritualContent = ritualLetter
        break
    }

    if (!isValid) {
      alert("内容を入力してください")
      return
    }

    // コンテキストに保存
    updateResponse("celebration", "ritual", {
      type: ritualType,
      toast: ritualToast,
      gift: ritualGift,
      letter: ritualLetter,
    })

    // ステップ2（まとめ）へ進む
    setCurrentStep(2)

    // ステップ完了イベントを発火
    const event = new CustomEvent("stepStatusChange", {
      detail: { isCompleted: true },
    })
    window.dispatchEvent(event)
    setIsStepComplete(true)
  }

  // 前のパートに戻る
  const handlePreviousPart = () => {
    if (currentPart > 1) {
      setCurrentPart(currentPart - 1)
    }
  }

  // 保存された回答があれば、適切なステップとパートを表示
  useEffect(() => {
    const celebration = responses.celebration

    if (celebration) {
      // ステップ2（まとめ）が完了しているか
      if (celebration.completed) {
        setCurrentStep(2)
        setIsStepComplete(true)

        // ステップ完了イベントを発火
        const event = new CustomEvent("stepStatusChange", {
          detail: { isCompleted: true },
        })
        window.dispatchEvent(event)
        return
      }

      // パート3（儀式）が完了しているか
      if (
        celebration.ritual &&
        ((celebration.ritual.type === "toast" && celebration.ritual.toast) ||
          (celebration.ritual.type === "gift" && celebration.ritual.gift) ||
          (celebration.ritual.type === "letter" && celebration.ritual.letter))
      ) {
        setCurrentPart(3)
        return
      }

      // パート2（ニュース記事）が完了しているか
      if (
        celebration.newsArticle &&
        celebration.newsArticle.headline &&
        celebration.newsArticle.lead &&
        celebration.newsArticle.content &&
        celebration.newsArticle.quote
      ) {
        setCurrentPart(2)
        return
      }

      // パート1（インタビュー）の進捗を確認
      if (celebration.interviewAnswers) {
        // 回答済みの質問まで進める
        let lastAnsweredIndex = -1
        for (let i = 0; i < fieldMapping.length; i++) {
          const field = fieldMapping[i]
          if (celebration.interviewAnswers[field as keyof typeof celebration.interviewAnswers]) {
            lastAnsweredIndex = i
          } else {
            break
          }
        }

        if (lastAnsweredIndex === fieldMapping.length - 1) {
          // 全ての質問に回答済み
          setCurrentPart(2)
        } else if (lastAnsweredIndex >= 0) {
          // 途中まで回答済み
          setCurrentQuestionIndex(lastAnsweredIndex + 1)
        }
      }
    }
  }, [])

  // 完了状態を更新
  useEffect(() => {
    if (currentStep === 2) {
      // 依存配列からupdateResponseを削除し、無限ループを防ぐ
      const timer = setTimeout(() => {
        updateResponse("celebration", "completed", true)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [currentStep]) // updateResponseを依存配列から削除

  // AIを使って記事を自動生成する関数
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0) // リトライカウンターを追加
  const [useAI, setUseAI] = useState(true) // AIを使用するかどうかのフラグ

  // モック記事を直接生成する関数（APIを呼び出さない）
  const generateMockArticle = () => {
    setIsGenerating(true)
    setGenerationError(null)

    console.log("AIを使わずに直接モック記事を生成します")

    // モックデータを作成
    const mockArticle = {
      headline: `${userName}氏、革新的なアプローチで業界に変革をもたらす`,
      lead: `10年間の着実な努力と独自のビジョンにより、${userName}氏は今や業界の第一人者として認められている。`,
      content: `${interviewAnswers.work || "現在の仕事"} の分野で活躍する${userName}氏は、独自のアプローチと情熱で多くの人々に影響を与えています。\n\n日々の業務では${interviewAnswers.schedule || "効率的なスケジュール管理"}を実践し、${interviewAnswers.fulfillment || "やりがい"}を感じながら仕事に取り組んでいます。\n\nプライベートでは${interviewAnswers.freeTime || "充実した時間の過ごし方"}を大切にし、ワークライフバランスを保ちながら成果を上げ続けています。`,
      quote: `「${interviewAnswers.advice || "自分を信じて小さな一歩を踏み出すことが大切です"}」と${userName}氏は語る。「10年前に始めた小さな習慣が、今日の成功につながっています。」`,
    }

    // モックデータをセット
    setNewsArticle(mockArticle)
    updateResponse("celebration", "newsArticle", mockArticle)
    setGenerationError("記事を生成しました。")

    // 生成完了
    setTimeout(() => {
      setIsGenerating(false)
    }, 500)
  }

  const generateNewsArticle = async () => {
    if (!interviewAnswers.work || !interviewAnswers.fulfillment) {
      alert("インタビューの回答が不足しています。すべての質問に回答してください。")
      return
    }

    setIsGenerating(true)
    setGenerationError(null)

    // AIを使用しない場合は、直接モックデータを使用
    if (!useAI) {
      console.log("AIを使用せずに記事を生成します")
      const mockArticle = {
        headline: `${userName}氏、革新的なアプローチで業界に変革をもたらす`,
        lead: `10年間の着実な努力と独自のビジョンにより、${userName}氏は今や業界の第一人者として認められている。`,
        content: `${interviewAnswers.work || "現在の仕事"} の分野で活躍する${userName}氏は、独自のアプローチと情熱で多くの人々に影響を与えています。\n\n日々の業務では${interviewAnswers.schedule || "効率的なスケジュール管理"}を実践し、${interviewAnswers.fulfillment || "やりがい"}を感じながら仕事に取り組んでいます。\n\nプライベートでは${interviewAnswers.freeTime || "充実した時間の過ごし方"}を大切にし、ワークライフバランスを保ちながら成果を上げ続けています。`,
        quote: `「${interviewAnswers.advice || "自分を信じて小さな一歩を踏み出すことが大切です"}」と${userName}氏は語る。「10年前に始めた小さな習慣が、今日の成功につながっています。」`,
      }

      // モックデータをセット
      setNewsArticle(mockArticle)
      updateResponse("celebration", "newsArticle", mockArticle)
      setGenerationError("記事を生成しました。")
      setIsGenerating(false)
      return
    }

    try {
      console.log("API リクエスト開始:", { userName, interviewAnswers, retryCount })

      const response = await fetch("/api/generate-news", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          interviewAnswers,
          userName,
        }),
      })

      console.log("API レスポンスステータス:", response.status)

      // 504エラーの場合の処理
      if (response.status === 504) {
        // リトライカウントを増やす
        const newRetryCount = retryCount + 1
        setRetryCount(newRetryCount)
        console.log(`タイムアウトが発生しました。リトライカウント: ${newRetryCount}`)

        // 最大リトライ回数（2回）に達した場合
        if (newRetryCount >= 2) {
          console.log("最大リトライ回数に達しました。AIを使用せずに記事を生成します。")
          setIsGenerating(false)
          setGenerationError("タイムアウトが繰り返し発生したため、AIを使用せずに記事を生成します。")

          // 直接モック記事生成関数を呼び出す
          setTimeout(() => {
            generateMockArticle()
          }, 500)
          return
        }

        // まだリトライ可能な場合
        setGenerationError(`タイムアウトが発生しました。自動的に再試行しています... (${newRetryCount}/2)`)

        // 少し待ってから再試行
        setIsGenerating(false)
        setTimeout(() => {
          generateNewsArticle()
        }, 1000)
        return
      }

      // レスポンスがJSONかどうかを確認
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        // JSONではない場合、テキストとして読み込む
        const textResponse = await response.text()
        console.error("非JSONレスポンス:", textResponse)

        // AIを使用せずに再生成
        console.log("JSONではないレスポンスを受け取りました。AIを使用せずに記事を生成します。")
        setIsGenerating(false)
        setGenerationError("サーバーからの応答が無効です。AIを使用せずに記事を生成します。")

        // 直接モック記事生成関数を呼び出す
        setTimeout(() => {
          generateMockArticle()
        }, 500)
        return
      }

      const data = await response.json()
      console.log("API レスポンスデータ:", data)

      if (!response.ok && !data.article) {
        throw new Error(data.error || data.details || "記事の生成に失敗しました")
      }

      // 生成された記事をステートに設定
      setNewsArticle({
        headline: data.article.headline,
        lead: data.article.lead,
        content: data.article.content,
        quote: data.article.quote,
      })

      // コンテキストにも保存
      updateResponse("celebration", "newsArticle", {
        headline: data.article.headline,
        lead: data.article.lead,
        content: data.article.content,
        quote: data.article.quote,
      })

      // モックデータの場合は通知
      if (data._isMock) {
        console.log("モックデータが使用されました")
        setGenerationError(
          data._error ||
            "OpenAI API キーが設定されていないか、API 呼び出しに失敗したため、サンプル記事が生成されました。",
        )
      } else {
        // 成功した場合はリトライカウンターをリセット
        setRetryCount(0)
      }
    } catch (error) {
      console.error("記事生成中にエラーが発生しました:", error)

      // エラーが発生した場合、AIを使用せずに生成
      console.log("エラーが発生したため、AIを使用せずに記事を生成します。")
      setIsGenerating(false)
      setGenerationError(
        error instanceof Error
          ? `${error.message} - AIを使用せずに記事を生成します。`
          : "記事の生成に失敗しました - AIを使用せずに記事を生成します。",
      )

      // 直接モック記事生成関数を呼び出す
      setTimeout(() => {
        generateMockArticle()
      }, 500)
      return
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* ステップ1: エクササイズ */}
      {currentStep === 1 && (
        <>
          <div className="bg-[#F8F7F4] p-4 rounded-lg mb-4">
            <h2 className="text-lg font-medium text-[#5F5F5F] mb-2">
              ステップ1: 予祝エクササイズ
              {currentPart > 1 && ` - パート${currentPart}`}
            </h2>
          </div>

          {/* 説明 */}
          {currentPart === 1 && currentQuestionIndex === 0 && (
            <MessageBubble>
              <p className="text-lg font-medium mb-2">予祝エクササイズ</p>
              <p className="mb-4">
                予祝とは、目標達成を前もって祝うことで、心理的なハードルを下げ、モチベーションを高める日本古来の習慣です。
                このエクササイズでは、10年後に自律的キャリアを達成した自分を具体的にイメージし、その実現を「すでに起きたこと」として祝います。
              </p>
              <p className="mb-4">
                このエクササイズは3つのパートで構成されています。
                <br />
                1. タイムスリップ・インタビュー
                <br />
                2. ニュース記事の作成
                <br />
                3. お祝いの儀式
              </p>
              <p>それでは、パート1から始めましょう。</p>
            </MessageBubble>
          )}

          {/* パート1: タイムスリップ・インタビュー */}
          {currentPart === 1 && (
            <>
              <div className="bg-[#F0EEE4] p-4 rounded-lg mb-4">
                <h3 className="text-md font-medium text-[#4A593D] mb-2">パート1: タイムスリップ・インタビュー</h3>
                <p className="text-sm text-[#5F5F5F]">
                  {mentorName}がインタビュアーとなり、あなたは「10年後の{userName}さん」になりきって質問に答えます。
                </p>
              </div>

              <MessageBubble>
                <p className="italic mb-2">
                  ――10年後の世界にタイムスリップしました。{userName}
                  さんは理想のキャリアを実現し、充実した日々を送っています。 今日は特別に、そんな{userName}
                  さんにインタビューをさせていただきます。
                </p>
                <p className="font-medium">{questions[currentQuestionIndex]}</p>
              </MessageBubble>

              <div className="user-input-area">
                <Textarea
                  value={interviewAnswers[fieldMapping[currentQuestionIndex] as keyof typeof interviewAnswers]}
                  onChange={handleInterviewAnswerChange}
                  placeholder="10年後の自分になりきって回答してください..."
                  className="w-full mb-3"
                  rows={5}
                />
                <div className="flex justify-between">
                  <Button onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0} variant="outline">
                    前の質問
                  </Button>
                  <Button onClick={handleNextQuestion} className="bg-[#C4BD97] hover:bg-[#B0A97F]">
                    {currentQuestionIndex < questions.length - 1 ? "次の質問" : "パート2へ"}
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* パート2: ニュース記事の作成 */}
          {currentPart === 2 && (
            <>
              <div className="bg-[#F0EEE4] p-4 rounded-lg mb-4">
                <h3 className="text-md font-medium text-[#4A593D] mb-2">パート2: ニュース記事の作成</h3>
                <p className="text-sm text-[#5F5F5F]">
                  パート1でイメージした10年後の自分について報じるニュース記事を作成します。
                </p>
              </div>

              <MessageBubble>
                <p className="mb-4">
                  素晴らしいインタビューでした！次に、あなたの10年後の姿を報じるニュース記事を作成しましょう。
                  実在する新聞やウェブメディアの形式に似せると、よりリアリティが増します。
                </p>
                <p>以下の要素を含めて、記事を作成してください：</p>
                <ul className="list-disc pl-5 mt-2 mb-4">
                  <li>
                    <strong>見出し</strong>：あなたの成果や特徴を端的に表現するタイトル
                  </li>
                  <li>
                    <strong>リード文</strong>：記事の要点を簡潔にまとめた導入部分（1〜2文）
                  </li>
                  <li>
                    <strong>本文</strong>：あなたの仕事内容、成果、社会への貢献などの詳細
                  </li>
                  <li>
                    <strong>インタビュー引用</strong>：あなたの言葉として記事内に引用される部分
                  </li>
                </ul>
              </MessageBubble>

              <div className="mb-4">
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => {
                      // 直接モックデータを生成する専用の関数を呼び出す
                      generateMockArticle()
                    }}
                    disabled={isGenerating || currentPart !== 2}
                    className="w-full bg-[#4A593D] hover:bg-[#3A492D]"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        記事を生成中...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        記事を生成
                      </>
                    )}
                  </Button>
                </div>

                <p className="text-xs text-gray-500 mt-1 text-center">インタビューの回答をもとに記事を生成します</p>
                {generationError && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                    <div className="flex items-start">
                      <AlertCircle className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                      <p>{generationError}</p>
                    </div>
                    {retryCount > 0 && useAI && (
                      <p className="text-xs mt-1">
                        自動的に再試行しています ({retryCount}/2)。
                        {retryCount >= 2 ? " 次回失敗時はAIを使用せずに生成します。" : ""}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="headline" className="text-[#5F5F5F] font-medium">
                    見出し
                  </Label>
                  <Input
                    id="headline"
                    value={newsArticle.headline}
                    onChange={(e) => handleNewsArticleChange("headline", e.target.value)}
                    placeholder="例：「業界の常識を覆した革新者、○○氏のキャリア哲学に迫る」"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="lead" className="text-[#5F5F5F] font-medium">
                    リード文
                  </Label>
                  <Textarea
                    id="lead"
                    value={newsArticle.lead}
                    onChange={(e) => handleNewsArticleChange("lead", e.target.value)}
                    placeholder="例：「10年間で業界に革命を起こした○○氏が、そのキャリア形成の秘訣を初めて明かした。」"
                    className="mt-1"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="content" className="text-[#5F5F5F] font-medium">
                    本文
                  </Label>
                  <Textarea
                    id="content"
                    value={newsArticle.content}
                    onChange={(e) => handleNewsArticleChange("content", e.target.value)}
                    placeholder="例：「○○氏は2023年に小さなプロジェクトからスタートし、現在では...」"
                    className="mt-1"
                    rows={6}
                  />
                </div>

                <div>
                  <Label htmlFor="quote" className="text-[#5F5F5F] font-medium">
                    インタビュー引用
                  </Label>
                  <Textarea
                    id="quote"
                    value={newsArticle.quote}
                    onChange={(e) => handleNewsArticleChange("quote", e.target.value)}
                    placeholder="例：「成功の秘訣は、毎日小さな一歩を積み重ねることです。10年前に始めた習慣が今日の成果につながっています」と○○氏は語る。"
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div className="flex justify-between pt-2">
                  <Button onClick={handlePreviousPart} variant="outline">
                    パート1に戻る
                  </Button>
                  <Button onClick={handleNewsArticleNext} className="bg-[#C4BD97] hover:bg-[#B0A97F]">
                    パート3へ
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* パート3: お祝いの儀式 */}
          {currentPart === 3 && (
            <>
              <div className="bg-[#F0EEE4] p-4 rounded-lg mb-4">
                <h3 className="text-md font-medium text-[#4A593D] mb-2">パート3: お祝いの儀式</h3>
                <p className="text-sm text-[#5F5F5F]">予祝の力を最大化するために、何らかの「お祝い」を行います。</p>
              </div>

              <MessageBubble>
                <p className="mb-4">
                  素晴らしいニュース記事ができました！最後に、予祝の力を最大化するために「お祝いの儀式」を行いましょう。
                  以下の3つの中から、あなたが実行したいものを1つ選んでください。
                </p>
                <ol className="list-decimal pl-5 mt-2 mb-4">
                  <li className="mb-2">
                    <strong>祝杯をあげる</strong>
                    ：お気に入りの飲み物で乾杯し、10年後の自分に向けてトーストの言葉を述べる
                  </li>
                  <li className="mb-2">
                    <strong>贈り物を選ぶ</strong>：10年後の自分へのささやかな贈り物を選び、特別な場所に保管する
                  </li>
                  <li>
                    <strong>感謝の手紙を書く</strong>：10年後の自分から現在の自分への感謝の手紙を書く
                  </li>
                </ol>
              </MessageBubble>

              {/* カスタムボタンでラジオボタンを実装 */}
              <div className="space-y-3 mb-4">
                <Button
                  type="button"
                  variant={ritualType === "toast" ? "default" : "outline"}
                  className={`w-full justify-start ${ritualType === "toast" ? "bg-[#C4BD97]" : ""}`}
                  onClick={() => setRitualType("toast")}
                >
                  <span className="font-medium">祝杯をあげる</span>
                </Button>

                <Button
                  type="button"
                  variant={ritualType === "gift" ? "default" : "outline"}
                  className={`w-full justify-start ${ritualType === "gift" ? "bg-[#C4BD97]" : ""}`}
                  onClick={() => setRitualType("gift")}
                >
                  <span className="font-medium">贈り物を選ぶ</span>
                </Button>

                <Button
                  type="button"
                  variant={ritualType === "letter" ? "default" : "outline"}
                  className={`w-full justify-start ${ritualType === "letter" ? "bg-[#C4BD97]" : ""}`}
                  onClick={() => setRitualType("letter")}
                >
                  <span className="font-medium">感謝の手紙を書く</span>
                </Button>
              </div>

              {ritualType === "toast" && (
                <div>
                  <Label htmlFor="toast-content" className="text-[#5F5F5F] font-medium">
                    10年後の自分に向けてのトーストの言葉
                  </Label>
                  <Textarea
                    id="toast-content"
                    value={ritualToast}
                    onChange={(e) => setRitualToast(e.target.value)}
                    placeholder="例：「10年後の私、あなたの成功を祝して乾杯！これからの小さな一歩が、あなたの大きな成功につながることを信じています」"
                    className="mt-1"
                    rows={4}
                  />
                </div>
              )}

              {ritualType === "gift" && (
                <div>
                  <Label htmlFor="gift-content" className="text-[#5F5F5F] font-medium">
                    10年後の自分への贈り物と、その意味
                  </Label>
                  <Textarea
                    id="gift-content"
                    value={ritualGift}
                    onChange={(e) => setRitualGift(e.target.value)}
                    placeholder="例：「小さな観葉植物を選びました。これから10年かけて一緒に成長していくという意味を込めて、デスクに置いておきます」"
                    className="mt-1"
                    rows={4}
                  />
                </div>
              )}

              {ritualType === "letter" && (
                <div>
                  <Label htmlFor="letter-content" className="text-[#5F5F5F] font-medium">
                    10年後の自分から現在の自分への感謝の手紙
                  </Label>
                  <Textarea
                    id="letter-content"
                    value={ritualLetter}
                    onChange={(e) => setRitualLetter(e.target.value)}
                    placeholder="例：「親愛なる10年前の私へ。今、私は充実したキャリアと人生を送っています。これもあなたが今日から始める小さな一歩のおかげです。その勇気と決断に心から感謝しています...」"
                    className="mt-1"
                    rows={6}
                  />
                </div>
              )}

              <div className="flex justify-between pt-2">
                <Button onClick={handlePreviousPart} variant="outline">
                  パート2に戻る
                </Button>
                <Button onClick={handleRitualComplete} className="bg-[#C4BD97] hover:bg-[#B0A97F]">
                  完了
                </Button>
              </div>
            </>
          )}
        </>
      )}

      {/* ステップ2: まとめ */}
      {currentStep === 2 && (
        <>
          <div className="bg-[#F8F7F4] p-4 rounded-lg mb-4">
            <h2 className="text-lg font-medium text-[#5F5F5F] mb-2">ステップ2: 予祝エクササイズのまとめ</h2>
          </div>

          <MessageBubble>
            <p className="text-lg font-medium mb-2">予祝エクササイズの振り返り</p>
            <p className="mb-4">
              素晴らしい予祝エクササイズでした、{userName}さん。10年後の理想の姿を具体的に描き、
              それを祝うことができましたね。
            </p>
            <p className="mb-4">
              脳科学研究によると、目標を達成した自分をイメージすることで、脳はその状態を実現するための行動を自然と取るようになります。
              また、「予祝」という形で未来の成功を先取りして祝うことで、不安や恐れが軽減され、行動を起こす心理的ハードルが下がります。
            </p>
            <p className="mb-4">
              <strong>予祝の習慣化のために、以下の3つを実践してみてください：</strong>
            </p>
            <ol className="list-decimal pl-5 mb-4">
              <li className="mb-1">このエクササイズで作成したものを定期的に見直す時間を設ける</li>
              <li className="mb-1">毎朝または毎晩、10年後の自分をほんの1分だけイメージする習慣をつける</li>
              <li>小さな成功を達成するたびに「予祝通りだ」と自分を褒め、次の一歩へのモチベーションにする</li>
            </ol>
            <p>
              次のステップでは、あなたの現在のケイパビリティ（能力）について分析します。
              「次のステップへ」ボタンをクリックして進みましょう。
            </p>
          </MessageBubble>

          {/* インタビュー回答のまとめ */}
          <div className="bg-[#F0EEE4] p-4 rounded-lg mt-6 mb-4">
            <h3 className="text-md font-medium text-[#4A593D] mb-2">タイムスリップ・インタビューの回答</h3>
            <div className="space-y-3">
              {questions.map((question, index) => (
                <div key={index} className="bg-white p-3 rounded-lg">
                  <p className="text-sm font-medium text-[#5F5F5F] mb-1">{question}</p>
                  <p className="text-sm text-[#333]">
                    {interviewAnswers[fieldMapping[index] as keyof typeof interviewAnswers]}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ニュース記事のまとめ */}
          <div className="bg-[#F0EEE4] p-4 rounded-lg mb-4">
            <h3 className="text-md font-medium text-[#4A593D] mb-2">あなたについてのニュース記事</h3>
            <div className="bg-white p-4 rounded-lg">
              <h4 className="text-lg font-bold mb-2">{newsArticle.headline}</h4>
              <p className="text-sm italic mb-3">{newsArticle.lead}</p>
              <div className="text-sm mb-3 whitespace-pre-line">{newsArticle.content}</div>
              <p className="text-sm font-medium">『{newsArticle.quote}』</p>
            </div>
          </div>

          {/* 儀式のまとめ */}
          <div className="bg-[#F0EEE4] p-4 rounded-lg">
            <h3 className="text-md font-medium text-[#4A593D] mb-2">あなたが選んだお祝いの儀式</h3>
            <div className="bg-white p-3 rounded-lg">
              <p className="text-sm font-medium text-[#5F5F5F] mb-1">
                {ritualType === "toast" ? "祝杯をあげる" : ritualType === "gift" ? "贈り物を選ぶ" : "感謝の手紙を書く"}
              </p>
              <p className="text-sm text-[#333] whitespace-pre-line">
                {ritualType === "toast" ? ritualToast : ritualType === "gift" ? ritualGift : ritualLetter}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

