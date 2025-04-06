"use client"

import type { WorksheetData } from "@/types/worksheet"
import { getSupabaseClient } from "@/lib/supabase"

// ローカルストレージからデータを取得する関数
export function getLocalSavedData(): WorksheetData | null {
  if (typeof window === "undefined") return null
  try {
    const data = localStorage.getItem("worksheetData")
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error("Failed to get data from localStorage:", error)
    return null
  }
}

// 匿名IDを取得する関数
export function getAnonymousId(): string | null {
  if (typeof window === "undefined") return null

  // ローカルストレージから匿名IDを取得
  let anonymousId = localStorage.getItem("anonymousId") || localStorage.getItem("anon_id")

  // 匿名IDが存在しない場合は新しいIDを生成
  if (!anonymousId) {
    // ランダムな文字列を生成（UUIDの簡易版）
    const randomId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    anonymousId = `anon_${randomId}`

    // 生成したIDをローカルストレージに保存
    localStorage.setItem("anonymousId", anonymousId)
    localStorage.setItem("anon_id", anonymousId) // 互換性のために両方に保存

    console.log("新しい匿名IDを生成しました:", anonymousId)
  } else {
    console.log("既存の匿名IDを使用します:", anonymousId)
  }

  return anonymousId
}

// saveProgressToSupabase関数を修正して、新しい同期機能を使用する
export async function saveProgressToSupabase(
  data: WorksheetData,
  currentStep: number,
): Promise<{ success: boolean; message?: string }> {
  try {
    // 匿名IDを取得
    const anonymousId = getAnonymousId()
    if (!anonymousId) {
      return { success: false, message: "匿名IDが見つかりません。" }
    }

    console.log("Supabaseにデータを保存します。匿名ID:", anonymousId)

    // Supabaseクライアントを取得
    const supabase = getSupabaseClient()
    if (!supabase) {
      return { success: false, message: "Supabaseクライアントの初期化に失敗しました。" }
    }

    // 単純なINSERTを使用してデータを保存
    // worksheet_data_syncテーブルに保存
    const { error: syncError } = await supabase.from("worksheet_data_sync").insert({
      anonymous_id: anonymousId,
      worksheet_id: "default",
      data: data,
      current_step: currentStep,
      completed: currentStep === 8,
      updated_at: new Date().toISOString(),
    })

    if (syncError) {
      console.error("worksheet_data_syncへの保存中にエラーが発生しました:", syncError)

      // 一意制約違反の場合はUPSERTを試みる
      if (syncError.code === "23505") {
        // 一意制約違反のエラーコード
        console.log("一意制約違反が検出されました。UPSERTを試みます。")

        // UPSERTを使用してデータを更新
        const { error: upsertError } = await supabase.from("worksheet_data_sync").upsert(
          {
            anonymous_id: anonymousId,
            worksheet_id: "default",
            data: data,
            current_step: currentStep,
            completed: currentStep === 8,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "anonymous_id,worksheet_id" },
        )

        if (upsertError) {
          console.error("UPSERTでのデータ更新中にエラーが発生しました:", upsertError)
          return { success: false, message: `UPSERTでのデータ更新中にエラーが発生しました: ${upsertError.message}` }
        }

        return { success: true, message: "データが正常に更新されました。" }
      }

      return { success: false, message: `データの保存中にエラーが発生しました: ${syncError.message}` }
    }

    // 古いテーブル（worksheet_progress）への保存を試みない
    console.log("データが正常に保存されました（worksheet_data_syncのみ）")
    return { success: true, message: "データが正常に保存されました。" }
  } catch (error: any) {
    console.error("Supabaseへの保存中に予期しないエラーが発生しました:", error)
    return { success: false, message: `Supabaseへの保存中に予期しないエラーが発生しました: ${error.message}` }
  }
}

// getProgressFromSupabase関数を修正して、新しい同期機能を使用する
export async function getProgressFromSupabase(): Promise<{
  data: WorksheetData | null
  currentStep: number
  error?: string
}> {
  try {
    // 匿名IDを取得
    const anonymousId = getAnonymousId()
    if (!anonymousId) {
      return {
        data: null,
        currentStep: 0,
        error: "匿名IDが見つかりません。",
      }
    }

    // Supabaseクライアントを取得
    const supabase = getSupabaseClient()
    if (!supabase) {
      return {
        data: null,
        currentStep: 0,
        error: "Supabaseクライアントの初期化に失敗しました。",
      }
    }

    // 最新のデータを取得
    const { data, error } = await supabase
      .from("latest_worksheet_data")
      .select("*")
      .eq("anonymous_id", anonymousId)
      .eq("worksheet_id", "default")
      .maybeSingle()

    if (error) {
      console.error("データの取得中にエラーが発生しました:", error)
      return {
        data: null,
        currentStep: 0,
        error: `データの取得中にエラーが発生しました: ${error.message}`,
      }
    }

    // データが見つからない場合
    if (!data) {
      return { data: null, currentStep: 0 }
    }

    return {
      data: data.data,
      currentStep: data.current_step || 0,
    }
  } catch (error: any) {
    console.error("Supabaseからのデータ取得中に予期しないエラーが発生しました:", error)
    return {
      data: null,
      currentStep: 0,
      error: `データ取得中に予期しないエラーが発生しました: ${error.message}`,
    }
  }
}

