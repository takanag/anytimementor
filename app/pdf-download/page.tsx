"use client"

import { useEffect, useState } from "react"
import { Loader2, Download, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { generatePDF } from "@/lib/pdf-generator"
import { useRouter } from "next/navigation"

export default function PDFDownloadPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [userData, setUserData] = useState<any>({})
  const userName = userData.introduction?.name || "あなた"

  useEffect(() => {
    // ローカルストレージからデータを取得
    try {
      const localData = localStorage.getItem("worksheetData")
      if (localData) {
        const parsedData = JSON.parse(localData)
        setUserData(parsedData)
        console.log("Using data from localStorage")
      }
      setIsLoading(false)
    } catch (e) {
      console.error("Error reading from localStorage:", e)
      setIsLoading(false)
    }
  }, [])

  const handleDownload = async () => {
    setIsGenerating(true)
    try {
      await generatePDF(
        "pdf-content",
        `キャリアデザインワークシート_${userName}_${new Date().toISOString().split("T")[0]}.pdf`,
      )
    } catch (error) {
      console.error("PDF generation error:", error)
      alert("PDFの生成中にエラーが発生しました。")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleBack = () => {
    router.push("/complete")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // 日付のフォーマット
  const today = new Date()
  const formattedDate = `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#3A3A3A]">PDFプレビュー</h1>

        <div className="flex gap-2">
          <Button
            onClick={handleDownload}
            disabled={isGenerating}
            className="flex items-center gap-2 bg-[#4A593D] hover:bg-[#3A492D] text-white"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                PDFでダウンロード
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={handleBack}
            className="flex items-center gap-2 border-[#4A593D] text-[#4A593D]"
          >
            <ArrowLeft className="h-4 w-4" />
            戻る
          </Button>
        </div>
      </div>

      <div id="pdf-content" className="bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#3A3A3A] mb-2">キャリアデザインワークシート</h1>
          <p className="text-lg text-[#3A3A3A]">{userName}さんの完了レポート</p>
          <p className="text-sm text-[#3A3A3A]">{formattedDate}</p>
        </div>

        <div className="space-y-8">
          {/* 1. 内発的動機 */}
          <div>
            <h2 className="text-2xl font-bold text-[#3A3A3A] border-b border-[#4A593D] pb-2 mb-4">1. 内発的動機</h2>
            <div className="space-y-4">
              <div>
                <p className="font-medium text-[#4A593D] mb-2">あなたを動かす内発的動機</p>
                <p className="text-[#3A3A3A] bg-[#F8F7F2] p-3 rounded">
                  {userData.internalMotivation?.admiredTraits?.[0] || "自分の強みを活かす"},
                  {userData.internalMotivation?.admiredTraits?.[1] || "創造性を発揮する"},
                  {userData.internalMotivation?.admiredTraits?.[2] || "人と協力する"}
                </p>
              </div>
            </div>
          </div>

          {/* 2. 仕事に対するバイアス */}
          <div>
            <h2 className="text-2xl font-bold text-[#3A3A3A] border-b border-[#4A593D] pb-2 mb-4">
              2. 仕事に対するバイアス
            </h2>
            <div className="space-y-4">
              <div>
                <p className="font-medium text-[#4A593D] mb-2">仕事の意味</p>
                <div className="bg-[#F8F7F2] p-3 rounded">
                  <ul className="list-disc pl-5 text-[#3A3A3A]">
                    {userData.bias?.workMeanings?.map((meaning: string, index: number) => (
                      <li key={index}>{meaning === "その他" ? userData.bias?.otherWorkMeaning : meaning}</li>
                    )) || <li>データがありません</li>}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 3. 新たに始めること */}
          <div>
            <h2 className="text-2xl font-bold text-[#3A3A3A] border-b border-[#4A593D] pb-2 mb-4">
              3. 新たに始めること
            </h2>
            <div className="space-y-4">
              <div>
                <p className="font-medium text-[#4A593D] mb-2">新しく始めたいこと</p>
                <p className="text-[#3A3A3A] bg-[#F8F7F2] p-3 rounded">
                  {userData.newBeginnings?.activity || "新しいスキルの習得"}
                </p>
                <p className="font-medium text-[#4A593D] mt-4 mb-2">いつから</p>
                <p className="text-[#3A3A3A] bg-[#F8F7F2] p-3 rounded">
                  {userData.newBeginnings?.timeframe === "immediate"
                    ? "今すぐ（1週間以内）"
                    : userData.newBeginnings?.timeframe === "soon"
                      ? "近いうち（1ヶ月以内）"
                      : "将来的に（3ヶ月以内）"}
                </p>
                <p className="font-medium text-[#4A593D] mt-4 mb-2">コミットメント</p>
                <p className="text-[#3A3A3A] bg-[#F8F7F2] p-3 rounded">
                  {userData.newBeginnings?.commitment || "毎週時間を確保して取り組む"}
                </p>
              </div>
            </div>
          </div>

          {/* 4. 強みと能力 */}
          <div>
            <h2 className="text-2xl font-bold text-[#3A3A3A] border-b border-[#4A593D] pb-2 mb-4">4. 強みと能力</h2>
            <div className="space-y-4">
              <div>
                <p className="font-medium text-[#4A593D] mb-2">あなたの強み</p>
                <p className="text-[#3A3A3A] bg-[#F8F7F2] p-3 rounded">
                  {userData.capability?.strengths || "コミュニケーション能力と問題解決力"}
                </p>
              </div>
              <div>
                <p className="font-medium text-[#4A593D] mb-2">伸ばしたいケイパビリティ</p>
                <p className="text-[#3A3A3A] bg-[#F8F7F2] p-3 rounded">
                  {userData.capability?.improvements || "リーダーシップとコミュニケーション能力"}
                </p>
              </div>
            </div>
          </div>

          {/* 5. 理想の未来像 */}
          <div>
            <h2 className="text-2xl font-bold text-[#3A3A3A] border-b border-[#4A593D] pb-2 mb-4">5. 理想の未来像</h2>
            <div className="space-y-4">
              <div>
                <p className="font-medium text-[#4A593D] mb-2">あなたの理想の未来</p>
                <p className="text-[#3A3A3A] bg-[#F8F7F2] p-3 rounded">
                  {userData.celebration?.vision || "自分らしく働ける環境で、価値を生み出している"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-[#3A3A3A]">
          <p>このレポートはAny Time Mentorによって生成されました</p>
          <p>© Any Time Mentor {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  )
}

