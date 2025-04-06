"use client"

import type { WorksheetData } from "@/types/worksheet"
import { saveAndSyncWorksheetData } from "./worksheet-sync"
import { getAnonymousId, getOrCreateAnonymousId } from "./anonymous-id"
import { getCurrentUser } from "./auth"
import { supabase } from "./supabase"

const LOCAL_STORAGE_ONLY_KEY = "useLocalStorageOnly"
const CONSECUTIVE_FAILURES_KEY = "consecutiveFailures"

// ローカルストレージのみモードを設定する関数
export function setLocalStorageOnlyMode(value: boolean): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(LOCAL_STORAGE_ONLY_KEY, String(value))
    } catch (error) {
      console.error("ローカルストレージへの書き込み中にエラーが発生しました:", error)
    }
  }
}

// ローカルストレージのみモードかどうかを判定する関数
export function isLocalStorageOnlyMode(): boolean {
  if (typeof window === "undefined") return false
  try {
    return localStorage.getItem(LOCAL_STORAGE_ONLY_KEY) === "true"
  } catch (error) {
    console.error("ローカルストレージからの読み込み中にエラーが発生しました:", error)
    return false
  }
}

// 連続失敗回数を取得する関数
export function getConsecutiveFailures(): number {
  if (typeof window !== "undefined") {
    try {
      const failures = localStorage.getItem(CONSECUTIVE_FAILURES_KEY)
      return failures ? Number.parseInt(failures, 10) : 0
    } catch (error) {
      console.error("ローカルストレージからの読み込み中にエラーが発生しました:", error)
      return 0
    }
  }
  return 0
}

// 連続失敗回数を更新する関数
export function updateConsecutiveFailures(success: boolean): number {
  if (typeof window === "undefined") return 0

  let count = getConsecutiveFailures()

  if (success) {
    // 成功した場合はカウンターをリセット
    resetConsecutiveFailures()
    return 0
  } else {
    // 失敗した場合はカウンターを増加
    count += 1
    try {
      localStorage.setItem(CONSECUTIVE_FAILURES_KEY, String(count))
    } catch (error) {
      console.error("ローカルストレージへの書き込み中にエラーが発生しました:", error)
    }
    return count
  }
}

// 連続失敗回数をリセットする関数
export function resetConsecutiveFailures(): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(CONSECUTIVE_FAILURES_KEY)
    } catch (error) {
      console.error("ローカルストレージからの削除中にエラーが発生しました:", error)
    }
  }
}

// 認証状態を確認し、必要に応じて再認証を行う関数
export async function ensureAuthenticated(): Promise<{ isAuthenticated: boolean; userId?: string }> {
  try {
    console.log("ensureAuthenticated: 認証状態を確認します")
    
    // まずセッションを確認
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session && session.user) {
      console.log("ensureAuthenticated: 既存のセッションを検出しました", {
        userId: session.user.id,
        email: session.user.email,
        expiresAt: session.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : '不明'
      })
      return { isAuthenticated: true, userId: session.user.id }
    }
    
    console.log("ensureAuthenticated: セッションが見つかりませんでした。getCurrentUserを試みます")
    
    // セッションがない場合はユーザー情報を直接取得
    const user = await getCurrentUser()
    if (user) {
      console.log("ensureAuthenticated: ユーザー情報を取得しました", {
        userId: user.id,
        email: user.email
      })
      
      // getCurrentUser内でセッションリフレッシュを試みているので、
      // ここでは追加のリフレッシュは行わない
      
      return { isAuthenticated: true, userId: user.id }
    }
    
    // ローカルストレージのトークンを確認
    if (typeof window !== 'undefined') {
      try {
        const localToken = localStorage.getItem('supabase.auth.token')
        console.log("ensureAuthenticated: ローカルストレージのトークン状態:", localToken ? "存在します" : "存在しません")
        
        if (localToken) {
          console.log("ensureAuthenticated: ローカルストレージにトークンが存在するため、セッションリフレッシュを試みます")
          
          try {
            const { data, error } = await supabase.auth.refreshSession()
            
            if (error) {
              console.warn("ensureAuthenticated: セッションリフレッシュに失敗しました:", error.message)
            } else if (data.session && data.user) {
              console.log("ensureAuthenticated: セッションを正常にリフレッシュしました:", {
                userId: data.user.id,
                email: data.user.email
              })
              return { isAuthenticated: true, userId: data.user.id }
            }
          } catch (refreshError) {
            console.error("ensureAuthenticated: セッションリフレッシュ中にエラーが発生しました:", refreshError)
          }
        }
      } catch (storageError) {
        console.error("ensureAuthenticated: ローカルストレージへのアクセス中にエラーが発生しました:", storageError)
      }
    }
    
    console.log("ensureAuthenticated: 認証されていません")
    return { isAuthenticated: false }
  } catch (error) {
    console.error("認証状態の確認中にエラーが発生しました:", error)
    return { isAuthenticated: false }
  }
}

// ワークシートデータを保存する関数
export async function saveData(
  data: WorksheetData,
  currentStep: number,
): Promise<{ success: boolean; message?: string; switchedToLocalOnly?: boolean }> {
  // ローカルストレージに保存
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("worksheetData", JSON.stringify(data))
    } catch (error) {
      console.error("ローカルストレージへのデータ保存中にエラーが発生しました:", error)
    }
  }

  // 認証状態を確認
  const authStatus = await ensureAuthenticated()
  console.log("saveData: 認証状態", authStatus)

  // ローカルストレージのみモードの場合は同期をスキップ
  if (isLocalStorageOnlyMode()) {
    return {
      success: true,
      message: "ローカルストレージのみモードが有効です。データはローカルにのみ保存されました。",
      switchedToLocalOnly: true,
    }
  }

  try {
    // Supabaseにデータを同期（認証状態のユーザーIDを渡す）
    const result = await saveAndSyncWorksheetData(
      data, 
      currentStep,
      authStatus.isAuthenticated ? authStatus.userId : undefined
    )

    // 成功した場合は連続失敗カウンターをリセット
    if (result.success) {
      resetConsecutiveFailures()
      return { success: true, message: "データが正常に保存されました。" }
    }

    // 失敗した場合は連続失敗カウンターを更新
    const failureCount = updateConsecutiveFailures(false)

    // 連続失敗回数が3回以上の場合はローカルストレージのみモードに切り替え
    if (failureCount >= 3) {
      setLocalStorageOnlyMode(true)
      return {
        success: false,
        message: "接続問題が続いているため、ローカルストレージのみモードに切り替えました。",
        switchedToLocalOnly: true,
      }
    }

    return {
      success: false,
      message: result.message || "データの同期に失敗しました。データはローカルに保存されました。",
    }
  } catch (error: any) {
    console.error("データの保存中に予期しないエラーが発生しました:", error)

    // エラーが発生した場合も連続失敗カウンターを更新
    const failureCount = updateConsecutiveFailures(false)

    // 連続失敗回数が3回以上の場合はローカルストレージのみモードに切り替え
    if (failureCount >= 3) {
      setLocalStorageOnlyMode(true)
      return {
        success: false,
        message: "接続問題が続いているため、ローカルストレージのみモードに切り替えました。",
        switchedToLocalOnly: true,
      }
    }

    return {
      success: false,
      message: `データの同期中にエラーが発生しました: ${error.message}。データはローカルに保存されました。`,
    }
  }
}

// テスト接続関数
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  try {
    // Supabaseクライアントを取得
    const { getSupabaseClient } = await import("@/lib/supabase")
    const supabase = getSupabaseClient()

    if (!supabase) {
      return { success: false, message: "Supabaseクライアントの初期化に失敗しました。" }
    }

    // 簡単なクエリを実行してテスト
    const { data, error } = await supabase.from("worksheet_data_sync").select("count(*)", { count: "exact" }).limit(1)

    if (error) {
      return { success: false, message: `接続テスト中にエラーが発生しました: ${error.message}` }
    }

    return { success: true, message: "Supabaseへの接続テストに成功しました。" }
  } catch (error: any) {
    return { success: false, message: `接続テスト中に予期しないエラーが発生しました: ${error.message}` }
  }
}

// 以下の関数はlib/anonymous-id.tsに移動したため、エクスポートのみを行う
export { getAnonymousId, getOrCreateAnonymousId }
