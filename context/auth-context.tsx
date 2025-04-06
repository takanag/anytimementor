"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { type User } from "@supabase/supabase-js"
import * as authUtils from "@/lib/auth"
import { supabase } from "@/lib/supabase"

// 認証コンテキストの型定義
interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  user: User | null
  signIn: (email: string, password: string) => Promise<any>
  signOut: () => Promise<void>
  signUp: (email: string, password: string) => Promise<any>
  resetPassword: (email: string) => Promise<any>
  updatePassword: (password: string) => Promise<any>
}

// デフォルト値を持つコンテキストを作成
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  signIn: async () => null,
  signOut: async () => {},
  signUp: async () => null,
  resetPassword: async () => null,
  updatePassword: async () => null,
})

// 認証プロバイダーコンポーネント
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 初期化時にユーザーセッションを取得
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // 現在のユーザーを取得
        const currentUser = await authUtils.getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error("認証初期化エラー:", error)
      } finally {
        setIsLoading(false)
      }
    }

    // 初期認証状態をロード
    initializeAuth()

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
      }
    )

    // クリーンアップ関数
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // 認証機能を実装
  const value = {
    isAuthenticated: !!user,
    isLoading,
    user,
    signIn: async (email: string, password: string) => {
      return await authUtils.signIn(email, password)
    },
    signOut: async () => {
      await authUtils.signOut()
      setUser(null)
    },
    signUp: async (email: string, password: string) => {
      return await authUtils.signUp(email, password)
    },
    resetPassword: async (email: string) => {
      return await authUtils.resetPassword(email)
    },
    updatePassword: async (password: string) => {
      return await authUtils.updatePassword(password)
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// 認証コンテキストを使用するためのフック
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
