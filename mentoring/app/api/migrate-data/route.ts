import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { migrateAnonymousData } from "@/lib/migrate-anonymous-data"

export async function POST(request: NextRequest) {
  try {
    // Supabaseクライアントを作成
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // 現在のセッションを取得
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // データ移行を実行
    const result = await migrateAnonymousData(session.user.id)

    if (!result.success) {
      return NextResponse.json({ error: "Failed to migrate data" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: result.message })
  } catch (error) {
    console.error("Error in migrate-data route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

