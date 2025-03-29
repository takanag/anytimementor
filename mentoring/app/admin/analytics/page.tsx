// 認証チェックを追加し、レイアウトを整える

import AnalyticsDashboard from "@/components/analytics-dashboard"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Analytics Dashboard | Any Time Mentor",
  description: "メンタリングセッションの分析ダッシュボード",
}

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">メンタリング分析ダッシュボード</h1>
      <AnalyticsDashboard />
    </div>
  )
}

