import { NextResponse } from "next/server"
import { debugSupabaseConnection, inspectTableStructure } from "@/lib/debug-supabase"

export async function GET() {
  try {
    const connectionResult = await debugSupabaseConnection()
    const tableStructure = await inspectTableStructure()

    return NextResponse.json({
      connectionResult,
      tableStructure,
    })
  } catch (error) {
    console.error("デバッグルートでエラーが発生しました:", error)
    return NextResponse.json({ error: "Supabase接続のデバッグに失敗しました" }, { status: 500 })
  }
}

