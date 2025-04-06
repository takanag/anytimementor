import { supabase } from "./supabase"
import type { User, Session } from "@supabase/supabase-js"

// ログイン関数
export async function signIn(email: string, password: string) {
  console.log("signIn関数が呼び出されました:", { email })
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error("ログイン中にエラーが発生しました:", error)
    throw error
  }
  
  console.log("ログイン成功:", {
    session: data.session ? {
      userId: data.session.user.id,
      expiresAt: data.session.expires_at ? new Date(data.session.expires_at * 1000).toLocaleString() : '不明'
    } : null,
    user: data.user ? {
      id: data.user.id,
      email: data.user.email
    } : null
  })
  
  // セッションが正しく設定されたか確認
  try {
    // セッションが確実に設定されるように少し待機
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const {
      data: { session },
    } = await supabase.auth.getSession()
    
    if (session) {
      console.log("signIn: セッションが正常に設定されました:", {
        userId: session.user.id,
        email: session.user.email,
        expiresAt: session.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : '不明'
      })
    } else {
      console.warn("signIn: ログイン成功後もセッションが取得できません")
      
      // セッションが取得できない場合は、再度ログインを試みる
      try {
        console.log("signIn: セッションが取得できないため、再度ログインを試みます")
        const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        
        if (retryError) {
          console.error("再ログイン中にエラーが発生しました:", retryError)
        } else {
          console.log("再ログイン成功:", {
            session: retryData.session ? {
              userId: retryData.session.user.id,
              expiresAt: retryData.session.expires_at ? new Date(retryData.session.expires_at * 1000).toLocaleString() : '不明'
            } : null
          })
        }
      } catch (retryError) {
        console.error("再ログイン中に例外が発生しました:", retryError)
      }
    }
  } catch (sessionError) {
    console.error("セッション確認中にエラーが発生しました:", sessionError)
  }
  
  return data
}

// サインアップ関数
export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) throw error
  return data
}

// ログアウト関数
export async function signOut() {
  const { error } = await supabase.auth.signOut({
    scope: 'local' // ローカルストレージのセッションのみをクリア
  })
  if (error) throw error
  
  // ログアウト後にセッションがクリアされたことを確認するためのログ
  console.log("ログアウト完了: セッションをクリアしました")
}

// パスワードリセットメール送信関数
export async function resetPassword(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/update-password`,
  })

  if (error) throw error
  return data
}

// パスワード更新関数
export async function updatePassword(password: string) {
  const { data, error } = await supabase.auth.updateUser({
    password,
  })

  if (error) throw error
  return data
}

// 現在のセッションを取得する関数
export async function getCurrentSession(): Promise<Session | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
}

// 現在のユーザーを取得する関数
export async function getCurrentUser(): Promise<User | null> {
  try {
    // まずセッションを取得
    const {
      data: { session },
    } = await supabase.auth.getSession()
    
    // セッションがある場合はそのユーザーを返す
    if (session && session.user) {
      console.log("getCurrentUser: セッションからユーザー情報を取得しました:", {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role,
        isAuthenticated: true
      })
      return session.user
    }
    
    // セッションがない場合はgetUserを試す
    const {
      data: { user },
    } = await supabase.auth.getUser()
    
    // ユーザーが取得できた場合
    if (user) {
      console.log("getCurrentUser: getUser結果:", {
        id: user.id,
        email: user.email,
        role: user.role,
        isAuthenticated: true
      })
      
      // セッションが取得できなかったがユーザーが取得できた場合、
      // セッションを更新するためにセッションリフレッシュを試みる
      try {
        console.log("getCurrentUser: セッションリフレッシュを試みます")
        const { data, error } = await supabase.auth.refreshSession()
        
        if (error) {
          console.warn("セッションリフレッシュに失敗しました:", error.message)
          
          // リフレッシュに失敗した場合、ローカルストレージのトークンを確認
          // クライアントサイドでのみ実行
          if (typeof window !== 'undefined') {
            try {
              const localToken = localStorage.getItem('supabase.auth.token')
              console.log("ローカルストレージのトークン状態:", localToken ? "存在します" : "存在しません")
              
              if (!localToken) {
                console.log("ローカルストレージにトークンが存在しないため、認証状態をクリアします")
                return null
              }
            } catch (storageError) {
              console.error("ローカルストレージへのアクセス中にエラーが発生しました:", storageError)
              return null
            }
          }
        } else {
          console.log("セッションを正常にリフレッシュしました:", {
            session: data.session ? {
              userId: data.session.user.id,
              expiresAt: data.session.expires_at ? new Date(data.session.expires_at * 1000).toLocaleString() : '不明'
            } : null
          })
          
          // リフレッシュ後のセッションが存在する場合はそのユーザーを返す
          if (data.session) {
            return data.session.user
          }
        }
      } catch (refreshError) {
        console.error("セッションリフレッシュ中にエラーが発生しました:", refreshError)
      }
      
      return user
    }
    
    // ユーザーが取得できなかった場合
    console.log("getCurrentUser: getUser結果: 未認証")
    return null
  } catch (error) {
    console.error("getCurrentUser: ユーザー情報取得中にエラーが発生しました:", error)
    return null
  }
}
