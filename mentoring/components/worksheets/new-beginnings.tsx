"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { MessageBubble } from "@/components/message-bubble"
import { saveMentoringData, saveSkipData, getInternalMotivationData, getValueStatement } from "@/lib/mentoring-sync"
import type { WeeklyMentoringData, InternalMotivationRating, PreviousActionRating } from "@/types/mentoring"

export default function NewBeginningsWorksheet() {
  // ステップ管理
  const [currentStep, setCurrentStep] = useState(1)
  const [isComplete, setIsComplete] = useState(false)
  const [isSkipped, setIsSkipped] = useState(false)

  // データ状態
  const [mentoringData, setMentoringData] = useState<WeeklyMentoringData>({
    status: "in_progress",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })

  // 保存状態
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // ワークシートデータ
  const [internalMotivation, setInternalMotivation] = useState<string | null>(null)
  const [valueStatement, setValueStatement] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  // データの読み込み
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      setLoadError(null)

      try {
        // データ取得を試みる
        const motivationData = await getInternalMotivationData()
        const valueData = await getValueStatement()

        // 内発的動機データを整形（各項目の間にスペースを挿入）
        let formattedMotivationData = motivationData
        if (motivationData) {
          // 配列の場合は要素間に全角スペースを挿入して結合
          if (Array.isArray(motivationData)) {
            formattedMotivationData = motivationData.join("　")
          }
          // 文字列の場合はカンマがあれば全角スペースに置換
          else if (typeof motivationData === "string" && motivationData.includes(",")) {
            formattedMotivationData = motivationData.replace(/,/g, "　")
          }
          // その他の場合はそのまま表示
        }

        // nullでも問題ない - 表示しないだけ
        setInternalMotivation(formattedMotivationData)
        setValueStatement(valueData)
      } catch (error: any) {
        console.error("データ読み込み中にエラーが発生しました:", error)
        setLoadError("データの読み込みに失敗しました。ページを再読み込みしてください。")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // データ更新ハンドラー
  const updateMentoringData = (key: keyof WeeklyMentoringData, value: any) => {
    setMentoringData((prev) => ({
      ...prev,
      [key]: value,
      updated_at: new Date().toISOString(),
    }))
  }

  // スキップ処理
  const handleSkip = async (reason?: string) => {
    setIsSaving(true)
    setSaveError(null)

    try {
      const result = await saveSkipData(reason)

      if (result.success) {
        setIsSkipped(true)
        updateMentoringData("status", "skipped")
        updateMentoringData("skip_reason", reason)
        setSaveSuccess(true)
      } else {
        setSaveError(result.message || "保存に失敗しました")
      }
    } catch (error: any) {
      setSaveError(error.message || "予期しないエラーが発生しました")
    } finally {
      setIsSaving(false)
    }
  }

  // 完了処理
  const handleComplete = async () => {
    setIsSaving(true)
    setSaveError(null)

    try {
      // ステータスを完了に更新
      const dataToSave: WeeklyMentoringData = {
        ...mentoringData,
        status: "completed",
        updated_at: new Date().toISOString(),
      }

      const result = await saveMentoringData(dataToSave)

      if (result.success) {
        setIsComplete(true)
        setSaveSuccess(true)
      } else {
        setSaveError(result.message || "保存に失敗しました")
      }
    } catch (error: any) {
      setSaveError(error.message || "予期しないエラーが発生しました")
    } finally {
      setIsSaving(false)
    }
  }

  // 次のステップへ
  const nextStep = () => {
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  // 前のステップへ
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // ローディング表示
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <p className="text-gray-500">データを読み込み中...</p>
      </div>
    )
  }

  // エラー表示
  if (loadError) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{loadError}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          再読み込み
        </Button>
      </div>
    )
  }

  // スキップ画面
  if (isSkipped) {
    return (
      <div className="space-y-6">
        <MessageBubble isUser={false}>
          <p>かしこまりました。今回はスキップなさるのですね。</p>
          <p>どうぞご無理なさらず、落ち着いたタイミングでまたご利用ください。</p>
          <p>また来週もお待ちしています。</p>
        </MessageBubble>

        <div className="flex justify-center mt-8">
          <Button onClick={() => (window.location.href = "/")}>トップページに戻る</Button>
        </div>
      </div>
    )
  }

  // 完了画面
  if (isComplete) {
    return (
      <div className="space-y-6">
        <MessageBubble isUser={false}>
          <p>今回の振り返りは以上です。お疲れさまでした。</p>
          <p>ご回答いただき、誠にありがとうございました。</p>
          <p>来週も、同じお時間に簡単な振り返りを行いますので、引き続きよろしくお願いいたします。</p>
          <p>何かご不明点やお気付きのことがありましたら、いつでもお気軽にお声がけください。</p>
          <p>また来週もお待ちしています。</p>
        </MessageBubble>

        <div className="flex justify-center mt-8">
          <Button onClick={() => (window.location.href = "/")}>トップページに戻る</Button>
        </div>
      </div>
    )
  }

  // 進捗表示
  const renderProgress = () => {
    return (
      <div className="w-full bg-gray-200 h-2 rounded-full mb-6">
        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(currentStep / 7) * 100}%` }}></div>
      </div>
    )
  }

  // ステップコンテンツ
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <MessageBubble isUser={false}>
              <p>お忙しい中お越しいただき、ありがとうございます。</p>
              <p>今週の振り返りを一緒に行いましょう。所要時間は5分ほどですが、よろしいでしょうか？</p>
            </MessageBubble>

            <div className="flex flex-col space-y-4 mt-6">
              <Button
                onClick={() => {
                  updateMentoringData("status", "in_progress")
                  nextStep()
                }}
              >
                はい、お願いいたします
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  setCurrentStep(8) // スキップ理由入力画面へ
                }}
              >
                今週はスキップしたいです
              </Button>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <MessageBubble isUser={false}>
              <p>ご一緒できて嬉しいです。</p>
              <p>
                まずは、今週のお仕事の中で、ご自身の大切にしている想いやモチベーションがどのくらい満たされたと感じていますか？
              </p>
              {internalMotivation && (
                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                  <p className="text-sm font-medium">あなたの内発的動機：</p>
                  <p className="text-sm">{internalMotivation}</p>
                </div>
              )}
            </MessageBubble>

            <Card>
              <CardContent className="pt-6">
                <RadioGroup
                  value={mentoringData.internal_motivation_rating || ""}
                  onValueChange={(value) =>
                    updateMentoringData("internal_motivation_rating", value as InternalMotivationRating)
                  }
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="very_satisfied" id="very_satisfied" />
                    <Label htmlFor="very_satisfied">とても満たされました</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="somewhat_satisfied" id="somewhat_satisfied" />
                    <Label htmlFor="somewhat_satisfied">ある程度満たされました</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="not_very_satisfied" id="not_very_satisfied" />
                    <Label htmlFor="not_very_satisfied">あまり満たされませんでした</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="not_satisfied_at_all" id="not_satisfied_at_all" />
                    <Label htmlFor="not_satisfied_at_all">ほとんど感じられませんでした</Label>
                  </div>
                </RadioGroup>

                <div className="mt-6">
                  <Label htmlFor="internal_motivation_comment">
                    具体的にはどのような場面で、あるいはどのような理由でそう感じられましたか？（よろしければご記入ください）
                  </Label>
                  <Textarea
                    id="internal_motivation_comment"
                    placeholder="お気軽にどうぞ"
                    className="mt-2"
                    value={mentoringData.internal_motivation_comment || ""}
                    onChange={(e) => updateMentoringData("internal_motivation_comment", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <MessageBubble isUser={false}>
              <p>先週設定された"やってみる"と決めたアクションについて、どの程度実行できたと思いますか？</p>
            </MessageBubble>

            <Card>
              <CardContent className="pt-6">
                <RadioGroup
                  value={mentoringData.previous_action_rating || ""}
                  onValueChange={(value) =>
                    updateMentoringData("previous_action_rating", value as PreviousActionRating)
                  }
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fully_executed" id="fully_executed" />
                    <Label htmlFor="fully_executed">予定通りすべて実行できました</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="partially_executed" id="partially_executed" />
                    <Label htmlFor="partially_executed">ある程度実行できました</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="attempted_but_failed" id="attempted_but_failed" />
                    <Label htmlFor="attempted_but_failed">試みましたが、思うように進みませんでした</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="forgotten" id="forgotten" />
                    <Label htmlFor="forgotten">失念しており、できませんでした</Label>
                  </div>
                </RadioGroup>

                <div className="mt-6">
                  <Label htmlFor="previous_action_comment">
                    うまくいった点、または難しかった点・理由など、簡単にお聞かせください。
                  </Label>
                  <Textarea
                    id="previous_action_comment"
                    placeholder="まずは振り返ってみることが大切です"
                    className="mt-2"
                    value={mentoringData.previous_action_comment || ""}
                    onChange={(e) => updateMentoringData("previous_action_comment", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <MessageBubble isUser={false}>
              <p>今週のお仕事を振り返る中で、ご自身の強みや価値観をどのように発揮できたと感じますか？</p>
              {valueStatement && (
                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                  <p className="text-sm font-medium">あなたのバリューステートメント：</p>
                  <p className="text-sm">{valueStatement}</p>
                </div>
              )}
            </MessageBubble>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div>
                    <Label className="mb-6 block">
                      0〜10のスケールで評価してください（0: まったく発揮できなかった、10: よく発揮できた）
                    </Label>
                    <div className="flex items-center space-x-4">
                      <span>0</span>
                      <Slider
                        value={
                          mentoringData.value_expression_rating !== undefined
                            ? [mentoringData.value_expression_rating]
                            : [5]
                        }
                        min={0}
                        max={10}
                        step={1}
                        onValueChange={(value) => updateMentoringData("value_expression_rating", value[0])}
                        className="flex-1"
                      />
                      <span>10</span>
                    </div>
                    <div className="text-center mt-2">
                      {mentoringData.value_expression_rating !== undefined ? mentoringData.value_expression_rating : 5}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="value_expression_comment">
                      どのように発揮できたのか、または今後さらに活かす方法など、よろしければご記入ください。
                    </Label>
                    <Textarea
                      id="value_expression_comment"
                      placeholder="ちょっとしたことでも構いませんので、ぜひ振り返ってみてください"
                      className="mt-2"
                      value={mentoringData.value_expression_comment || ""}
                      onChange={(e) => updateMentoringData("value_expression_comment", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <MessageBubble isUser={false}>
              <p>では、次の1週間で取り組んでみたい行動を挙げてみましょう。</p>
              <p>小さなことで構いませんので、最大3つまで書き出してみてください。</p>
            </MessageBubble>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="next_action_1">アクション①</Label>
                    <Input
                      id="next_action_1"
                      placeholder="取り組みたい行動を入力してください"
                      value={mentoringData.next_action_1 || ""}
                      onChange={(e) => updateMentoringData("next_action_1", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="next_action_2">アクション②（任意）</Label>
                    <Input
                      id="next_action_2"
                      placeholder="取り組みたい行動を入力してください"
                      value={mentoringData.next_action_2 || ""}
                      onChange={(e) => updateMentoringData("next_action_2", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="next_action_3">アクション③（任意）</Label>
                    <Input
                      id="next_action_3"
                      placeholder="取り組みたい行動を入力してください"
                      value={mentoringData.next_action_3 || ""}
                      onChange={(e) => updateMentoringData("next_action_3", e.target.value)}
                    />
                  </div>

                  <p className="text-sm text-gray-500 mt-2">無理なく実行できるレベルの目標設定がおすすめです</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <MessageBubble isUser={false}>
              <p>最後に、現在のお仕事やチームに対するお気持ちを、数字で教えていただけますか？</p>
            </MessageBubble>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-8">
                  <div>
                    <Label className="mb-4 block">
                      12か月後も今の仕事を続けたいと思われる度合いは、0〜10のうちどのくらいでしょうか？
                    </Label>
                    <div className="flex items-center space-x-4">
                      <span>0</span>
                      <Slider
                        value={
                          mentoringData.job_continuation_rating !== undefined
                            ? [mentoringData.job_continuation_rating]
                            : [5]
                        }
                        min={0}
                        max={10}
                        step={1}
                        onValueChange={(value) => updateMentoringData("job_continuation_rating", value[0])}
                        className="flex-1"
                      />
                      <span>10</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>まったく続けたいとは思わない</span>
                      <span>強く続けたいと思う</span>
                    </div>
                    <div className="text-center mt-2">
                      {mentoringData.job_continuation_rating !== undefined ? mentoringData.job_continuation_rating : 5}
                    </div>
                  </div>

                  <div>
                    <Label className="mb-4 block">
                      大切なご友人や同僚を、このチームに誘いたいと感じる度合いは、0〜10のうちどのくらいでしょうか？
                    </Label>
                    <div className="flex items-center space-x-4">
                      <span>0</span>
                      <Slider
                        value={
                          mentoringData.team_recommendation_rating !== undefined
                            ? [mentoringData.team_recommendation_rating]
                            : [5]
                        }
                        min={0}
                        max={10}
                        step={1}
                        onValueChange={(value) => updateMentoringData("team_recommendation_rating", value[0])}
                        className="flex-1"
                      />
                      <span>10</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>全く誘いたいと思わない</span>
                      <span>ぜひ誘いたいと思う</span>
                    </div>
                    <div className="text-center mt-2">
                      {mentoringData.team_recommendation_rating !== undefined
                        ? mentoringData.team_recommendation_rating
                        : 5}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="satisfaction_comment">
                      もし率直な感想やご提案などがございましたら、お聞かせください。
                    </Label>
                    <Textarea
                      id="satisfaction_comment"
                      placeholder="数値はあくまで目安ですので、ご自身の感覚で回答してください"
                      className="mt-2"
                      value={mentoringData.satisfaction_comment || ""}
                      onChange={(e) => updateMentoringData("satisfaction_comment", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 7:
        return (
          <div className="space-y-6">
            <MessageBubble isUser={false}>
              <p>すべての質問にお答えいただき、ありがとうございました。</p>
              <p>「完了」ボタンを押すと、今回の振り返りが終了します。</p>
            </MessageBubble>

            {saveError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <p>{saveError}</p>
              </div>
            )}

            {saveSuccess && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                <p>データが正常に保存されました。</p>
              </div>
            )}
          </div>
        )

      case 8: // スキップ理由入力画面
        return (
          <div className="space-y-6">
            <MessageBubble isUser={false}>
              <p>かしこまりました。今回はスキップなさるのですね。</p>
              <p>もしお忙しいようでしたら、どうぞご無理なさらず、落ち着いたタイミングでまたご利用ください。</p>
              <p>もしよろしければ、スキップの理由や一言メッセージなどございましたら教えていただけますか？</p>
            </MessageBubble>

            <Card>
              <CardContent className="pt-6">
                <div>
                  <Label htmlFor="skip_reason">一言メモしておきたいことがあればどうぞ（任意です）</Label>
                  <Textarea
                    id="skip_reason"
                    placeholder="スキップの理由など、お気軽にどうぞ"
                    className="mt-2"
                    value={mentoringData.skip_reason || ""}
                    onChange={(e) => updateMentoringData("skip_reason", e.target.value)}
                  />
                </div>

                <div className="mt-6 flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    戻る
                  </Button>
                  <Button onClick={() => handleSkip(mentoringData.skip_reason)} disabled={isSaving}>
                    {isSaving ? "保存中..." : "スキップを確定する"}
                  </Button>
                </div>

                {saveError && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
                    <p>{saveError}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  // ナビゲーションボタン
  const renderNavigation = () => {
    // スキップ画面ではナビゲーションを表示しない
    if (currentStep === 8) return null

    return (
      <div className="flex justify-between mt-8">
        {currentStep > 1 ? (
          <Button variant="outline" onClick={prevStep}>
            戻る
          </Button>
        ) : (
          <div></div> // 空のdivでスペースを確保
        )}

        {currentStep < 7 ? (
          <Button onClick={nextStep}>次へ</Button>
        ) : (
          <Button onClick={handleComplete} disabled={isSaving}>
            {isSaving ? "保存中..." : "完了"}
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      {renderProgress()}
      {renderStepContent()}
      {renderNavigation()}
    </div>
  )
}

