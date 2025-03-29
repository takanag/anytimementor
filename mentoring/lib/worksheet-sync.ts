"use client"

import type { WorksheetData } from "@/types/worksheet"
import { getSupabaseClient } from "@/lib/supabase"

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

// ワークシートデータを保存・同期する関数
export async function saveAndSyncWorksheetData(
  data: WorksheetData,
  currentStep: number,
): Promise<{ success: boolean; message?: string }> {
  try {
    // 匿名IDを取得
    const anonymousId = getAnonymousId()
    if (!anonymousId) {
      return { success: false, message: "匿名IDが見つかりません。" }
    }

    console.log("新しいsaveAndSyncWorksheetData関数が呼び出されました。匿名ID:", anonymousId)

    // Supabaseクライアントを取得
    const supabase = getSupabaseClient()
    if (!supabase) {
      return { success: false, message: "Supabaseクライアントの初期化に失敗しました。" }
    }

    // worksheet_data_syncテーブルにデータを保存
    const { error } = await supabase.from("worksheet_data_sync").upsert(
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

    if (error) {
      console.error("データの保存中にエラーが発生しました:", error)
      return { success: false, message: `データの保存中にエラーが発生しました: ${error.message}` }
    }

    return { success: true, message: "データが正常に保存されました。" }
  } catch (error: any) {
    console.error("データの保存中に予期しないエラーが発生しました:", error)
    return { success: false, message: `データの保存中に予期しないエラーが発生しました: ${error.message}` }
  }
}

// 最新のワークシートデータを取得する関数
export async function getLatestWorksheetData(): Promise<{
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
    console.error("データの取得中に予期しないエラーが発生しました:", error)
    return {
      data: null,
      currentStep: 0,
      error: `データの取得中に予期しないエラーが発生しました: ${error.message}`,
    }
  }
}

// ローカルストレージからワークシートデータを取得する関数
export function getLocalWorksheetData(): WorksheetData | null {
  if (typeof window === "undefined") return null
  try {
    const data = localStorage.getItem("worksheetData")
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error("ローカルストレージからのデータ取得に失敗しました:", error)
    return null
  }
}

