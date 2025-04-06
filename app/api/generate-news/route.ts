import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { interviewAnswers, userName } = await request.json()

    // 必要なデータが揃っているか確認
    if (!interviewAnswers || !userName) {
      return NextResponse.json({ error: "必要なデータが不足しています" }, { status: 400 })
    }

    // モックデータを準備（OpenAI APIを使用しない）
    const mockArticle = {
      headline: `${userName}氏、革新的なアプローチで業界に変革をもたらす`,
      lead: `10年間の着実な努力と独自のビジョンにより、${userName}氏は今や業界の第一人者として認められている。`,
      content: `${interviewAnswers.work || "現在の仕事"} の分野で活躍する${userName}氏は、独自のアプローチと情熱で多くの人々に影響を与えています。\n\n日々の業務では${interviewAnswers.schedule || "効率的なスケジュール管理"}を実践し、${interviewAnswers.fulfillment || "やりがい"}を感じながら仕事に取り組んでいます。\n\nプライベートでは${interviewAnswers.freeTime || "充実した時間の過ごし方"}を大切にし、ワークライフバランスを保ちながら成果を上げ続けています。`,
      quote: `「${interviewAnswers.advice || "自分を信じて小さな一歩を踏み出すことが大切です"}」と${userName}氏は語る。「10年前に始めた小さな習慣が、今日の成功につながっています。」`,
    }

    // モックデータを返す
    return NextResponse.json({ article: mockArticle })
  } catch (error) {
    console.error("記事生成中にエラーが発生しました:", error)

    // エラーの詳細情報を含める
    const errorDetails =
      error instanceof Error ? { message: error.message, stack: error.stack } : { message: "Unknown error" }

    return NextResponse.json(
      {
        error: "記事の生成に失敗しました",
        details: errorDetails,
      },
      { status: 500 },
    )
  }
}

