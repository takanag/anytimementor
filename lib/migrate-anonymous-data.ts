import { supabase } from "./supabase"
import { getOrCreateAnonymousId } from "./supabase"

/**
 * 匿名ユーザーのワークシートデータを登録済みユーザーに紐付ける
 * 拡張版: worksheet_progress, worksheet_data_sync, worksheet_analyticsの全てのテーブルを更新
 * @param userId 登録済みユーザーのID
 * @returns
 */
export async function migrateAnonymousData(userId: string) {
  try {
    // 匿名IDを取得
    const anonymousId = getOrCreateAnonymousId()
    console.log(`匿名ID「${anonymousId}」からユーザーID「${userId}」へのデータ移行を開始します`)

    // 各テーブルで個別に移行処理を実行
    const results = await Promise.all([
      migrateWorksheetProgress(userId, anonymousId),
      migrateWorksheetDataSync(userId, anonymousId),
      migrateWorksheetAnalytics(userId, anonymousId)
    ])

    // 全ての移行が成功したかを確認
    const allSuccess = results.every(result => result.success)
    const messages = results.map(result => result.message).filter(Boolean)

    return { 
      success: allSuccess, 
      message: messages.join('; ') || "データ移行が完了しました" 
    }
  } catch (error) {
    console.error("データ移行中にエラーが発生しました:", error)
    return { success: false, error }
  }
}

/**
 * worksheet_progressテーブルのデータを移行する関数
 */
async function migrateWorksheetProgress(userId: string, anonymousId: string) {
  try {
    // 匿名IDに紐づくデータがあるか確認
    const { data: existingData, error: fetchError } = await supabase
      .from("worksheet_progress")
      .select("*")
      .eq("anonymous_id", anonymousId)
      .single()

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        // データが見つからない場合は成功を返す（スキップ）
        return { success: true, message: "worksheet_progressにデータなし" }
      }
      throw fetchError
    }

    if (!existingData) {
      return { success: true, message: "worksheet_progressにデータなし" }
    }

    // ユーザーIDに紐づくレコードを作成または更新
    const { error: upsertError } = await supabase
      .from("worksheet_progress")
      .upsert(
        {
          user_id: userId,
          anonymous_id: anonymousId,
          data: existingData.data,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )

    if (upsertError) {
      throw upsertError
    }

    return { success: true, message: "worksheet_progressのデータを移行しました" }
  } catch (error) {
    console.error("worksheet_progressの移行中にエラーが発生しました:", error)
    return { success: false, message: `worksheet_progressの移行エラー: ${error}` }
  }
}

/**
 * worksheet_data_syncテーブルのデータを移行する関数
 */
async function migrateWorksheetDataSync(userId: string, anonymousId: string) {
  try {
    // 匿名IDに紐づくデータを検索
    const { data: existingData, error: fetchError } = await supabase
      .from("worksheet_data_sync")
      .select("*")
      .eq("anonymous_id", anonymousId)
      .order("updated_at", { ascending: false }) // 最新のデータから

    if (fetchError) {
      throw fetchError
    }

    if (!existingData || existingData.length === 0) {
      return { success: true, message: "worksheet_data_syncにデータなし" }
    }

    // 全てのレコードに対してuser_idを設定する更新を実行
    const updatePromises = existingData.map(async (record) => {
      const { error } = await supabase
        .from("worksheet_data_sync")
        .update({ user_id: userId })
        .eq("id", record.id)
      
      if (error) {
        console.error(`ID ${record.id}の更新中にエラーが発生しました:`, error)
        return false
      }
      return true
    })

    const results = await Promise.all(updatePromises)
    const allSuccessful = results.every(result => result === true)
    
    return { 
      success: allSuccessful, 
      message: `worksheet_data_syncの${existingData.length}件のデータを${allSuccessful ? '移行しました' : '一部移行できませんでした'}` 
    }
  } catch (error) {
    console.error("worksheet_data_syncの移行中にエラーが発生しました:", error)
    return { success: false, message: `worksheet_data_syncの移行エラー: ${error}` }
  }
}

/**
 * worksheet_analyticsテーブルのデータを移行する関数
 */
async function migrateWorksheetAnalytics(userId: string, anonymousId: string) {
  try {
    // 匿名IDに紐づくデータを検索
    const { data: existingData, error: fetchError } = await supabase
      .from("worksheet_analytics")
      .select("*")
      .eq("anonymous_id", anonymousId)
      .single()

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        // データが見つからない場合は成功を返す（スキップ）
        return { success: true, message: "worksheet_analyticsにデータなし" }
      }
      throw fetchError
    }

    if (!existingData) {
      return { success: true, message: "worksheet_analyticsにデータなし" }
    }

    // user_idを設定する更新を実行
    const { error: updateError } = await supabase
      .from("worksheet_analytics")
      .update({ user_id: userId })
      .eq("id", existingData.id)

    if (updateError) {
      throw updateError
    }

    return { success: true, message: "worksheet_analyticsのデータを移行しました" }
  } catch (error) {
    console.error("worksheet_analyticsの移行中にエラーが発生しました:", error)
    return { success: false, message: `worksheet_analyticsの移行エラー: ${error}` }
  }
}
