"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, User, Brain, Newspaper, Star, TrendingUp } from "lucide-react"
import { generatePDF, downloadPDF } from "@/lib/pdf-generator"
import { useToast } from "@/hooks/use-toast"
import RadarChart from "@/components/radar-chart"
import { formatDate } from "@/lib/utils"
import type { WorksheetData } from "@/types/worksheet"

// 能力名のマッピング
const capabilityNameMap = {
  capability_business_understanding_analytical_thinking: "分析思考力",
  capability_business_understanding_env_understanding: "ビジネス環境理解力",
  capability_business_understanding_value_creation: "価値創出力",
  capability_collaboration_adaptability: "変化対応力",
  capability_collaboration_global_mind: "グローバルマインド",
  capability_collaboration_network_utilization: "ネットワーク活用力",
  capability_expertise_knowledge_sharing: "知見共有力",
  capability_expertise_quality_control: "品質管理力",
  capability_expertise_specialized_knowledge: "専門知識力",
  capability_integrity_and_trust_client_response: "クライアント対応力",
  capability_integrity_and_trust_communication: "コミュニケーション力",
  capability_integrity_and_trust_relationship_building: "関係構築力",
  capability_leadership_lead_others: "他者リード力",
  capability_leadership_org_strength: "組織強化力",
  capability_leadership_self_growth: "自己成長力",
}

// カテゴリー名のマッピング
const categoryNameMap = {
  leadership: "リーダーシップ",
  business_understanding: "ビジネス理解",
  expertise: "専門性",
  collaboration: "協働力",
  integrity_and_trust: "誠実さと信頼",
}

// キーからカテゴリーへのマッピング
const keyToCategoryMap = {
  capability_business_understanding_analytical_thinking: "business_understanding",
  capability_business_understanding_env_understanding: "business_understanding",
  capability_business_understanding_value_creation: "business_understanding",
  capability_collaboration_adaptability: "collaboration",
  capability_collaboration_global_mind: "collaboration",
  capability_collaboration_network_utilization: "collaboration",
  capability_expertise_knowledge_sharing: "expertise",
  capability_expertise_quality_control: "expertise",
  capability_expertise_specialized_knowledge: "expertise",
  capability_integrity_and_trust_client_response: "integrity_and_trust",
  capability_integrity_and_trust_communication: "integrity_and_trust",
  capability_integrity_and_trust_relationship_building: "integrity_and_trust",
  capability_leadership_lead_others: "leadership",
  capability_leadership_org_strength: "leadership",
  capability_leadership_self_growth: "leadership",
}

interface RoadmapPreviewProps {
  worksheetData: WorksheetData
}

export default function RoadmapPreview({ worksheetData }: RoadmapPreviewProps) {
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [strengths, setStrengths] = useState([])
  const [weaknesses, setWeaknesses] = useState([])
  const [chartData, setChartData] = useState(null)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const chartRef = useRef(null)
  const [chartRendered, setChartRendered] = useState(false)
  const [logoLoaded, setLogoLoaded] = useState(false)

  // デバッグ用：データの確認
  useEffect(() => {
    console.log("Component received worksheet data:", worksheetData)
  }, [worksheetData])

  // ロゴ画像を事前にロード
  useEffect(() => {
    const logoUrl =
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Any%20time%20mentor%20logo-g2zpGummxSMXbsYqrbBajqO3TwyTJD.jpeg"
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      console.log("ロゴ画像のロードが完了しました")
      setLogoLoaded(true)
    }
    img.onerror = () => {
      console.warn("ロゴ画像のロードに失敗しました")
      setLogoLoaded(true) // エラーでも続行できるようにする
    }
    img.src = logoUrl
  }, [])

  // 能力データを処理して強みと改善点を計算
  useEffect(() => {
    if (worksheetData) {
      // 能力スコアを抽出
      const capabilityScores = Object.entries(worksheetData)
        .filter(([key, value]) => key.startsWith("capability_") && typeof value === "number")
        .map(([key, value]) => ({
          key,
          name: capabilityNameMap[key] || key.replace("capability_", "").replace(/_/g, " "),
          score: value,
        }))
        .sort((a, b) => b.score - a.score)

      console.log("Capability scores:", capabilityScores)

      // 強み（上位3つ）
      setStrengths(capabilityScores.slice(0, 3))

      // 改善点（下位3つ）
      setWeaknesses(capabilityScores.slice(-3).reverse())

      // レーダーチャートデータの準備
      prepareChartData(worksheetData)
    }
  }, [worksheetData])

  // レーダーチャートデータの準備
  const prepareChartData = (data) => {
    if (!data) return

    // カテゴリーごとのスコアを計算
    const categoryScores = {
      leadership: 0,
      business_understanding: 0,
      expertise: 0,
      collaboration: 0,
      integrity_and_trust: 0,
    }

    // 各カテゴリーのスコアを合計
    Object.entries(data).forEach(([key, value]) => {
      if (key.startsWith("capability_") && typeof value === "number") {
        // 修正: 直接マッピングを使用
        const category = keyToCategoryMap[key]
        console.log(`Key: ${key}, Category: ${category}, Value: ${value}`) // デバッグ用
        if (category && categoryScores[category] !== undefined) {
          categoryScores[category] += value
        }
      }
    })

    console.log("Category scores:", categoryScores)

    // チャートデータの作成
    const chartData = {
      labels: Object.keys(categoryScores).map((key) => categoryNameMap[key] || key),
      datasets: [
        {
          label: "能力スコア",
          data: Object.values(categoryScores),
          backgroundColor: "rgba(196, 189, 151, 0.2)",
          borderColor: "rgba(196, 189, 151, 1)",
          borderWidth: 2,
        },
      ],
    }

    setChartData(chartData)
  }

  // チャートのレンダリング完了を処理
  const handleChartRender = () => {
    console.log("チャートのレンダリングが完了しました")
    setChartRendered(true)
  }

  // PDFダウンロード処理
  const handleDownloadPDF = async () => {
    try {
      setIsGeneratingPDF(true)
      toast({
        title: "PDF生成中",
        description: "ロードマップをPDFに変換しています。しばらくお待ちください...",
      })

      // 要素が存在するか確認
      const element = document.getElementById("roadmap-container")
      if (!element) {
        throw new Error("Roadmap container not found")
      }

      // PDF生成前にスクロールを一番上に移動（レンダリング問題を防ぐため）
      window.scrollTo(0, 0)

      // レーダーチャートのレンダリングを待機
      if (!chartRendered) {
        console.log("レーダーチャートのレンダリングを待機中...")
        // チャートのレンダリングを待機（最大10秒）
        await new Promise((resolve) => {
          const checkInterval = setInterval(() => {
            if (chartRendered) {
              clearInterval(checkInterval)
              clearTimeout(timeout)
              resolve(true)
            }
          }, 300)

          const timeout = setTimeout(() => {
            clearInterval(checkInterval)
            console.log("チャートレンダリング待機がタイムアウトしました")
            resolve(false)
          }, 10000)
        })

        // さらに少し待機して確実にレンダリングを完了させる
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }

      // PDFを生成
      const blob = await generatePDF("roadmap-container", "yoshuku-roadmap.pdf")

      // PDFをダウンロード
      downloadPDF(blob, `yoshuku-roadmap-${formatDate(new Date(), "yyyy-MM-dd")}.pdf`)

      toast({
        title: "PDF生成完了",
        description: "ロードマップのPDFが正常に生成されました。",
      })
    } catch (error) {
      console.error("PDF生成エラー:", error)
      toast({
        title: "エラー",
        description: "PDFの生成中にエラーが発生しました。",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  // データがない場合
  if (!worksheetData) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center p-8 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold mb-4">データが見つかりません</h1>
          <p>ワークシートを完了すると、予祝ロードマップが表示されます。</p>
        </div>
      </div>
    )
  }

  // 配列データを安全に処理する関数
  const safeArray = (data) => {
    if (!data) return []
    if (typeof data === "string") {
      try {
        return JSON.parse(data)
      } catch (e) {
        return [data]
      }
    }
    return Array.isArray(data) ? data : [data]
  }

  // 文字列データを安全に処理する関数
  const safeString = (data) => {
    if (!data) return ""
    if (typeof data === "object") {
      return JSON.stringify(data)
    }
    return String(data)
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">予祝ロードマップ</h1>
        <Button onClick={handleDownloadPDF} disabled={isGeneratingPDF || !chartRendered || !logoLoaded}>
          <Download className="mr-2 h-4 w-4" />
          {isGeneratingPDF ? "生成中..." : "PDFダウンロード"}
        </Button>
      </div>

      <div
        id="roadmap-container"
        className="rounded-lg shadow-lg print:shadow-none"
        style={{ maxWidth: "800px", margin: "0 auto" }}
      >
        {/* ヘッダーセクション */}
        <div className="header-section p-8">
          {/* ロゴを追加 */}
          <div className="flex justify-center mb-8">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Any%20time%20mentor%20logo-g2zpGummxSMXbsYqrbBajqO3TwyTJD.jpeg"
              alt="Any Time Mentor Logo"
              className="h-40 object-contain"
              crossOrigin="anonymous"
            />
          </div>

          <div className="mb-8">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">予祝ロードマップ</h1>
              <p className="text-lg">
                {safeString(worksheetData.user_avatar_type) || "ユーザー"} | {new Date().toLocaleDateString("ja-JP")}
              </p>
              <p className="text-sm text-muted-foreground">
                ID: {safeString(worksheetData.anonymous_id).substring(0, 8)}...
              </p>
            </div>
          </div>
        </div>

        {/* 自分の中にある感性 */}
        <section className="p-8" id="section-sensibility">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <User className="mr-2 h-5 w-5 text-primary" />
            自分の中にある感性
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-medium mb-3">内発的動機：あなたが無意識のうちに持っている強みや価値観</h3>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>憧れの特性</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside">
                      {safeArray(worksheetData.internal_motivation_admired_traits).map((trait, index) => (
                        <li key={index}>{safeString(trait)}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>気になる特性</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside">
                      {safeArray(worksheetData.internal_motivation_disliked_traits).map((trait, index) => (
                        <li key={index}>{safeString(trait)}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-medium mb-3">
                仕事に対するバイアス：あなたが無意識のうちに持っている仕事に対する見方
              </h3>

              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>かけているメガネ</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside">
                      {safeArray(worksheetData.bias_work_meanings).map((meaning, index) => (
                        <li key={index}>{safeString(meaning)}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>メガネを身につけた経緯</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside">
                      {safeArray(worksheetData.bias_thought_origins).map((origin, index) => (
                        <li key={index}>{safeString(origin)}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>メガネを外す方法</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{safeString(worksheetData.bias_change_lens)}</p>
                    {worksheetData.bias_other_change_lens && (
                      <p className="mt-2">{safeString(worksheetData.bias_other_change_lens)}</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* 自分の思考 */}
        <section className="p-8" id="section-thinking">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <Brain className="mr-2 h-5 w-5 text-primary" />
            自分の思考
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-medium mb-3">小さな一歩：内発的動機に基づいた小さなアクション</h3>

              <Card>
                <CardContent className="pt-6">
                  <p>{safeString(worksheetData.new_beginnings_action)}</p>
                </CardContent>
              </Card>
            </div>

            <div>
              <h3 className="text-xl font-medium mb-3">私の価値：あなたが仕事で発揮している価値</h3>

              <Card>
                <CardContent className="pt-6">
                  <p className="mb-4 font-medium italic">
                    {safeString(worksheetData.value_articulation_value_statement)}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {worksheetData.value_articulation_keyword1 && (
                      <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">
                        {safeString(worksheetData.value_articulation_keyword1)}
                      </span>
                    )}
                    {worksheetData.value_articulation_keyword2 && (
                      <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">
                        {safeString(worksheetData.value_articulation_keyword2)}
                      </span>
                    )}
                    {worksheetData.value_articulation_keyword3 && (
                      <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">
                        {safeString(worksheetData.value_articulation_keyword3)}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <h3 className="text-xl font-medium mb-3">ケイパビリティ分析：あなたの能力の強みと改善点</h3>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>能力レーダーチャート</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80" ref={chartRef} id="radar-chart-container">
                      {chartData && <RadarChart data={chartData} onRender={handleChartRender} />}
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Star className="mr-2 h-4 w-4 text-yellow-500" />
                        強み
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {strengths.map((item, index) => (
                          <li key={index} className="flex justify-between items-center">
                            <span>{item.name}</span>
                            <span className="font-medium">{item.score}/2点</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <TrendingUp className="mr-2 h-4 w-4 text-blue-500" />
                        改善点
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {weaknesses.map((item, index) => (
                          <li key={index} className="flex justify-between items-center">
                            <span>{item.name}</span>
                            <span className="font-medium">{item.score}/2点</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 自分の意志（新聞形式） */}
        <section className="p-8" id="section-will">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <Newspaper className="mr-2 h-5 w-5 text-primary" />
            自分の意志（新聞形式）
          </h2>

          <Card className="border-2 border-gray-300">
            <CardContent className="pt-6">
              <div className="text-center border-b-2 border-gray-800 pb-4 mb-4">
                <h3 className="text-3xl font-bold mb-2">
                  {safeString(worksheetData.celebration_news_article_headline) || "未来の見出し"}
                </h3>
                <p className="text-lg italic">
                  {safeString(worksheetData.celebration_news_article_lead) || "未来のリード文"}
                </p>
              </div>

              <div className="space-y-4">
                <p>{safeString(worksheetData.celebration_news_article_content) || "未来の記事内容"}</p>

                {worksheetData.celebration_news_article_quote && (
                  <div className="border-l-4 border-gray-800 pl-4 italic my-6">
                    <p>"{safeString(worksheetData.celebration_news_article_quote)}"</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* フッター */}
        <div className="footer-section p-8 text-center text-sm text-muted-foreground">
          <p>Any Time Mentor - 予祝ロードマップ</p>
          <p>作成日: {new Date().toLocaleDateString("ja-JP")}</p>
        </div>
      </div>
    </div>
  )
}

