"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { Session, User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import * as authUtils from "@/lib/auth"

// 認証コンテキストの型定義
interface AuthContextType {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string) => Promise<any>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<any>
}

// デフォルト値を持つコンテキストを作成
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  signIn: async () => null,
  signUp: async () => null,
  signOut: async () => {},
  resetPassword: async () => {},
  updatePassword: async () => null,
})

// 認証プロバイダーコンポーネント
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // ユーザーセッションの初期化と監視
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true)
      
      try {
        // 現在のセッションを取得
        const currentSession = await authUtils.getCurrentSession()
        
        if (currentSession) {
          setSession(currentSession)
          setUser(currentSession.user)
          console.log("AuthProvider: セッションからユーザー情報を設定しました:", {
            id: currentSession.user.id,
            email: currentSession.user.email,
            isAuthenticated: true
          })
        } else {
          // セッションがない場合はユーザー情報を直接取得
          const currentUser = await authUtils.getCurrentUser()
          if (currentUser) {
            setUser(currentUser)
            console.log("AuthProvider: getCurrentUserからユーザー情報を設定しました:", {
              id: currentUser.id,
              email: currentUser.email,
              isAuthenticated: true
            })
          } else {
            console.log("AuthProvider: 認証されていません")
          }
        }
      } catch (error) {
        console.error("認証初期化エラー:", error)
      } finally {
        setIsLoading(false)
      }
    }

    // 初期認証状態をロード
    initializeAuth()

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string, newSession: Session | null) => {
      console.log("認証状態変更:", event, {
        session: newSession ? {
          userId: newSession.user.id,
          email: newSession.user.email,
          isAuthenticated: true
        } : null
      })
      
      setSession(newSession)
      setUser(newSession?.user ?? null)
      
      // 認証状態変更時にルート更新をトリガー
      router.refresh()
    })

    // クリーンアップ関数
    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  // 認証関連の機能を実装
  const value = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user || !!session, // ユーザーまたはセッションがある場合に認証済みとみなす
    signIn: async (email: string, password: string) => {
      return await authUtils.signIn(email, password)
    },
    signUp: async (email: string, password: string) => {
      return await authUtils.signUp(email, password)
    },
    signOut: async () => {
      await authUtils.signOut()
      setUser(null)
      setSession(null)
      router.push("/")
    },
    resetPassword: async (email: string) => {
      await authUtils.resetPassword(email)
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
