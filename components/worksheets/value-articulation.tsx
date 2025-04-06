"use client"

import { useState, useEffect } from "react"
import { useWorksheet } from "@/context/worksheet-context"
import MessageBubble from "@/components/message-bubble"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import StepNavigation from "@/components/step-navigation"

export default function ValueArticulationWorksheet() {
  const { responses, updateResponse } = useWorksheet()
  const userName = responses.introduction?.name || "あなた"

  // ステップ7のアセスメント結果から上位2つの能力を取得
  const getTopTwoStrengths = () => {
    const capability = responses.capability
    if (!capability) return ["データなし", "データなし"]

    const scores = [
      { name: "リーダーシップ", score: capability.leadership || 0 },
      { name: "ビジネス理解", score: capability.communication || 0 },
      { name: "専門性", score: capability.technical || 0 },
      { name: "協働力", score: capability.problemSolving || 0 },
      { name: "誠実さと信頼", score: capability.creativity || 0 },
    ]

    // スコアの高い順にソート
    scores.sort((a, b) => b.score - a.score)

    // 上位2つを返す
    return [scores[0].name, scores[1].name]
  }

  const topStrengths = getTopTwoStrengths()

  // フォームの状態
  const [situation, setSituation] = useState(responses.valueArticulation?.situation || "")
  const [action, setAction] = useState(responses.valueArticulation?.action || "")
  const [result, setResult] = useState(responses.valueArticulation?.result || "")
  const [feedback, setFeedback] = useState(responses.valueArticulation?.feedback || "")
  const [keyword1, setKeyword1] = useState(responses.valueArticulation?.keyword1 || "")
  const [keyword2, setKeyword2] = useState(responses.valueArticulation?.keyword2 || "")
  const [keyword3, setKeyword3] = useState(responses.valueArticulation?.keyword3 || "")
  const [valueStatement, setValueStatement] = useState(responses.valueArticulation?.valueStatement || "")

  // ステップ完了状態
  const [isCompleted, setIsCompleted] = useState(false)

  // 値が変更されたときに保存
  useEffect(() => {
    if (situation && action && result && feedback && keyword1 && keyword2 && keyword3 && valueStatement) {
      setIsCompleted(true)

      // ステップ完了イベントを発火
      const event = new CustomEvent("stepStatusChange", {
        detail: { isCompleted: true },
      })
      window.dispatchEvent(event)
    }
  }, [situation, action, result, feedback, keyword1, keyword2, keyword3, valueStatement])

  // フォームの送信
  const handleSubmit = () => {
    updateResponse("valueArticulation", "situation", situation)
    updateResponse("valueArticulation", "action", action)
    updateResponse("valueArticulation", "result", result)
    updateResponse("valueArticulation", "feedback", feedback)
    updateResponse("valueArticulation", "keyword1", keyword1)
    updateResponse("valueArticulation", "keyword2", keyword2)
    updateResponse("valueArticulation", "keyword3", keyword3)
    updateResponse("valueArticulation", "valueStatement", valueStatement)
  }

  // ステップナビゲーションの内容
  const steps = [
    {
      title: "このステップで行うこと",
      content: (
        <div className="space-y-4">
          <p>このエクササイズは、あなたが仕事で発揮している「本当の価値」を言葉にするためのものです。</p>
          <p>
            アセスメントで明らかになった強みをもとに、具体的な成功体験を振り返りながら、あなたの価値を簡潔に表現します。たった10分ほどで、自分の強みと貢献を一文にまとめることができます。
          </p>
          <p>
            自分の価値を言語化できると、自己アピールやキャリア選択の際に自信を持って自分を表現できるようになります。ぜひ素直な気持ちで取り組んでみてください。
          </p>
        </div>
      ),
    },
    {
      title: "ステップ1：強みを確認する",
      content: (
        <div className="space-y-4">
          <p>アセスメント結果から、あなたのスコアが最も高かった上位2つの能力は以下の通りです：</p>
          <div className="bg-[#F0EEE4] p-4 rounded-md">
            <p className="mb-2">
              <strong>強み1：</strong>
              {topStrengths[0]}
            </p>
            <p>
              <strong>強み2：</strong>
              {topStrengths[1]}
            </p>
          </div>
          <p className="text-sm text-gray-600">これらの強みを念頭に置いて、次のステップに進みましょう。</p>
        </div>
      ),
    },
    {
      title: "ステップ2：具体的な成功体験を思い出す",
      content: (
        <div className="space-y-4">
          <p>この強みを発揮して良い結果を出した具体的な場面を思い出してください。</p>

          <div className="space-y-3">
            <div>
              <p className="mb-1 font-medium">状況：どのような場面でしたか？</p>
              <Textarea
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                placeholder="例：チームのプロジェクトが行き詰まっていた時..."
                className="w-full"
                rows={3}
                onBlur={handleSubmit}
              />
            </div>

            <div>
              <p className="mb-1 font-medium">行動：あなたは具体的に何をしましたか？</p>
              <Textarea
                value={action}
                onChange={(e) => setAction(e.target.value)}
                placeholder="例：メンバーと個別に話し合い、それぞれの懸念点を整理して..."
                className="w-full"
                rows={3}
                onBlur={handleSubmit}
              />
            </div>

            <div>
              <p className="mb-1 font-medium">結果：それによってどのような成果が生まれましたか？</p>
              <Textarea
                value={result}
                onChange={(e) => setResult(e.target.value)}
                placeholder="例：チームの士気が高まり、期限内にプロジェクトを完了できた..."
                className="w-full"
                rows={3}
                onBlur={handleSubmit}
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "ステップ3：周囲からのフィードバック",
      content: (
        <div className="space-y-4">
          <p>上司や同僚、クライアントから、あなたの強みや貢献について言われた言葉を一つ思い出してください。</p>

          <div>
            <p className="mb-1 font-medium">言われた内容：</p>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="例：「あなたがいると、チームの雰囲気が良くなり、みんなが意見を言いやすくなる」"
              className="w-full"
              rows={3}
              onBlur={handleSubmit}
            />
          </div>
        </div>
      ),
    },
    {
      title: "ステップ4：あなたの価値を表現する",
      content: (
        <div className="space-y-4">
          <p>以上を踏まえて、あなたが仕事で発揮している価値を表現してください。</p>

          <div className="space-y-3">
            <p className="font-medium">まず、キーワードで3つ：</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Input
                  value={keyword1}
                  onChange={(e) => setKeyword1(e.target.value)}
                  placeholder="キーワード1"
                  className="w-full"
                  onBlur={handleSubmit}
                />
              </div>
              <div>
                <Input
                  value={keyword2}
                  onChange={(e) => setKeyword2(e.target.value)}
                  placeholder="キーワード2"
                  className="w-full"
                  onBlur={handleSubmit}
                />
              </div>
              <div>
                <Input
                  value={keyword3}
                  onChange={(e) => setKeyword3(e.target.value)}
                  placeholder="キーワード3"
                  className="w-full"
                  onBlur={handleSubmit}
                />
              </div>
            </div>

            <div>
              <p className="mb-1 font-medium">次に、一文にまとめる：</p>
              <Textarea
                value={valueStatement}
                onChange={(e) => setValueStatement(e.target.value)}
                placeholder="私は〇〇によって、△△に□□をもたらす"
                className="w-full"
                rows={3}
                onBlur={handleSubmit}
              />

              <div className="mt-3 bg-[#F0EEE4] p-3 rounded-md">
                <p className="text-sm font-medium mb-1">ヒント：</p>
                <ul className="text-sm list-disc pl-5 space-y-1">
                  <li>「私は〇〇によって、△△に□□をもたらす」</li>
                  <li>「私は〇〇と△△を組み合わせて、□□を実現する」</li>
                  <li>「私は〇〇な状況において、△△を通じて□□を創出する」</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "振り返り",
      content: (
        <div className="space-y-4">
          <p>このエクササイズを通じて明確になった「あなたの価値」は、以下のような場面で活用できます：</p>

          <ul className="list-disc pl-5 space-y-2">
            <li>自己紹介やキャリア面談での自己アピール</li>
            <li>日々の業務における優先順位の判断基準</li>
            <li>キャリア計画における方向性の指針</li>
            <li>自分の存在意義や貢献を再確認する際の拠り所</li>
          </ul>

          <p className="mt-4">エクササイズを定期的に行うことで、自分の価値の変化や成長を確認していきましょう。</p>

          {isCompleted && (
            <div className="mt-4 p-4 bg-[#F0EEE4] rounded-md">
              <p className="font-medium mb-2">あなたの価値ステートメント：</p>
              <p className="italic">「{valueStatement}」</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {keyword1 && <span className="px-2 py-1 bg-[#C4BD97] text-white rounded-full text-sm">{keyword1}</span>}
                {keyword2 && <span className="px-2 py-1 bg-[#C4BD97] text-white rounded-full text-sm">{keyword2}</span>}
                {keyword3 && <span className="px-2 py-1 bg-[#C4BD97] text-white rounded-full text-sm">{keyword3}</span>}
              </div>
            </div>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <MessageBubble>
        <p className="text-lg font-medium mb-2">あなたの価値を言語化する</p>
        <p>
          {userName}さん、このステップでは、あなたが仕事で発揮している「本当の価値」を言葉にしていきます。
          アセスメントで明らかになった強みをもとに、具体的な成功体験を振り返りながら進めていきましょう。
        </p>
      </MessageBubble>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <StepNavigation steps={steps} />
      </div>
    </div>
  )
}

