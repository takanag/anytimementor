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
// persistSessionをtrueに設定して、セッションをクッキーに保存
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'supabase.auth.token', // 明示的にストレージキーを設定
    flowType: 'implicit', // 認証フローの種類を明示的に設定
    storage: {
      getItem: (key) => {
        if (typeof document !== 'undefined') {
          // クライアント側ではクッキーから取得
          const cookies = document.cookie.split(';').map(cookie => cookie.trim());
          const cookie = cookies.find(cookie => cookie.startsWith(`${key}=`));
          if (cookie) {
            return cookie.split('=')[1];
          }
        }
        return null;
      },
      setItem: (key, value) => {
        if (typeof document !== 'undefined') {
          // クライアント側ではクッキーに保存（HTTPOnly: falseでJSからアクセス可能に）
          document.cookie = `${key}=${value}; path=/; max-age=2592000; SameSite=Lax`;
        }
      },
      removeItem: (key) => {
        if (typeof document !== 'undefined') {
          // クライアント側ではクッキーを削除
          document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        }
      }
    }
  },
  global: {
    headers: {
      'X-Client-Info': 'anytimementor-v3',
    },
  },
})

// クライアントサイドでのみセッションの変更を監視
if (typeof window !== 'undefined') {
  supabase.auth.onAuthStateChange((event, session) => {
    console.log("認証状態変更イベント:", event, {
      session: session ? {
        userId: session.user.id,
        email: session.user.email,
        expiresAt: session.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : '不明'
      } : null
    })
  })
}

// 初期化時にセッションを確認
supabase.auth.getSession().then(({ data: { session } }) => {
  if (session) {
    console.log("Supabase初期化: 既存のセッションを検出しました", {
      userId: session.user.id,
      email: session.user.email,
      expiresAt: session.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : '不明'
    });
  } else {
    console.log("Supabase初期化: 既存のセッションはありません");
  }
}).catch(err => {
  console.error("Supabase初期化: セッション取得エラー", err);
});

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
  // 認証状態をログ出力（デバッグ用）
  supabase.auth.getSession().then(({ data: { session } }) => {
    console.log("getSupabaseClient: 現在のセッション状態:", session ? {
      userId: session.user.id,
      isAuthenticated: true,
      expiresAt: session.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : '不明'
    } : "未認証");
  }).catch(err => {
    console.error("セッション取得エラー:", err);
  });
  
  // 常に直接作成したクライアントを返す
  return supabase
}

// 匿名IDを取得または作成する関数
export const getOrCreateAnonymousId = () => {
  // サーバーサイドの場合は一時的なIDを返す
  if (typeof window === 'undefined') {
    return uuidv4()
  }
  
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
