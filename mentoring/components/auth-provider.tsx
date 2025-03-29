"use client"

import { createContext, useContext, type ReactNode } from "react"

// ダミーの認証コンテキスト
interface AuthContextType {
  user: null
  session: null
  isLoading: boolean
  isAuthenticated: boolean
  signIn: () => Promise<void>
  signUp: () => Promise<void>
  signOut: () => Promise<void>
  resetPassword: () => Promise<void>
}

// デフォルト値を持つコンテキストを作成
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: false,
  isAuthenticated: false,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
})

// 認証プロバイダーコンポーネント
export function AuthProvider({ children }: { children: ReactNode }) {
  // 認証なしモードのため、すべての値をデフォルト値に設定
  const value = {
    user: null,
    session: null,
    isLoading: false,
    isAuthenticated: false,
    signIn: async () => {
      console.log("認証機能は無効化されています")
    },
    signUp: async () => {
      console.log("認証機能は無効化されています")
    },
    signOut: async () => {
      console.log("認証機能は無効化されています")
    },
    resetPassword: async () => {
      console.log("認証機能は無効化されています")
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

