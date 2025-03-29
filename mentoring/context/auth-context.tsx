"use client"

import { createContext, useContext, type ReactNode } from "react"

// 認証コンテキストの型定義
interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  user: null
  signIn: () => Promise<void>
  signOut: () => Promise<void>
  signUp: () => Promise<void>
}

// デフォルト値を持つコンテキストを作成
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: false,
  user: null,
  signIn: async () => {},
  signOut: async () => {},
  signUp: async () => {},
})

// 認証プロバイダーコンポーネント
export function AuthProvider({ children }: { children: ReactNode }) {
  // 認証なしモードのため、すべての値をデフォルト値に設定
  const value = {
    isAuthenticated: false,
    isLoading: false,
    user: null,
    signIn: async () => {
      console.log("認証機能は無効化されています")
    },
    signOut: async () => {
      console.log("認証機能は無効化されています")
    },
    signUp: async () => {
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

