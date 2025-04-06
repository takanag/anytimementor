import { Suspense } from "react"
import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import CareerMentor from "@/components/worksheets/career-mentor"

export const metadata: Metadata = {
  title: "キャリアメンター | Any Time Mentor",
  description: "キャリアに関する質問や悩みについて、AIメンターがサポートします。",
}

export default function CareerMentorPage() {
  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">キャリアメンター</h2>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>キャリアメンター</CardTitle>
            <CardDescription>キャリアに関する質問や悩みについて、AIメンターがサポートします。</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <Suspense fallback={<div>読み込み中...</div>}>
              <CareerMentor />
              {/* 重複していたCareerMentorコンポーネントを削除 */}
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

