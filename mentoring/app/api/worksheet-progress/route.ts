import { NextResponse } from "next/server"
import { getSupabaseClient } from "@/lib/supabase"

// PATCHリクエストを処理する関数
export async function PATCH(request: Request) {
  try {
    // URLからIDを取得
    const url = new URL(request.url)
    const idParam = url.searchParams.get("id")

    if (!idParam || !idParam.startsWith("eq.")) {
      return NextResponse.json({ error: "Invalid ID parameter" }, { status: 400 })
    }

    // eq.1 のような形式からIDを抽出
    const id = idParam.substring(3)

    // リクエストボディを取得
    const body = await request.json()
    console.log("古いワークシートAPIが呼び出されました。IDパラメータ:", idParam, "ボディ:", body)

    // 必要なデータを抽出
    const { anonymous_id, data, current_step, completed } = body

    if (!anonymous_id || !data) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Supabaseクライアントを取得
    const supabase = getSupabaseClient()

    // worksheet_data_syncテーブルにデータを保存
    const { error } = await supabase.from("worksheet_data_sync").upsert(
      {
        anonymous_id,
        worksheet_id: "default",
        data,
        current_step: current_step || 1,
        completed: completed || false,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "anonymous_id,worksheet_id" },
    )

    if (error) {
      console.error("新しいテーブルへのリダイレクト中にエラーが発生しました:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // 成功レスポンスを返す
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("ワークシートプログレスAPIでエラーが発生しました:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

