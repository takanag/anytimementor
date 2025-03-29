"use client"

import { useEffect, useState } from "react"
import { Loader2, Download, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWorksheet } from "@/context/worksheet-context"
import Link from "next/link"
import { generatePDF } from "@/lib/pdf-generator"

export default function PDFDownloadPage() {
  const { responses } = useWorksheet()
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const userName = responses.introduction?.name || "あなた"

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
          }, 1000)
          return () => clearTimeout(timer)
        }
      } catch (e) {
        console.error("Error reading from localStorage:", e)
        setIsLoading(false)
      }
    }
  }, [responses])

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <Link href="/worksheet/complete">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            戻る
          </Button>
        </Link>

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
      </div>

      <div id="pdf-content" className="bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">キャリアデザインワークシート</h1>
          <p className="text-lg text-gray-600">{userName}さんの完了レポート</p>
          <p className="text-sm text-gray-500">{new Date().toLocaleDateString("ja-JP")}</p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 border-b pb-2">1. 内発的動機</h2>
          <div className="space-y-4">
            <div className="bg-[#F0EEE4] p-4 rounded-lg">
              <h3 className="font-medium text-[#4A593D] mb-2">あなたを動かす内発的動機</h3>
              <p>
                {responses.internalMotivation?.admiredTraits?.[0] || "自分の強みを活かす"},
                {responses.internalMotivation?.admiredTraits?.[1] || "創造性を発揮する"},
                {responses.internalMotivation?.admiredTraits?.[2] || "人と協力する"}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 border-b pb-2">2. 仕事に対するバイアス</h2>
          <div className="space-y-4">
            <div className="bg-[#F0EEE4] p-4 rounded-lg">
              <h3 className="font-medium text-[#4A593D] mb-2">仕事の意味</h3>
              <ul className="list-disc pl-5">
                {responses.bias?.workMeanings?.map((meaning: string, index: number) => (
                  <li key={index}>{meaning === "その他" ? responses.bias?.otherWorkMeaning : meaning}</li>
                )) || <li>データがありません</li>}
              </ul>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 border-b pb-2">3. 新たに始めること</h2>
          <div className="space-y-4">
            <div className="bg-[#F0EEE4] p-4 rounded-lg">
              <h3 className="font-medium text-[#4A593D] mb-2">新しく始めたいこと</h3>
              <p>{responses.newBeginnings?.activity || "新しいスキルの習得"}</p>
              <p className="mt-2">
                <span className="font-medium">いつから：</span>{" "}
                {responses.newBeginnings?.timeframe === "immediate"
                  ? "今すぐ（1週間以内）"
                  : responses.newBeginnings?.timeframe === "soon"
                    ? "近いうち（1ヶ月以内）"
                    : "将来的に（3ヶ月以内）"}
              </p>
              <p className="mt-2">
                <span className="font-medium">コミットメント：</span>{" "}
                {responses.newBeginnings?.commitment || "毎週時間を確保して取り組む"}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 border-b pb-2">4. 強みと能力</h2>
          <div className="space-y-4">
            <div className="bg-[#F0EEE4] p-4 rounded-lg">
              <h3 className="font-medium text-[#4A593D] mb-2">あなたの強み</h3>
              <p>{responses.capability?.strengths || "コミュニケーション能力と問題解決力"}</p>
            </div>
            <div className="bg-[#F0EEE4] p-4 rounded-lg">
              <h3 className="font-medium text-[#4A593D] mb-2">伸ばしたいケイパビリティ</h3>
              <p>{responses.capability?.improvements || "リーダーシップとコミュニケーション能力"}</p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 border-b pb-2">5. 理想の未来像</h2>
          <div className="space-y-4">
            <div className="bg-[#F0EEE4] p-4 rounded-lg">
              <h3 className="font-medium text-[#4A593D] mb-2">あなたの理想の未来</h3>
              <p>{responses.celebration?.vision || "自分らしく働ける環境で、価値を生み出している"}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>このレポートはAny Time Mentorによって生成されました</p>
          <p>© Any Time Mentor {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  )
}

