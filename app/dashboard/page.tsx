import { Button } from "@/components/ui/button"
import Link from "next/link"
import DashboardWrapper from "@/components/dashboard-wrapper"

export default function DashboardPage() {
  return (
    <DashboardWrapper>
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">ダッシュボード</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">ワークシートを開始</h2>
              <p className="text-gray-600 mb-4">キャリアデザインのためのワークシートに取り組みましょう。</p>
              <Button asChild>
                <Link href="/worksheet/1">ワークシートを開始</Link>
              </Button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">進捗状況</h2>
              <p className="text-gray-600 mb-4">これまでの進捗状況を確認しましょう。</p>
              <Button variant="outline" asChild>
                <Link href="/progress">進捗状況を確認</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardWrapper>
  )
}

