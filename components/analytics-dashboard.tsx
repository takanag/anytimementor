"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getMentoringAnalytics } from "@/lib/analytics"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { Loader2, AlertCircle } from "lucide-react"

export default function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        console.log("Fetching analytics data...")
        const data = await getMentoringAnalytics()
        console.log("Analytics data received:", data)
        setAnalyticsData(data)
      } catch (err) {
        console.error("Error fetching analytics data:", err)
        setError("データの取得に失敗しました。ネットワーク接続を確認するか、しばらく経ってから再試行してください。")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-gray-600">データを読み込み中...</p>
      </div>
    )

  if (error)
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-xl font-bold text-red-600 mb-2">データ取得エラー</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <p className="text-sm text-gray-500">詳細はコンソールを確認してください</p>
      </div>
    )

  if (!analyticsData)
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <p className="text-lg text-gray-600">データがありません</p>
      </div>
    )

  const COLORS = ["#C4BD97", "#8E8B70", "#5C5A48", "#4A593D", "#9E7A7A", "#FF9999"]

  // ステップ完了状況のデータ整形
  const completionData =
    analyticsData.completion?.map((item: any) => ({
      name: `ステップ ${item.completed_step}`,
      count: Number.parseInt(item.count),
    })) || []

  // 仕事の意味のデータ整形
  const workMeaningsData = (analyticsData.workMeanings || []).slice(0, 6).map((item: any) => ({
    name: item.value,
    value: Number.parseInt(item.count),
  }))

  // 種まきアクションのデータ整形
  const seedPlantingData = (analyticsData.seedPlanting || []).slice(0, 5).map((item: any) => ({
    name:
      item.action === "5min"
        ? "5分アクション"
        : item.action === "share"
          ? "つぶやきシェア"
          : item.action === "digital"
            ? "デジタル種まき"
            : item.action === "environment"
              ? "身近な環境変化"
              : item.action === "learning"
                ? "マイクロ学習"
                : item.action === "custom"
                  ? "カスタムアクション"
                  : item.action,
    count: Number.parseInt(item.count),
  }))

  // カスタムレンダラーを追加
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? "start" : "end"} dominantBaseline="central" fontSize={12}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">総セッション数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.summary?.total_count || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">平均満足度</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.summary?.avg_enjoyment
                ? Math.round(analyticsData.summary.avg_enjoyment) + "%"
                : "データなし"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">完了率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.completion?.find((item: any) => item.completed_step === 7)
                ? Math.round(
                    (analyticsData.completion.find((item: any) => item.completed_step === 7).count /
                      analyticsData.summary.total_count) *
                      100,
                  ) + "%"
                : "0%"}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>ステップ完了状況</CardTitle>
          </CardHeader>
          <CardContent>
            {completionData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={completionData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#C4BD97" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center">
                <p className="text-gray-500">データがありません</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>仕事の意味 (上位6項目)</CardTitle>
          </CardHeader>
          <CardContent>
            {workMeaningsData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={workMeaningsData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {workMeaningsData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center">
                <p className="text-gray-500">データがありません</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>平均ケイパビリティスコア</CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsData.summary ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: "リーダーシップ", score: Math.round(analyticsData.summary.avg_leadership || 0) },
                      {
                        name: "コミュニケーション",
                        score: Math.round(analyticsData.summary.avg_communication || 0),
                      },
                      { name: "専門的スキル", score: Math.round(analyticsData.summary.avg_technical || 0) },
                      { name: "問題解決能力", score: Math.round(analyticsData.summary.avg_problem_solving || 0) },
                      { name: "創造性", score: Math.round(analyticsData.summary.avg_creativity || 0) },
                    ]}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" width={120} />
                    <Tooltip />
                    <Bar dataKey="score" fill="#4A593D" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center">
                <p className="text-gray-500">データがありません</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>メガネの変え方 (上位5項目)</CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsData.changeLens?.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={(analyticsData.changeLens || []).slice(0, 5).map((item: any) => ({
                      name: item.change_lens,
                      count: Number.parseInt(item.count),
                    }))}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8E8B70" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center">
                <p className="text-gray-500">データがありません</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 種まきアクションの分析を追加 */}
      {seedPlantingData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>種まきアクション (上位5項目)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={seedPlantingData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#9E7A7A" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

