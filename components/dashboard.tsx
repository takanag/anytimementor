"use client"

import { Card, CardContent } from "@/components/ui/card"
import { EngagementChart } from "@/components/charts/engagement-chart"
import { CapabilityChart } from "@/components/charts/capability-chart"
import { MentoringChart } from "@/components/charts/mentoring-chart"
import { KeywordTree } from "@/components/charts/keyword-tree"
import { UserNav } from "@/components/user-nav"
import { ModeToggle } from "@/components/mode-toggle"
import { TeamSelector } from "@/components/team-selector"
import Image from "next/image"
import { useState } from "react"

export default function Dashboard() {
  const [currentTeam, setCurrentTeam] = useState("新規事業開発本部")

  const handleTeamChange = (team: string) => {
    setCurrentTeam(team)
    // In a real application, you would fetch data for the selected team here
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="border-b bg-[#4A593D] text-white">
        <div className="flex h-16 items-center px-4">
          <div className="flex items-center space-x-4">
            <div className="relative h-16 w-16">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Any%20time%20mentor%20logo-cQJIqUINNtYIlNBtegJ3L29kaUT4nX.jpeg"
                alt="ANY TIME MENTOR logo"
                width={64}
                height={64}
                className="object-contain"
              />
            </div>
            <div className="text-lg font-medium">人事・部門長向けポータルサイト</div>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <ModeToggle />
            <UserNav />
          </div>
        </div>
      </div>

      <TeamSelector onTeamChange={handleTeamChange} />

      <div className="flex-1 space-y-4 p-4 pt-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">{currentTeam}</h1>
          <div className="text-sm text-gray-500">最終更新: 2023年10月15日</div>
        </div>

        <div className="grid gap-4 grid-cols-2">
          <Card className="col-span-1 border-0 shadow-none">
            <div className="bg-[#C4BD97] text-white p-2 font-medium">エンゲージメント</div>
            <CardContent className="pt-4">
              <p className="text-sm text-gray-600 mb-4">
                メンバー別のエンゲージメント分析では、「らんこ」さんが全体的に高いスコアを示しています。特に「12か月後もこの会社で仕事をしている」の項目で高い定着意向が見られます。一方、「まいまい」さんは全体的にスコアが低めで、特に「自分の貢献が組織に認められていると感じる」の項目で改善の余地があります。
              </p>
              <EngagementChart />
            </CardContent>
          </Card>
          <Card className="col-span-1 border-0 shadow-none">
            <div className="bg-[#C4BD97] text-white p-2 font-medium">メンバーの関心事</div>
            <CardContent className="pt-4">
              <p className="text-sm text-gray-600 mb-4">
                メンバーの関心事分析から、テクノロジー分野ではAIへの関心が最も高く、ビジネス分野ではリーダーシップに関する関心が高まっています。前回の調査と比較すると、「ワークライフバランス」への関心が20%増加しており、働き方改革への意識の高まりが見られます。
              </p>
              <KeywordTree />
            </CardContent>
          </Card>
          <Card className="col-span-1 border-0 shadow-none">
            <div className="bg-[#C4BD97] text-white p-2 font-medium">ケイパビリティ</div>
            <CardContent className="pt-4">
              <p className="text-sm text-gray-600 mb-4">
                メンバー別のケイパビリティ分析では、「おおほり」さんはインテグリティが最も高く、「まいまい」さんは専門性で突出しています。「やまざき」さんはリーダーシップが強みである一方、「かのみ」さんは協働力に優れています。チーム全体としては、専門性とインテグリティが高く、リーダーシップと協働力にばらつきがあります。
              </p>
              <CapabilityChart />
            </CardContent>
          </Card>
          <Card className="col-span-1 border-0 shadow-none">
            <div className="bg-[#C4BD97] text-white p-2 font-medium">メンタリング</div>
            <CardContent className="pt-4">
              <p className="text-sm text-gray-600 mb-4">
                メンタリングセッションの参加状況は、全メンバーで増加傾向にあります。特に「おおほり」さんと「やまざき」さんは8月に最も多くのセッションに参加し、「らんこ」さんは9月に急増しています。「まいまい」さんは安定した参加を維持していますが、他メンバーと比較するとやや少なめです。
              </p>
              <MentoringChart />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

