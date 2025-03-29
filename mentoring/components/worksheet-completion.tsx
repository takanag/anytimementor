"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useWorksheet } from "@/context/worksheet-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Save, UserPlus } from "lucide-react"
import Link from "next/link"

export default function WorksheetCompletion() {
  const { responses } = useWorksheet()
  const router = useRouter()
  const [isMigrating, setIsMigrating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const userName = responses.introduction?.name || "あなた"

  // コンポーネントのマウント時に最適化
  useEffect(() => {
    // データが読み込まれたらローディング状態を解除
    if (Object.keys(responses).length > 0) {
      setIsLoading(false)
    } else {
      // レスポンスが空の場合、ローカルストレージからデータを取得してみる
      try {
        const localData = localStorage.getItem("worksheetData")
        if (localData) {
          console.log("Using data from localStorage")
          setIsLoading(false)
        } else {
          // 3秒後にタイムアウト
          const timer = setTimeout(() => {
            setIsLoading(false)
          }, 3000)
          return () => clearTimeout(timer)
        }
      } catch (e) {
        console.error("Error reading from localStorage:", e)
        setIsLoading(false)
      }
    }
  }, [responses])

  const handleSignupClick = async () => {
    // 匿名データの移行は登録後に行うため、ここではフラグだけ設定
    localStorage.setItem("pendingDataMigration", "true")
    router.push("/signup")
  }

  const handleDownloadPDF = () => {
    // PDFダウンロード機能（実際の実装はここでは省略）
    alert("PDFダウンロード機能は現在開発中です")
  }

  // ローディング中は簡易的なローディングインジケータを表示
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 flex justify-center items-center min-h-[50vh]">
        <div className="text-center">
          <div className="inline-block animate-pulse bg-gray-200 rounded-full h-16 w-16 mb-4"></div>
          <p className="text-gray-500">データを読み込んでいます...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">おめでとうございます！</h1>
        <p className="text-lg text-gray-600">{userName}さん、すべてのワークシートを完了しました。</p>
      </div>

      <Card className="mb-8">
        <CardHeader className="bg-[#4A593D] text-white">
          <CardTitle>キャリアデザインの成果物</CardTitle>
          <CardDescription className="text-gray-100">
            これまでのワークを通じて得られた気づきをまとめました
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="summary">サマリー</TabsTrigger>
              <TabsTrigger value="insights">気づき</TabsTrigger>
              <TabsTrigger value="next-steps">次のステップ</TabsTrigger>
            </TabsList>
            <TabsContent value="summary" className="p-4">
              <h3 className="text-xl font-medium mb-4">キャリアデザインサマリー</h3>

              <div className="space-y-4">
                <div className="bg-[#F0EEE4] p-4 rounded-lg">
                  <h4 className="font-medium text-[#4A593D] mb-2">内発的動機</h4>
                  <p>
                    {responses.internalMotivation?.admiredTraits?.[0] || "自分の強みを活かす"},
                    {responses.internalMotivation?.admiredTraits?.[1] || "創造性を発揮する"},
                    {responses.internalMotivation?.admiredTraits?.[2] || "人と協力する"}
                  </p>
                </div>

                <div className="bg-[#F0EEE4] p-4 rounded-lg">
                  <h4 className="font-medium text-[#4A593D] mb-2">新たに始めること</h4>
                  <p>{responses.newBeginnings?.activity || "新しいスキルの習得"}</p>
                </div>

                <div className="bg-[#F0EEE4] p-4 rounded-lg">
                  <h4 className="font-medium text-[#4A593D] mb-2">強み</h4>
                  <p>{responses.capability?.strengths || "コミュニケーション能力と問題解決力"}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="insights" className="p-4">
              <h3 className="text-xl font-medium mb-4">得られた気づき</h3>

              <div className="space-y-4">
                <div className="bg-[#F0EEE4] p-4 rounded-lg">
                  <h4 className="font-medium text-[#4A593D] mb-2">仕事に対するバイアス</h4>
                  <ul className="list-disc pl-5">
                    {responses.bias?.workMeanings?.map((meaning: string, index: number) => (
                      <li key={index}>{meaning === "その他" ? responses.bias?.otherWorkMeaning : meaning}</li>
                    )) || <li>データがありません</li>}
                  </ul>
                </div>

                <div className="bg-[#F0EEE4] p-4 rounded-lg">
                  <h4 className="font-medium text-[#4A593D] mb-2">理想の未来像</h4>
                  <p>{responses.celebration?.vision || "自分らしく働ける環境で、価値を生み出している"}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="next-steps" className="p-4">
              <h3 className="text-xl font-medium mb-4">次のステップ</h3>

              <div className="space-y-4">
                <div className="bg-[#F0EEE4] p-4 rounded-lg">
                  <h4 className="font-medium text-[#4A593D] mb-2">新たに始めること</h4>
                  <p>
                    <span className="font-medium">何を：</span>{" "}
                    {responses.newBeginnings?.activity || "新しいスキルの習得"}
                  </p>
                  <p>
                    <span className="font-medium">いつから：</span>{" "}
                    {responses.newBeginnings?.timeframe === "immediate"
                      ? "今すぐ（1週間以内）"
                      : responses.newBeginnings?.timeframe === "soon"
                        ? "近いうち（1ヶ月以内）"
                        : "将来的に（3ヶ月以内）"}
                  </p>
                  <p>
                    <span className="font-medium">コミットメント：</span>{" "}
                    {responses.newBeginnings?.commitment || "毎週時間を確保して取り組む"}
                  </p>
                </div>

                <div className="bg-[#F0EEE4] p-4 rounded-lg">
                  <h4 className="font-medium text-[#4A593D] mb-2">伸ばしたいケイパビリティ</h4>
                  <p>{responses.capability?.improvements || "リーダーシップとコミュニケーション能力"}</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleDownloadPDF}>
            <Download className="mr-2 h-4 w-4" />
            PDFでダウンロード
          </Button>
          <Button asChild>
            <Link href="/worksheet/1">
              <Save className="mr-2 h-4 w-4" />
              もう一度見直す
            </Link>
          </Button>
        </CardFooter>
      </Card>

      <Card className="border-2 border-primary">
        <CardHeader>
          <CardTitle>次のステップ：日々のメンタリングを始めましょう</CardTitle>
          <CardDescription>ワークシートで得た気づきを活かして、継続的なキャリア開発を進めましょう</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>
              ワークシートを完了したことで、{userName}さんのキャリアに関する重要な気づきが得られました。
              これからは、日々のメンタリングを通じて、これらの気づきを実際の行動に移し、継続的に成長していくことが大切です。
            </p>

            <div className="bg-[#F0EEE4] p-4 rounded-lg">
              <h4 className="font-medium text-[#4A593D] mb-2">日々のメンタリングで得られるもの：</h4>
              <ul className="list-disc pl-5 space-y-2">
                <li>定期的な振り返りと目標設定のサポート</li>
                <li>キャリア開発に関する具体的なアドバイス</li>
                <li>新たな気づきや視点の獲得</li>
                <li>モチベーション維持のための継続的なサポート</li>
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-4">
          <Button className="w-full sm:w-auto" onClick={handleSignupClick}>
            <UserPlus className="mr-2 h-4 w-4" />
            無料アカウントを作成する
          </Button>
          <p className="text-sm text-muted-foreground text-center sm:text-left">
            アカウントを作成すると、これまでの進捗データが自動的に保存されます
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

