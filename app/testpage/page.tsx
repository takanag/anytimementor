"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import ProtectedRoute from "@/components/protected-route"
import { supabase } from "@/lib/supabase"

export default function TestPage() {
  const { user, session, isAuthenticated, isLoading, signOut } = useAuth()
  const [userName, setUserName] = useState<string>("ゲスト")
  const [sessionInfo, setSessionInfo] = useState<any>(null)

  useEffect(() => {
    console.log("TestPage: ページがロードされました", {
      url: window.location.href,
      time: new Date().toISOString(),
      isAuthenticated,
      user: user ? { id: user.id, email: user.email } : null
    })

    const checkAuth = async () => {
      try {
        // セッション情報を取得（デバッグ用）
        const { data } = await supabase.auth.getSession()
        
        const sessionDetails = {
          hasSession: !!data.session,
          userId: data.session?.user?.id,
          email: data.session?.user?.email,
          expiresAt: data.session?.expires_at ? new Date(data.session.expires_at * 1000).toLocaleString() : '不明',
          currentTime: new Date().toLocaleString()
        }
        
        console.log("TestPage: セッション情報", sessionDetails)
        setSessionInfo(sessionDetails)
        
        // ユーザー名を設定（メールアドレスの@前の部分）
        if (user?.email) {
          const email = user.email
          const name = email.split("@")[0] || "ユーザー"
          setUserName(name)
        }
      } catch (error) {
        console.error("TestPage: 認証チェックエラー", error)
      }
    }

    checkAuth()
  }, [user]) // userが変更されたときに実行

  const handleSignOut = async () => {
    try {
      await signOut()
      console.log("ログアウトしました")
      setUserName("ゲスト")
      // ページをリロード
      window.location.reload()
    } catch (error) {
      console.error("ログアウト中にエラーが発生しました:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">読み込み中...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold mb-6">テストページ</h1>
          
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">認証状態</h2>
            <p className="mb-2">
              <span className="font-medium">ステータス:</span> 
              {isAuthenticated ? (
                <span className="text-green-600 font-bold ml-2">認証済み</span>
              ) : (
                <span className="text-red-600 font-bold ml-2">未認証</span>
              )}
            </p>
            {isAuthenticated && (
              <p className="mb-2">
                <span className="font-medium">ユーザー名:</span> 
                <span className="ml-2">{userName}</span>
              </p>
            )}
            
            {sessionInfo && (
              <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
                <h3 className="font-semibold mb-2">セッション詳細:</h3>
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(sessionInfo, null, 2)}
                </pre>
              </div>
            )}
            
            {isAuthenticated && (
              <button 
                onClick={handleSignOut}
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                ログアウト
              </button>
            )}
          </div>

          <div className="flex space-x-4">
            <Link href="/login" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              ログインページへ
            </Link>
            <Link href="/mypage" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
              マイページへ
            </Link>
            <Link href="/" className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
              トップページへ
            </Link>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
