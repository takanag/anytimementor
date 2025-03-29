"use client"

import { getSupabaseClient } from "@/lib/supabase"
import { getAnonymousId } from "@/lib/data"

// capability データの診断と修正を行う関数
export async function diagnoseCapabilityData() {
  try {
    const anonymousId = getAnonymousId()
    if (!anonymousId) {
      return {
        success: false,
        message: "匿名IDが見つかりません",
        data: null,
      }
    }

    const supabase = getSupabaseClient()

    // worksheet_data_syncテーブルからデータを取得
    const { data, error } = await supabase
      .from("worksheet_data_sync")
      .select("data, current_step, created_at, updated_at")
      .eq("anonymous_id", anonymousId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.error("Supabaseからのデータ取得エラー:", error)
      return {
        success: false,
        message: `データの読み込みに失敗しました: ${error.message}`,
        data: null,
      }
    }

    if (!data) {
      return {
        success: false,
        message: "データが見つかりません",
        data: null,
      }
    }

    // capability データの診断
    const capabilityData = data.data?.capability || null
    const diagnosis = {
      hasCapabilityData: !!capabilityData,
      dataType: typeof capabilityData,
      isObject: capabilityData !== null && typeof capabilityData === "object",
      keys: capabilityData ? Object.keys(capabilityData) : [],
      sampleValues: {},
    }

    // サンプル値を取得
    if (diagnosis.isObject && diagnosis.keys.length > 0) {
      for (const key of diagnosis.keys.slice(0, 5)) {
        // 最初の5つのキーのみ
        diagnosis.sampleValues[key] = capabilityData[key]
      }
    }

    return {
      success: true,
      message: "診断が完了しました",
      data: {
        rawData: data,
        diagnosis,
      },
    }
  } catch (err: any) {
    console.error("診断中のエラー:", err)
    return {
      success: false,
      message: `診断中にエラーが発生しました: ${err.message}`,
      data: null,
    }
  }
}

// capability データを修正する関数
export async function fixCapabilityData() {
  try {
    const anonymousId = getAnonymousId()
    if (!anonymousId) {
      return {
        success: false,
        message: "匿名IDが見つかりません",
      }
    }

    const supabase = getSupabaseClient()

    // worksheet_data_syncテーブルからデータを取得
    const { data, error } = await supabase
      .from("worksheet_data_sync")
      .select("data, id")
      .eq("anonymous_id", anonymousId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.error("Supabaseからのデータ取得エラー:", error)
      return {
        success: false,
        message: `データの読み込みに失敗しました: ${error.message}`,
      }
    }

    if (!data) {
      return {
        success: false,
        message: "データが見つかりません",
      }
    }

    // データのコピーを作成
    const updatedData = { ...data.data }

    // capability データが文字列の場合はパースする
    if (typeof updatedData.capability === "string") {
      try {
        updatedData.capability = JSON.parse(updatedData.capability)
        console.log("文字列からJSONにパースしました:", updatedData.capability)
      } catch (parseError) {
        console.error("JSONパースエラー:", parseError)
        return {
          success: false,
          message: `capability データのパースに失敗しました: ${parseError.message}`,
        }
      }
    }
    // capability データがない場合は空のオブジェクトを作成
    else if (!updatedData.capability) {
      updatedData.capability = {}
      console.log("capability データが見つからないため、空のオブジェクトを作成しました")
    }

    // データを更新
    const { error: updateError } = await supabase
      .from("worksheet_data_sync")
      .update({ data: updatedData })
      .eq("id", data.id)

    if (updateError) {
      console.error("データ更新エラー:", updateError)
      return {
        success: false,
        message: `データの更新に失敗しました: ${updateError.message}`,
      }
    }

    return {
      success: true,
      message: "capability データを修正しました",
    }
  } catch (err: any) {
    console.error("修正中のエラー:", err)
    return {
      success: false,
      message: `修正中にエラーが発生しました: ${err.message}`,
    }
  }
}

