"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"

// ローディング表示用コンポーネント
function LoadingUI() {
  return (
    <div className="min-h-screen bg-[#f5f5eb] flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">ページを読み込み中...</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    </div>
  )
}

// 内部コンポーネント - useSearchParamsを使用
function MarketplaceContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all") // all, active, closed
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    // URLからクエリパラメータを取得
    const authParam = searchParams.get('auth')
    const timestamp = searchParams.get('ts')
    
    console.log('マーケットプレイスページがロードされました', { 
      authParam, 
      timestamp,
      currentTime: new Date().toISOString()
    })
    
    // ユーザーの認証状態を確認
    const checkAuth = async () => {
      setIsLoading(true)
      
      try {
        console.log('マーケットプレイス: セッション取得を試みます')
        const { data: { session } } = await supabase.auth.getSession()
        
        console.log('マーケットプレイス: セッション状態', {
          hasSession: !!session,
          userId: session?.user?.id,
          email: session?.user?.email
        })
        
        if (session?.user) {
          // 認証成功
          setIsAuthenticated(true)
          console.log('マーケットプレイス: 認証済みユーザー', { 
            id: session.user.id,
            email: session.user.email 
          })
        } else {
          // セッションがない場合
          console.log('マーケットプレイス: セッションがありません')
          setIsAuthenticated(false)
          
          // 直接ログインページにリダイレクト
          window.location.href = "/login?redirect=failed&ts=" + Date.now()
        }
      } catch (error) {
        console.error('マーケットプレイス: セッション取得エラー', error)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }
    
    checkAuth()
  }, [router, searchParams])
  
  // 認証されていない場合はローディング表示
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5eb] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">ページを読み込み中...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      </div>
    )
  }
  
  // 認証されていない場合は何も表示しない（リダイレクト中）
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f5f5eb] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">認証が必要です</h2>
          <p className="mb-4">ログインページにリダイレクトしています...</p>
          <Link href="/login" className="bg-[#d1c9a6] hover:bg-[#c2b990] text-black font-medium py-2 px-4 rounded">
            ログインページへ
          </Link>
        </div>
      </div>
    )
  }

  // タブの切り替え処理
  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
  }

  return (
    <div className="min-h-screen bg-[#f5f5eb]">
      <header className="bg-white p-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">社内タレントマーケットプレイス</h1>
          <div className="flex items-center space-x-6">
            <Link href="/marketplace/history" className="text-gray-700 hover:text-gray-900">
              応募履歴
            </Link>
            <Link href="/mypage/profile" className="text-gray-700 hover:text-gray-900">
              マイプロフィール
            </Link>
            <Link href="/mypage" className="text-gray-700 hover:text-gray-900">
              マイページ
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* 新規案件を作成 */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-start mb-4">
              <div className="bg-[#f5f5eb] p-2 rounded-md mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold">新規案件を作成</h3>
                <p className="text-gray-600 mt-2">新しいプロジェクトや業務の募集を登録</p>
                <p className="text-gray-600 mt-1">スキルや期間、募集人数などを指定して新しい案件を作成できます。</p>
              </div>
            </div>
            <Link href="/marketplace/create">
              <button className="bg-[#d1c9a6] hover:bg-[#c2b990] text-black font-medium py-2 px-4 rounded w-full">
                新規作成
              </button>
            </Link>
          </div>

          {/* 応募履歴 */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-start mb-4">
              <div className="bg-[#f5f5eb] p-2 rounded-md mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold">応募履歴</h3>
                <p className="text-gray-600 mt-2">あなたの応募状況を確認</p>
                <p className="text-gray-600 mt-1">過去の応募履歴や現在の選考状況を確認できます。</p>
              </div>
            </div>
            <Link href="/marketplace/history">
              <button className="bg-[#d1c9a6] hover:bg-[#c2b990] text-black font-medium py-2 px-4 rounded w-full">
                履歴を確認
              </button>
            </Link>
          </div>

          {/* マイプロフィール */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-start mb-4">
              <div className="bg-[#f5f5eb] p-2 rounded-md mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold">マイプロフィール</h3>
                <p className="text-gray-600 mt-2">プロフィール情報の確認</p>
                <p className="text-gray-600 mt-1">あなたのスキルや経験などのプロフィール情報を確認できます。</p>
              </div>
            </div>
            <Link href="/mypage/profile">
              <button className="bg-[#d1c9a6] hover:bg-[#c2b990] text-black font-medium py-2 px-4 rounded w-full">
                プロフィール確認
              </button>
            </Link>
          </div>
        </div>

        {/* 案件一覧 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-6">案件一覧</h2>
          
          {/* タブ */}
          <div className="flex border-b mb-6">
            <button 
              className={`py-2 px-4 font-medium ${activeTab === 'all' ? 'border-b-2 border-[#c2b990] text-black' : 'text-gray-500'}`}
              onClick={() => handleTabChange('all')}
            >
              すべての案件
            </button>
            <button 
              className={`py-2 px-4 font-medium ${activeTab === 'active' ? 'border-b-2 border-[#c2b990] text-black' : 'text-gray-500'}`}
              onClick={() => handleTabChange('active')}
            >
              募集中
            </button>
            <button 
              className={`py-2 px-4 font-medium ${activeTab === 'closed' ? 'border-b-2 border-[#c2b990] text-black' : 'text-gray-500'}`}
              onClick={() => handleTabChange('closed')}
            >
              募集終了
            </button>
          </div>
          
          {/* 検索ボックス */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                </svg>
              </div>
              <input 
                type="search" 
                className="block w-full p-3 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-[#c2b990] focus:border-[#c2b990]" 
                placeholder="案件を検索..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {/* タグ */}
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="bg-gray-200 text-gray-800 text-xs font-medium px-3 py-1 rounded-full">
              BtoBのマーケティング経験
            </span>
            <span className="bg-gray-200 text-gray-800 text-xs font-medium px-3 py-1 rounded-full">
              プロダクトマーケティング経験
            </span>
            <span className="bg-gray-200 text-gray-800 text-xs font-medium px-3 py-1 rounded-full">
              プロダクト設計経験（学習済でも構いません）
            </span>
            <span className="bg-gray-200 text-gray-800 text-xs font-medium px-3 py-1 rounded-full">
              初期構想フェーズにつきPower BIとExcelが使えればOKです。
            </span>
          </div>
          
          {/* 案件リスト */}
          <div className="space-y-6">
            {/* サンプル案件1 */}
            <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-semibold">新規サービス マーケティング</h3>
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">募集中</span>
              </div>
              <p className="text-gray-600 mt-2">新規サービスのマーケティング戦略立案と実行をリードする担当者を募集しています。BtoBマーケティングの経験がある方歓迎。</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">マーケティング</span>
                <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">BtoB</span>
                <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">戦略立案</span>
              </div>
              <div className="mt-4 flex justify-end">
                <Link href="/marketplace/detail/1">
                  <button className="bg-[#d1c9a6] hover:bg-[#c2b990] text-black font-medium py-1.5 px-3 rounded text-sm">
                    詳細を見る
                  </button>
                </Link>
              </div>
            </div>
            
            {/* サンプル案件2 */}
            <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-semibold">新規サービス プロダクトマネージャー</h3>
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">募集中</span>
              </div>
              <p className="text-gray-600 mt-2">新規サービスの企画から開発、ローンチまでをリードするプロダクトマネージャーを募集しています。プロダクト設計の経験がある方歓迎。</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">プロダクト</span>
                <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">マネジメント</span>
                <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">企画</span>
              </div>
              <div className="mt-4 flex justify-end">
                <Link href="/marketplace/detail/2">
                  <button className="bg-[#d1c9a6] hover:bg-[#c2b990] text-black font-medium py-1.5 px-3 rounded text-sm">
                    詳細を見る
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

// メインのエクスポート関数 - Suspenseでラップ
export default function MarketplacePage() {
  return (
    <Suspense fallback={<LoadingUI />}>
      <MarketplaceContent />
    </Suspense>
  )
}
