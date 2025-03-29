import { createClient } from "@supabase/supabase-js"
import { v4 as uuidv4 } from "uuid"

// 環境変数を直接参照
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://jktmwdmyhxkpirvrrczn.supabase.co"
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprdG13ZG15aHhrcGlydnJyY3puIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0OTg0NjUsImV4cCI6MjA1NzA3NDQ2NX0.LhUyJVwUTSgqVScKMS5poG-00MPS6bI2k0GEEfFs-lM"

// 環境変数のログ出力
console.log("Supabase初期化情報:", {
  url: supabaseUrl,
  keyExists: !!supabaseAnonKey,
  keyLength: supabaseAnonKey ? supabaseAnonKey.length : 0,
})

// Supabaseクライアントの作成（フォールバック値を使用）
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 匿名認証を行う関数
export const signInAnonymously = async () => {
  const { data, error } = await supabase.auth.signInAnonymously()

  if (error) {
    console.error("匿名認証エラー:", error.message)
    return null
  }

  return data
}

// 現在のセッションを取得する関数
export const getCurrentSession = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
}

// 認証状態をチェックし、必要に応じて再認証を行う関数
export const ensureAuthenticated = async () => {
  const session = await getCurrentSession()

  // セッションがない場合は匿名認証を行う
  if (!session) {
    return await signInAnonymously()
  }

  return session
}

// Supabaseクライアントを取得または作成する関数
export const getSupabaseClient = () => {
  // 常に直接作成したクライアントを返す
  return supabase
}

// 匿名IDを取得または作成する関数
export const getOrCreateAnonymousId = () => {
  try {
    // ローカルストレージから匿名IDを取得
    const storedId = localStorage.getItem("anonymousId")

    if (storedId) {
      return storedId
    }

    // 新しい匿名IDを作成
    const newId = uuidv4()
    localStorage.setItem("anonymousId", newId)
    return newId
  } catch (error) {
    console.error("Error getting or creating anonymous ID:", error)
    // エラーが発生した場合でも一時的なIDを返す
    return uuidv4()
  }
}

