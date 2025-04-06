"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useWorksheetContext } from "@/context/worksheet-context"
import { PlusCircle, Trash2, Download } from "lucide-react"
import { generateRoadmapPDF, downloadPDF } from "@/lib/generate-pdf"
import { toast } from "@/components/ui/use-toast"

interface Action {
  id: string
  text: string
  deadline: string
}

export default function Mentoring() {
  const { responses, updateResponses, saveData } = useWorksheetContext()
  const [name, setName] = useState("")
  const [goal, setGoal] = useState("")
  const [deadline, setDeadline] = useState("")
  const [yoshuku, setYoshuku] = useState("")
  const [actions, setActions] = useState<Action[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // 初期データのロード
  useEffect(() => {
    if (responses.mentoring) {
      setName(responses.mentoring.name || "")
      setGoal(responses.mentoring.goal || "")
      setDeadline(responses.mentoring.deadline || "")
      setYoshuku(responses.mentoring.yoshuku || "")
      setActions(responses.mentoring.actions || [])
    } else {
      // 初期アクションを追加
      addAction()
    }
  }, [responses.mentoring])

  // データの保存
  const handleSave = async () => {
    const mentoringData = {
      name,
      goal,
      deadline,
      yoshuku,
      actions,
    }

    updateResponses("mentoring", mentoringData)
    await saveData()
  }

  // アクションの追加
  const addAction = () => {
    const newAction: Action = {
      id: Date.now().toString(),
      text: "",
      deadline: "",
    }
    setActions([...actions, newAction])
  }

  // アクションの削除
  const removeAction = (id: string) => {
    setActions(actions.filter((action) => action.id !== id))
  }

  // アクションの更新
  const updateAction = (id: string, field: keyof Action, value: string) => {
    setActions(actions.map((action) => (action.id === id ? { ...action, [field]: value } : action)))
  }

  // PDFのダウンロード
  const handleDownloadPDF = () => {
    try {
      setIsLoading(true)
      console.log("PDFダウンロード開始")

      // 最新のデータを保存
      handleSave()

      // PDFの生成
      const doc = generateRoadmapPDF({
        ...responses,
        mentoring: {
          name,
          goal,
          deadline,
          yoshuku,
          actions,
        },
      })

      // PDFのダウンロード
      downloadPDF(doc, `予祝ロードマップ_${name || "名前なし"}.pdf`)

      toast({
        title: "PDFダウンロード完了",
        description: "予祝ロードマップのPDFがダウンロードされました",
      })
    } catch (error) {
      console.error("PDFダウンロードエラー:", error)
      toast({
        title: "エラー",
        description: "PDFのダウンロードに失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>メンタリング - 予祝ロードマップ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">お名前</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="あなたのお名前" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal">達成したい目標</Label>
            <Textarea
              id="goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="具体的な目標を記入してください"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">目標達成期限</Label>
            <Input
              id="deadline"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              placeholder="例: 2023年12月31日"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>行動計画</Label>
              <Button variant="outline" size="sm" onClick={addAction} className="flex items-center gap-1">
                <PlusCircle className="h-4 w-4" />
                <span>追加</span>
              </Button>
            </div>

            <div className="space-y-4">
              {actions.map((action) => (
                <Card key={action.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <Label htmlFor={`action-${action.id}`}>行動内容</Label>
                      <Button variant="ghost" size="sm" onClick={() => removeAction(action.id)} className="h-8 w-8 p-0">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">削除</span>
                      </Button>
                    </div>
                    <Textarea
                      id={`action-${action.id}`}
                      value={action.text}
                      onChange={(e) => updateAction(action.id, "text", e.target.value)}
                      placeholder="具体的な行動を記入してください"
                      rows={2}
                    />
                    <div>
                      <Label htmlFor={`deadline-${action.id}`}>期限</Label>
                      <Input
                        id={`deadline-${action.id}`}
                        value={action.deadline}
                        onChange={(e) => updateAction(action.id, "deadline", e.target.value)}
                        placeholder="例: 2023年11月15日"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="yoshuku">予祝（目標達成後のイメージ）</Label>
            <Textarea
              id="yoshuku"
              value={yoshuku}
              onChange={(e) => setYoshuku(e.target.value)}
              placeholder="目標を達成した後の状態を、すでに達成したかのように具体的に記述してください"
              rows={4}
            />
          </div>

          <div className="flex justify-between pt-4">
            <Button onClick={handleSave}>保存</Button>
            <Button
              variant="outline"
              onClick={handleDownloadPDF}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              <span>PDFダウンロード</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

