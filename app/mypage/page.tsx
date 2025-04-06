"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import ProtectedRoute from "@/components/protected-route"

export default function MyPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [userName, setUserName] = useState<string>("ユーザー")

  useEffect(() => {
    console.log("MyPage: ページがロードされました", {
      url: window.location.href,
      time: new Date().toISOString(),
      isAuthenticated,
      user: user ? { id: user.id, email: user.email } : null
    })

    // ユーザー名を設定（メールアドレスの@前の部分）
    if (user?.email) {
      const email = user.email
      const name = email.split("@")[0] || "ユーザー"
      setUserName(name)
    }
  }, [user, isAuthenticated]) // userとisAuthenticatedが変更されたときに実行

  // ProtectedRouteコンポーネントを使用して認証状態を管理
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#f5f5eb]">
        <header className="bg-white p-4 shadow-sm">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">やさしいメンタリング マイページ</h1>
            <div className="flex items-center">
              <img 
                src="/placeholder-logo.png" 
                alt="Any Time Mentor" 
                className="h-12"
              />
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto p-6">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">ようこそ、{userName}さん</h2>
            <p className="text-gray-700">あなたの自律的なキャリア形成と成長をサポートするツールにアクセスできます。</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* やさしいキャリアデザイン */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-start mb-4">
                <div className="bg-[#f5f5eb] p-2 rounded-md mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">やさしいキャリアデザイン</h3>
                  <p className="text-gray-600 mt-2">内発的動機の発見を通した自律的キャリアを達成するための目標設定</p>
                </div>
              </div>
              <Link href="/worksheet">
                <button className="bg-[#d1c9a6] hover:bg-[#c2b990] text-black font-medium py-2 px-4 rounded">
                  アクセスする
                </button>
              </Link>
            </div>

            {/* やさしいメンタリング */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-start mb-4">
                <div className="bg-[#f5f5eb] p-2 rounded-md mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">やさしいメンタリング</h3>
                  <p className="text-gray-600 mt-2">目標を実現するための週次でのふりかえり</p>
                </div>
              </div>
              <Link href="/roadmap">
                <button className="bg-[#d1c9a6] hover:bg-[#c2b990] text-black font-medium py-2 px-4 rounded">
                  アクセスする
                </button>
              </Link>
            </div>

            {/* 社内タレントマーケットプレイス */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-start mb-4">
                <div className="bg-[#f5f5eb] p-2 rounded-md mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">社内タレントマーケットプレイス</h3>
                  <p className="text-gray-600 mt-2">目標達成に必要な経験とスキルを習得できる業務・プロジェクト</p>
                </div>
              </div>
              <Link href="/marketplace">
                <button className="bg-[#d1c9a6] hover:bg-[#c2b990] text-black font-medium py-2 px-4 rounded">
                  アクセスする
                </button>
              </Link>
            </div>

            {/* メンタリングダッシュボード */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-start mb-4">
                <div className="bg-[#f5f5eb] p-2 rounded-md mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="flex justify-between w-full">
                  <div>
                    <h3 className="text-xl font-semibold">メンタリングダッシュボード</h3>
                    <p className="text-gray-600 mt-2">メンタリングの進捗状況と効果の確認</p>
                  </div>
                  <div className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full h-fit">
                    管理者専用
                  </div>
                </div>
              </div>
              <Link href="/admin/dashboard">
                <button className="bg-[#d1c9a6] hover:bg-[#c2b990] text-black font-medium py-2 px-4 rounded">
                  アクセスする
                </button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
