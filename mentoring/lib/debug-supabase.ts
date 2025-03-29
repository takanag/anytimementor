import { getSupabaseClient } from "@/lib/supabase"

// テーブルの存在を確認する関数
export async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    const supabase = getSupabaseClient()
    if (!supabase) {
      console.error("Supabaseクライアントの初期化に失敗しました。")
      return false
    }

    const { data, error } = await supabase.from("pg_tables").select("*").eq("tablename", tableName)

    if (error) {
      console.error("テーブルの存在確認中にエラーが発生しました:", error)
      return false
    }

    return data && data.length > 0
  } catch (error) {
    console.error("テーブルの存在確認中に予期しないエラーが発生しました:", error)
    return false
  }
}

// Supabase接続をデバッグする関数
export async function debugSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = getSupabaseClient()

    if (!supabase) {
      return { success: false, message: "Supabaseクライアントの初期化に失敗しました。" }
    }

    // 接続テスト
    const { data, error } = await supabase.from("worksheet_progress").select("*").limit(1)

    if (error) {
      console.error("Supabaseへの接続エラー:", error)
      return { success: false, message: `Supabaseへの接続エラー: ${error.message}` }
    }

    console.log("Supabaseに正常に接続しました")
    console.log("サンプルデータ:", data)

    return { success: true, message: "Supabaseに正常に接続されました。" }
  } catch (error: any) {
    console.error("Supabase接続中に予期しないエラーが発生しました:", error)
    return { success: false, message: `Supabase接続中に予期しないエラーが発生しました: ${error.message}` }
  }
}

// テーブル構造を検査する関数
export async function inspectTableStructure(): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const supabase = getSupabaseClient()
    if (!supabase) {
      return { success: false, message: "Supabaseクライアントの初期化に失敗しました。" }
    }

    // テーブル構造の検査
    const { data, error } = await supabase.from("worksheet_progress").select("*").limit(1)

    if (error) {
      return { success: false, message: `テーブル構造の検査中にエラーが発生しました: ${error.message}` }
    }

    const columnNames = data && data.length > 0 ? Object.keys(data[0]) : []
    console.log("テーブルの列:", columnNames)

    return {
      success: true,
      message: "テーブル構造の検査に成功しました。",
      data: { columns: columnNames, sample: data },
    }
  } catch (error: any) {
    console.error("テーブル構造の検査中に予期しないエラーが発生しました:", error)
    return { success: false, message: `テーブル構造の検査中に予期しないエラーが発生しました: ${error.message}` }
  }
}

// テーブルのカラム情報を取得する関数
export async function getTableColumns(
  tableName: string,
): Promise<{ success: boolean; columns?: any[]; message?: string }> {
  try {
    const supabase = getSupabaseClient()
    if (!supabase) {
      return { success: false, message: "Supabaseクライアントの初期化に失敗しました。" }
    }

    const { data, error } = await supabase
      .from("information_schema.columns")
      .select("column_name, data_type, is_nullable, column_default")
      .eq("table_name", tableName)

    if (error) {
      console.error("カラム情報の取得中にエラーが発生しました:", error)
      return { success: false, message: `カラム情報の取得中にエラーが発生しました: ${error.message}` }
    }

    return { success: true, columns: data }
  } catch (error: any) {
    console.error("カラム情報の取得中に予期しないエラーが発生しました:", error)
    return { success: false, message: `カラム情報の取得中に予期しないエラーが発生しました: ${error.message}` }
  }
}

// サンプルレコードを取得する関数
export async function getSampleRecords(
  tableName: string,
  limit: number,
): Promise<{ success: boolean; records?: any[]; message?: string }> {
  try {
    const supabase = getSupabaseClient()
    if (!supabase) {
      return { success: false, message: "Supabaseクライアントの初期化に失敗しました。" }
    }

    const { data, error } = await supabase.from(tableName).select("*").limit(limit)

    if (error) {
      console.error("レコードの取得中にエラーが発生しました:", error)
      return { success: false, message: `レコードの取得中にエラーが発生しました: ${error.message}` }
    }

    return { success: true, records: data }
  } catch (error: any) {
    console.error("レコードの取得中に予期しないエラーが発生しました:", error)
    return { success: false, message: `レコードの取得中に予期しないエラーが発生しました: ${error.message}` }
  }
}

