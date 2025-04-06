import { supabase } from "./supabase"
import { debugDataLoading } from "./debug-data-loading"

/**
 * ステップ7のアセスメントデータの読み込み問題を修正する関数
 */
export async function fixCapabilityDataLoading(anonymousId: string) {
  try {
    console.log("ステップ7データ修正を開始:", anonymousId)

    // worksheet_data_syncテーブルからデータを取得
    const { data: syncData, error: syncError } = await supabase
      .from("worksheet_data_sync")
      .select("*")
      .eq("anonymous_id", anonymousId)
      .single()

    if (syncError) {
      console.error("worksheet_data_syncからのデータ取得エラー:", syncError)
      return { success: false, message: syncError.message }
    }

    // worksheet_analyticsテーブルからデータを取得
    const { data: analyticsData, error: analyticsError } = await supabase
      .from("worksheet_analytics")
      .select("*")
      .eq("anonymous_id", anonymousId)
      .single()

    if (analyticsError && analyticsError.code !== "PGRST116") {
      // PGRST116はデータが見つからないエラー
      console.error("worksheet_analyticsからのデータ取得エラー:", analyticsError)
      return { success: false, message: analyticsError.message }
    }

    // データをデバッグ出力
    debugDataLoading(syncData, "worksheet_data_sync")
    if (analyticsData) {
      debugDataLoading(analyticsData, "worksheet_analytics")
    }

    // データの修正が必要かチェック
    let needsFix = false
    let fixedData = null

    if (syncData?.data?.capability) {
      // syncDataのcapabilityが存在する場合
      console.log("syncDataにcapabilityが存在します")

      // データ型を確認
      const capabilityType = typeof syncData.data.capability
      console.log("capability データ型:", capabilityType)

      if (capabilityType === "string") {
        try {
          // 文字列の場合はJSONとして解析を試みる
          const parsed = JSON.parse(syncData.data.capability)
          console.log("文字列からJSONに解析:", parsed)

          // 解析に成功したら修正が必要
          needsFix = true
          fixedData = {
            ...syncData.data,
            capability: parsed, // 文字列からオブジェクトに変換
          }
        } catch (error) {
          console.error("JSON解析エラー:", error)
        }
      }
    }

    // 修正が必要な場合はデータを更新
    if (needsFix && fixedData) {
      console.log("データ修正を実行します:", fixedData)

      const { error: updateError } = await supabase
        .from("worksheet_data_sync")
        .update({ data: fixedData })
        .eq("anonymous_id", anonymousId)

      if (updateError) {
        console.error("データ更新エラー:", updateError)
        return { success: false, message: updateError.message }
      }

      return {
        success: true,
        message: "ステップ7のデータを修正しました。ページを再読み込みしてください。",
        fixed: true,
      }
    }

    return {
      success: true,
      message: "修正は必要ありませんでした。",
      fixed: false,
    }
  } catch (error: any) {
    console.error("データ修正中のエラー:", error)
    return { success: false, message: error.message }
  }
}

/**
 * ステップ7のアセスメントデータを診断する関数
 */
export async function diagnoseCapabilityData(anonymousId: string) {
  try {
    // ローカルストレージからデータを取得
    const localData = localStorage.getItem(`worksheet_data_${anonymousId}`)
    let parsedLocalData = null

    if (localData) {
      try {
        parsedLocalData = JSON.parse(localData)
        console.log("ローカルストレージのデータ:")
        debugDataLoading(parsedLocalData, "localStorage")
      } catch (error) {
        console.error("ローカルストレージのデータ解析エラー:", error)
      }
    }

    // データベースからデータを取得
    const { data: dbData, error: dbError } = await supabase
      .from("worksheet_data_sync")
      .select("*")
      .eq("anonymous_id", anonymousId)
      .single()

    if (dbError) {
      console.error("データベースからのデータ取得エラー:", dbError)
      return {
        success: false,
        message: dbError.message,
        localData: parsedLocalData,
        dbData: null,
      }
    }

    console.log("データベースのデータ:")
    debugDataLoading(dbData, "database")

    return {
      success: true,
      localData: parsedLocalData,
      dbData: dbData,
      diagnosis: {
        hasLocalData: !!parsedLocalData,
        hasDbData: !!dbData,
        hasLocalCapability: !!parsedLocalData?.capability,
        hasDbCapability: !!dbData?.data?.capability,
        localCapabilityType: parsedLocalData?.capability ? typeof parsedLocalData.capability : null,
        dbCapabilityType: dbData?.data?.capability ? typeof dbData.data.capability : null,
        isStringified: typeof dbData?.data?.capability === "string" && dbData.data.capability.startsWith("{"),
      },
    }
  } catch (error: any) {
    console.error("診断中のエラー:", error)
    return { success: false, message: error.message }
  }
}

