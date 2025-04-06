"use client"

import { useState, useEffect } from "react"
import { useWorksheet } from "@/context/worksheet-context"
import MessageBubble from "@/components/message-bubble"
import { Button } from "@/components/ui/button"
import StepNavigation from "@/components/step-navigation"
import RadarChart from "@/components/radar-chart"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

// コンピテンシー評価のインターフェース
interface CompetencyEvaluation {
  id: string
  title: string
  score: number
}

// 能力カテゴリーのインターフェース
interface CapabilityCategory {
  id: string
  title: string
  description: string
  competencies: {
    id: string
    title: string
    description: string
    examples: string[]
    score: number
  }[]
}

export default function CapabilityWorksheet() {
  const { responses, updateResponse, isLoading } = useWorksheet()
  const userName = responses.introduction?.name || "あなた"
  const [dataLoaded, setDataLoaded] = useState(false)

  // 能力カテゴリーの初期データ
  const [capabilities, setCapabilities] = useState<CapabilityCategory[]>([
    {
      id: "leadership",
      title: "リーダーシップ",
      description: "自らを高め、他者をリードし、責任ある行動で成果を生み出す能力",
      competencies: [
        {
          id: "selfGrowth",
          title: "1-1. 自己成長力",
          description: "",
          examples: [
            "自分の強みと弱みを客観的に認識している",
            "新しい知識やスキルを積極的に学び、自己開発している",
            "プレッシャーのある状況でも冷静さを保ち、適切に対応できる",
          ],
          score: 0,
        },
        {
          id: "leadOthers",
          title: "1-2. 他者リード力",
          description: "",
          examples: [
            "チームメンバーの能力を引き出し、目標達成のために支援している",
            "明確な方向性を示し、他者のモチベーションを高められる",
            "必要に応じてリーダーとフォロワーの役割を柔軟に切り替えられる",
          ],
          score: 0,
        },
        {
          id: "orgStrength",
          title: "1-3. 組織強化力",
          description: "",
          examples: [
            "組織の価値観や倫理観に基づいた行動を率先して実践している",
            "組織の課題に対して建設的な提案や行動ができる",
            "自分の役割を超えて、組織全体の成功に貢献している",
          ],
          score: 0,
        },
      ],
    },
    {
      id: "businessUnderstanding",
      title: "ビジネス理解",
      description: "ビジネスの仕組みを理解し、価値を創出する能力",
      competencies: [
        {
          id: "envUnderstanding",
          title: "2-1. ビジネス環境理解力",
          description: "",
          examples: [
            "業界や市場の動向を定期的に調査・把握している",
            "テクノロジーの変化がビジネスに与える影響を理解している",
            "クライアントや競合他社のビジネスモデルを説明できる",
          ],
          score: 0,
        },
        {
          id: "analyticalThinking",
          title: "2-2. 分析思考力",
          description: "",
          examples: [
            "複雑なデータから重要な情報を抽出し、整理できる",
            "情報を論理的に分析し、実行可能な提案につなげられる",
            "複数の視点から問題を検討し、バランスの取れた判断ができる",
          ],
          score: 0,
        },
        {
          id: "valueCreation",
          title: "2-3. 価値創出力",
          description: "",
          examples: [
            "クライアントの潜在的なニーズを特定し、解決策を提示できる",
            "収益性とクライアント満足の両方を考慮した提案ができる",
            "既存の枠組みにとらわれない革新的なアイデアを生み出せる",
          ],
          score: 0,
        },
      ],
    },
    {
      id: "expertise",
      title: "専門性",
      description: "自分の専門分野で高い品質の成果を提供する能力",
      competencies: [
        {
          id: "qualityControl",
          title: "3-1. 品質管理力",
          description: "",
          examples: [
            "業務の品質基準を理解し、一貫して遵守している",
            "プロジェクトの進捗を適切に管理し、期限内に成果を出せる",
            "効率性を損なうことなく、高品質な成果を提供できる",
          ],
          score: 0,
        },
        {
          id: "specializedKnowledge",
          title: "3-2. 専門知識力",
          description: "",
          examples: [
            "自分の専門分野の最新動向や知識を常にアップデートしている",
            "専門知識を実際の業務課題に適用できる",
            "複雑な専門的概念をわかりやすく説明できる",
          ],
          score: 0,
        },
        {
          id: "knowledgeSharing",
          title: "3-3. 知見共有力",
          description: "",
          examples: [
            "自分の知識や経験を同僚やクライアントと積極的に共有している",
            "専門知識を活かして、組織内外で信頼される存在になっている",
            "社内外のネットワークを活用して、必要な情報やリソースを集められる",
          ],
          score: 0,
        },
      ],
    },
    {
      id: "collaboration",
      title: "協働力",
      description: "多様な環境・人材と効果的に協力する能力",
      competencies: [
        {
          id: "globalMind",
          title: "4-1. グローバルマインド",
          description: "",
          examples: [
            "異なる文化や考え方に対してオープンな姿勢を持っている",
            "国際的な経済・社会動向に関心を持ち、情報収集している",
            "多様な背景を持つ人々と円滑にコミュニケーションできる",
          ],
          score: 0,
        },
        {
          id: "adaptability",
          title: "4-2. 変化対応力",
          description: "",
          examples: [
            "不確実な状況や急な変更にも柔軟に対応できる",
            "バーチャル環境でのチームワークに効果的に参加できる",
            "多様な意見や視点を尊重し、チームの意思決定に活かせる",
          ],
          score: 0,
        },
        {
          id: "networkUtilization",
          title: "4-3. ネットワーク活用力",
          description: "",
          examples: [
            "組織内の様々な部門・チームと協力関係を構築している",
            "自分の知識やリソースを共有し、他者の成功を支援している",
            "組織内のナレッジや経験を活用して、より良い成果を生み出せる",
          ],
          score: 0,
        },
      ],
    },
    {
      id: "integrityAndTrust",
      title: "誠実さと信頼",
      description: "信頼関係を構築し、誠実に行動する能力",
      competencies: [
        {
          id: "communication",
          title: "5-1. コミュニケーション力",
          description: "",
          examples: [
            "相手の話に注意深く耳を傾け、共感的な理解を示せる",
            "自分の考えや情報を明確かつ効果的に伝えられる",
            "相手や状況に合わせたコミュニケーションスタイルを選べる",
          ],
          score: 0,
        },
        {
          id: "relationshipBuilding",
          title: "5-2. 関係構築力",
          description: "",
          examples: [
            "多様な背景や立場の人々と信頼関係を築いている",
            "オープンな姿勢で異なる意見や視点を受け入れている",
            "長期的な信頼関係を維持するための行動を継続している",
          ],
          score: 0,
        },
        {
          id: "clientResponse",
          title: "5-3. クライアント対応力",
          description: "",
          examples: [
            "クライアントのニーズや期待を正確に理解している",
            "約束したことを確実に実行し、期待を超える価値を提供している",
            "クライアントから定期的にフィードバックを求め、改善に活かしている",
          ],
          score: 0,
        },
      ],
    },
  ])

  // 現在評価中のカテゴリーとコンピテンシー
  const [assessmentStarted, setAssessmentStarted] = useState<boolean>(false)
  const [currentCategory, setCurrentCategory] = useState<number>(0)
  const [currentCompetency, setCurrentCompetency] = useState<number>(0)

  // 現在の質問の選択値
  const [currentSelection, setCurrentSelection] = useState<number | null>(null)

  // 質問が変わるたびにカウンターを増やして強制的に再レンダリングさせる
  const [questionKey, setQuestionKey] = useState<number>(0)

  // 評価完了フラグ
  const [isAssessmentCompleted, setIsAssessmentCompleted] = useState<boolean>(false)

  // 評価結果
  const [assessmentResults, setAssessmentResults] = useState<{ [key: string]: number }>({})

  // 保存されたデータを読み込む
  useEffect(() => {
    if (!isLoading && responses.capability && !dataLoaded) {
      console.log("保存されたcapabilityデータを読み込みます:", responses.capability)

      // 保存されたデータを使って capabilities を更新
      const updatedCapabilities = [...capabilities]

      // 各カテゴリーとコンピテンシーを処理
      updatedCapabilities.forEach((category) => {
        category.competencies.forEach((competency) => {
          // キーを生成（例: leadership_selfGrowth）
          const key = `${category.id}_${competency.id}`

          // responses.capability からスコアを取得
          if (responses.capability && responses.capability[key] !== undefined) {
            competency.score = responses.capability[key]
          }
        })
      })

      // 更新されたデータをセット
      setCapabilities(updatedCapabilities)

      // 保存されたデータがあれば、アセスメント完了状態にする
      const hasCompletedData = updatedCapabilities.some((category) =>
        category.competencies.some((competency) => competency.score > 0),
      )

      if (hasCompletedData) {
        calculateResults()
        setIsAssessmentCompleted(true)
      }

      setDataLoaded(true)
      console.log("capabilityデータの読み込みが完了しました")
    }
  }, [responses.capability, isLoading, dataLoaded, capabilities])

  // 評価完了時のイベント発火
  useEffect(() => {
    if (isAssessmentCompleted) {
      const event = new CustomEvent("stepStatusChange", {
        detail: { isCompleted: true },
      })
      window.dispatchEvent(event)
    }
  }, [isAssessmentCompleted])

  // 質問が変わったら選択をリセット
  useEffect(() => {
    setCurrentSelection(null)
  }, [currentCategory, currentCompetency])

  // コンピテンシーのスコアを更新する関数
  const updateCompetencyScore = () => {
    if (currentSelection === null) return

    const updatedCapabilities = [...capabilities]
    updatedCapabilities[currentCategory].competencies[currentCompetency].score = currentSelection
    setCapabilities(updatedCapabilities)

    // Supabaseに保存するためのキーを生成
    const categoryId = updatedCapabilities[currentCategory].id
    const competencyId = updatedCapabilities[currentCategory].competencies[currentCompetency].id
    const key = `${categoryId}_${competencyId}`

    // 更新
    updateResponse("capability", key, currentSelection)
    console.log(`capability.${key} を ${currentSelection} に更新しました`)

    // 次のコンピテンシーに移動
    moveToNextCompetency()
  }

  // 次のコンピテンシーに移動する関数
  const moveToNextCompetency = () => {
    if (currentCompetency < capabilities[currentCategory].competencies.length - 1) {
      // 同じカテゴリー内の次のコンピテンシーへ
      setCurrentCompetency(currentCompetency + 1)
      // 質問キーを更新して強制的に再レンダリング
      setQuestionKey(questionKey + 1)
    } else if (currentCategory < capabilities.length - 1) {
      // 次のカテゴリーの最初のコンピテンシーへ
      setCurrentCategory(currentCategory + 1)
      setCurrentCompetency(0)
      // 質問キーを更新して強制的に再レンダリング
      setQuestionKey(questionKey + 1)
    } else {
      // すべての評価が完了
      calculateResults()
      setIsAssessmentCompleted(true)
    }
  }

  // 結果を計算する関数
  const calculateResults = () => {
    const results: { [key: string]: number } = {}

    capabilities.forEach((category) => {
      const totalScore = category.competencies.reduce((sum, comp) => sum + comp.score, 0)
      results[category.id] = totalScore
    })

    setAssessmentResults(results)
  }

  // レーダーチャートのデータ
  const chartData = {
    labels: capabilities.map((c) => c.title),
    datasets: [
      {
        label: "あなたのスコア",
        data: capabilities.map((c) => c.competencies.reduce((sum, comp) => sum + comp.score, 0)),
        backgroundColor: "rgba(196, 189, 151, 0.2)",
        borderColor: "rgba(196, 189, 151, 1)",
        borderWidth: 2,
      },
    ],
  }

  // ステップナビゲーションのコンテンツ
  const steps = [
    {
      title: "このステップで行うこと",
      content: (
        <div className="space-y-4">
          <p>このアセスメントでは、プロフェッショナル人材として成長するために重要な5つの能力を自己評価します。</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>各能力は3つのコンピテンシー（期待される行動）で構成されています</li>
            <li>各コンピテンシーには具体的な行動例が示されています</li>
            <li>
              評価は以下の3段階で行います：
              <ul className="list-disc pl-5 mt-2">
                <li>
                  <strong>2点</strong>：日常的に実践できている（具体的な例を思い浮かべられる）
                </li>
                <li>
                  <strong>1点</strong>：時々実践できている（少なくとも1〜2回の経験がある）
                </li>
                <li>
                  <strong>0点</strong>：ほとんど実践できていない（具体的な経験がない）
                </li>
              </ul>
            </li>
            <li>
              結果は5つの能力それぞれについて6点満点（2点×3コンピテンシー）でスコア化し、レーダーチャートで表示します
            </li>
          </ul>
        </div>
      ),
    },
    {
      title: "エクササイズ",
      content: (
        <div className="space-y-4">
          <p>プロフェッショナル人材として成長するために重要な5つの能力を自己評価します。</p>
          <Button onClick={() => setAssessmentStarted(true)} className="bg-[#C4BD97] hover:bg-[#B0A97F] text-white">
            アセスメントを開始する
          </Button>
        </div>
      ),
    },
  ]

  // データ読み込み中の表示
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#C4BD97]" />
        <p className="mt-4 text-gray-600">データを読み込んでいます...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <MessageBubble>
        <p className="text-lg font-medium mb-2">現在のケイパビリティを分析しましょう</p>
        <p className="mb-4">
          {userName}さんの強みと改善点を理解することで、より効果的なキャリア開発が可能になります。
          以下のステップに沿って、自己評価を行ってみましょう。
        </p>
      </MessageBubble>

      {!assessmentStarted && !isAssessmentCompleted ? (
        <StepNavigation steps={steps} />
      ) : !isAssessmentCompleted ? (
        <div className="space-y-6 bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-[#4A593D]">{capabilities[currentCategory].title}</h3>
            <span className="text-sm text-gray-500">
              {currentCategory + 1}/{capabilities.length}
            </span>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-gray-700 italic mb-4">{capabilities[currentCategory].description}</p>

            <div className="mb-4">
              <h4 className="font-medium mb-2">
                {capabilities[currentCategory].competencies[currentCompetency].title}
              </h4>
              <ul className="list-disc pl-5 space-y-1 mb-4">
                {capabilities[currentCategory].competencies[currentCompetency].examples.map((example, index) => (
                  <li key={index} className="text-sm">
                    {example}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <p className="font-medium">このコンピテンシーについて、あなたの現在のレベルを評価してください：</p>

              {/* 質問が変わるたびにkeyを変更して強制的に再レンダリング */}
              <RadioGroup
                key={`question-${currentCategory}-${currentCompetency}-${questionKey}`}
                className="space-y-3"
                value={currentSelection !== null ? currentSelection.toString() : undefined}
                onValueChange={(value) => setCurrentSelection(Number.parseInt(value))}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="2" id={`score-2-${currentCategory}-${currentCompetency}`} />
                  <Label htmlFor={`score-2-${currentCategory}-${currentCompetency}`} className="font-medium">
                    2点：日常的に実践できている（具体的な例を思い浮かべられる）
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id={`score-1-${currentCategory}-${currentCompetency}`} />
                  <Label htmlFor={`score-1-${currentCategory}-${currentCompetency}`} className="font-medium">
                    1点：時々実践できている（少なくとも1〜2回の経験がある）
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0" id={`score-0-${currentCategory}-${currentCompetency}`} />
                  <Label htmlFor={`score-0-${currentCategory}-${currentCompetency}`} className="font-medium">
                    0点：ほとんど実践できていない（具体的な経験がない）
                  </Label>
                </div>
              </RadioGroup>

              <div className="flex justify-end mt-4">
                <Button
                  onClick={updateCompetencyScore}
                  disabled={currentSelection === null}
                  className="bg-[#C4BD97] hover:bg-[#B0A97F] text-white"
                >
                  次へ
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <div className="text-sm text-gray-500">
              コンピテンシー {currentCompetency + 1}/{capabilities[currentCategory].competencies.length}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <MessageBubble>
            <p className="font-medium mb-2">アセスメント完了！</p>
            <p>
              {userName}さん、お疲れ様でした。あなたの能力評価の結果は以下の通りです。
              この結果を参考に、さらなる成長のための行動計画を立ててみましょう。
            </p>
          </MessageBubble>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-center mb-4">能力評価結果</h3>
            <div className="h-80">
              <RadarChart data={chartData} />
            </div>

            <div className="mt-6 space-y-4">
              <h4 className="font-medium">各能力のスコア（6点満点）</h4>
              <ul className="space-y-2">
                {capabilities.map((category, index) => {
                  const totalScore = category.competencies.reduce((sum, comp) => sum + comp.score, 0)
                  return (
                    <li key={index} className="flex justify-between items-center">
                      <span>{category.title}</span>
                      <span className="font-medium">{totalScore}/6点</span>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>

          <MessageBubble>
            <p>
              {userName}さん、素晴らしい自己分析ですね！この結果から、あなたの強みと改善点が明確になりました。
              強みを活かしながら、改善点に取り組むことで、さらなるキャリア成長が期待できます。
            </p>
            <p className="mt-2">次のステップでは、この分析結果をもとに、あなたの価値を言語化していきましょう。</p>
          </MessageBubble>
        </div>
      )}
    </div>
  )
}

