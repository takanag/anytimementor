import { Suspense } from "react"
import type { Metadata } from "next"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import NewBeginningsWorksheet from "@/components/worksheets/new-beginnings"
import CareerMentor from "@/components/worksheets/career-mentor"

export const metadata: Metadata = {
  title: "ワークシート | Any Time Mentor",
  description: "週次振り返りと成長支援のためのワークシート",
}

export default function WorksheetPage() {
  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">ワークシート</h2>
        </div>
        <Tabs defaultValue="new-beginnings" className="space-y-4">
          <TabsList>
            <TabsTrigger value="new-beginnings">新たな一歩</TabsTrigger>
            <TabsTrigger value="career-mentor">キャリアメンター</TabsTrigger>
          </TabsList>
          <TabsContent value="new-beginnings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>新たな一歩</CardTitle>
                <CardDescription>
                  週次の振り返りを通じて、あなたの成長をサポートします。5分程度で完了します。
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <Suspense fallback={<div>読み込み中...</div>}>
                  <NewBeginningsWorksheet />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="career-mentor" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>キャリアメンター</CardTitle>
                <CardDescription>キャリアに関する質問や悩みについて、AIメンターがサポートします。</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <Suspense fallback={<div>読み込み中...</div>}>
                  <CareerMentor />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

