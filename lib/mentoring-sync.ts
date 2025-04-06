"use client"

import { getSupabaseClient } from "@/lib/supabase"
import type { WeeklyMentoringData } from "@/types/mentoring"
import { supabase, ensureAuthenticated } from "./supabase"

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

// セッションIDを生成する関数
export function generateSessionId(): string {
  const timestamp = new Date().getTime()
  const random = Math.random().toString(36).substring(2, 10)
  return `session_${timestamp}_${random}`
}

// メンタリングデータを保存する関数
export async function saveMentoringData(
  data: WeeklyMentoringData,
): Promise<{ success: boolean; message?: string; session_id?: string }> {
  try {
    // 匿名IDを取得
    const anonymousId = getAnonymousId()
    if (!anonymousId) {
      return { success: false, message: "匿名IDが見つかりません。" }
    }

    console.log("メンタリングデータを保存します。匿名ID:", anonymousId)

    // Supabaseクライアントを取得
    const supabase = getSupabaseClient()
    if (!supabase) {
      return { success: false, message: "Supabaseクライアントの初期化に失敗しました。" }
    }

    // セッションIDを生成
    const sessionId = generateSessionId()

    // 現在の日時
    const now = new Date().toISOString()

    // データを保存
    const { error } = await supabase.from("mentoring_data_sync").insert({
      anonymous_id: anonymousId,
      session_id: sessionId,
      data: data,
      created_at: now,
      updated_at: now,
    })

    if (error) {
      console.error("データの保存中にエラーが発生しました:", error)
      return { success: false, message: `データの保存中にエラーが発生しました: ${error.message}` }
    }

    return { success: true, message: "データが正常に保存されました。", session_id: sessionId }
  } catch (error: any) {
    console.error("予期しないエラーが発生しました:", error)
    return { success: false, message: `予期しないエラーが発生しました: ${error.message}` }
  }
}

// スキップ情報を保存する関数
export async function saveSkipData(
  skipReason?: string,
): Promise<{ success: boolean; message?: string; session_id?: string }> {
  try {
    // 現在の日時
    const now = new Date().toISOString()

    // スキップデータを作成
    const skipData: WeeklyMentoringData = {
      status: "skipped",
      skip_reason: skipReason,
      created_at: now,
      updated_at: now,
    }

    // データを保存
    return await saveMentoringData(skipData)
  } catch (error: any) {
    console.error("スキップデータの保存中にエラーが発生しました:", error)
    return { success: false, message: `スキップデータの保存中にエラーが発生しました: ${error.message}` }
  }
}

// 最新のメンタリングデータを取得する関数
export async function getLatestMentoringData(): Promise<{
  data: WeeklyMentoringData | null
  session_id?: string
  error?: string
}> {
  try {
    // 匿名IDを取得
    const anonymousId = getAnonymousId()
    if (!anonymousId) {
      return {
        data: null,
        error: "匿名IDが見つかりません。",
      }
    }

    // Supabaseクライアントを取得
    const supabase = getSupabaseClient()
    if (!supabase) {
      return {
        data: null,
        error: "Supabaseクライアントの初期化に失敗しました。",
      }
    }

    // 最新のデータを取得
    const { data, error } = await supabase
      .from("mentoring_data_sync")
      .select("*")
      .eq("anonymous_id", anonymousId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (error) {
      // データが見つからない場合はエラーとしない
      if (error.code === "PGRST116") {
        return { data: null }
      }

      console.error("データの取得中にエラーが発生しました:", error)
      return {
        data: null,
        error: `データの取得中にエラーが発生しました: ${error.message}`,
      }
    }

    // データが見つからない場合
    if (!data) {
      return { data: null }
    }

    return {
      data: data.data,
      session_id: data.session_id,
    }
  } catch (error: any) {
    console.error("予期しないエラーが発生しました:", error)
    return {
      data: null,
      error: `予期しないエラーが発生しました: ${error.message}`,
    }
  }
}

// 内発的動機データを取得する関数
export async function getInternalMotivationData(): Promise<string | null> {
  try {
    // 匿名IDを取得
    const anonymousId = getAnonymousId()
    if (!anonymousId) {
      console.log("匿名IDが見つかりません。")
      return null
    }

    // Supabaseクライアントを取得
    const supabase = getSupabaseClient()
    if (!supabase) {
      console.log("Supabaseクライアントの初期化に失敗しました。")
      return null
    }

    // テーブルが存在するか確認
    try {
      // worksheet_analyticsテーブルからデータを取得
      const { data, error } = await supabase
        .from("worksheet_analytics")
        .select("internal_motivation_admired_traits")
        .eq("anonymous_id", anonymousId)
        .maybeSingle()

      if (error) {
        console.log("内発的動機データの取得中にエラーが発生しました:", error)
        return null
      }

      return data?.internal_motivation_admired_traits || null
    } catch (error) {
      console.log("内発的動機データの取得中に例外が発生しました:", error)
      return null
    }
  } catch (error) {
    console.log("内発的動機データの取得中に予期しないエラーが発生しました:", error)
    return null
  }
}

// バリューステートメントを取得する関数
export async function getValueStatement(): Promise<string | null> {
  try {
    // 匿名IDを取得
    const anonymousId = getAnonymousId()
    if (!anonymousId) {
      console.log("匿名IDが見つかりません。")
      return null
    }

    // Supabaseクライアントを取得
    const supabase = getSupabaseClient()
    if (!supabase) {
      console.log("Supabaseクライアントの初期化に失敗しました。")
      return null
    }

    // テーブルが存在するか確認
    try {
      // worksheet_analyticsテーブルからデータを取得
      const { data, error } = await supabase
        .from("worksheet_analytics")
        .select("value_articulation_value_statement")
        .eq("anonymous_id", anonymousId)
        .maybeSingle()

      if (error) {
        console.log("バリューステートメントの取得中にエラーが発生しました:", error)
        return null
      }

      return data?.value_articulation_value_statement || null
    } catch (error) {
      console.log("バリューステートメントの取得中に例外が発生しました:", error)
      return null
    }
  } catch (error) {
    console.log("バリューステートメントの取得中に予期しないエラーが発生しました:", error)
    return null
  }
}

// ワークシートの進捗を追加する関数（更新ではなく常に新規追加）
export const addWorksheetProgress = async (data: any) => {
  try {
    // 認証状態を確認・更新
    await ensureAuthenticated()

    // 匿名IDを取得
    const anonymousId = getAnonymousId()
    if (!anonymousId) {
      throw new Error("匿名IDが見つかりません。")
    }

    // 現在の日時
    const now = new Date().toISOString()

    // データに必要な情報を追加
    const completeData = {
      ...data,
      anonymous_id: anonymousId,
      created_at: now,
      updated_at: now,
    }

    // 新しいレコードとして挿入（テーブル名を変更）
    const { error } = await supabase.from("worksheet_data_sync").insert(completeData)

    if (error) {
      console.error("ワークシート進捗の追加エラー:", error.message)
      throw error
    }

    return true
  } catch (error) {
    console.error("ワークシート進捗の追加中にエラーが発生しました:", error)
    throw error
  }
}

// 後方互換性のために元の関数名も残しておく（内部では新しい関数を呼び出す）
export const updateWorksheetProgress = async (id: number, data: any) => {
  console.warn("updateWorksheetProgress は非推奨です。代わりに addWorksheetProgress を使用してください。")

  // IDを含めてデータを新規追加
  return addWorksheetProgress({
    ...data,
    original_id: id, // 元のIDを参照として保存
  })
}

