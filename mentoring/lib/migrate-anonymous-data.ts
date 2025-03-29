import { supabase } from "./supabase"
import { getOrCreateAnonymousId } from "./supabase"

/**
 * 匿名ユーザーのワークシートデータを登録済みユーザーに紐付ける
 * @param userId 登録済みユーザーのID
 * @returns
 */
export async function migrateAnonymousData(userId: string) {
  try {
    // 匿名IDを取得
    const anonymousId = getOrCreateAnonymousId()

    // 匿名IDに紐づくデータがあるか確認
    const { data: existingData, error: fetchError } = await supabase
      .from("worksheet_progress") // 正しいテーブル名を使用
      .select("*")
      .eq("anonymous_id", anonymousId)
      .single()

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        // データが見つからない場合は何もしない
        return { success: true, message: "No anonymous data found to migrate" }
      }
      throw fetchError
    }

    if (!existingData) {
      return { success: true, message: "No anonymous data found to migrate" }
    }

    // 既存のデータを取得
    const worksheetData = existingData.data

    // ユーザーIDに紐づくレコードを作成または更新
    const { error: upsertError } = await supabase
      .from("worksheet_progress") // 正しいテーブル名を使用
      .upsert(
        {
          user_id: userId,
          anonymous_id: anonymousId,
          data: worksheetData,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      )

    if (upsertError) {
      throw upsertError
    }

    return { success: true, message: "Data migrated successfully" }
  } catch (error) {
    console.error("Error migrating anonymous data:", error)
    return { success: false, error }
  }
}

