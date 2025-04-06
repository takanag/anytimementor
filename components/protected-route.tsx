"use client";

import { useAuth } from "@/components/auth-provider";
import { type ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
}

export default function ProtectedRoute({
  children,
  requireAuth = true,
}: ProtectedRouteProps) {
  const { user, session, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // 保護されたルートのリスト（マイページ経由でのみアクセス可能）
  const protectedPaths = ["/worksheet", "/new-beginnings", "/marketplace"];

  // 認証状態とアクセス経路をチェック
  useEffect(() => {
    if (isLoading) return;

    // 1. 認証チェック
    if (requireAuth && !isAuthenticated) {
      console.log(
        "ProtectedRoute: 認証が必要ですが、認証されていません。ログインページにリダイレクトします。",
        {
          pathname,
          user: user ? { id: user.id, email: user.email } : null,
          session: session
            ? { userId: session.user.id, email: session.user.email }
            : null,
          isAuthenticated,
        }
      );

      // ログインページに直接リダイレクト
      router.push("/login");
      return;
    }

    // 2. 保護されたパスへのアクセス経路チェック（クライアントサイドのみ）
    if (typeof window !== "undefined") {
      // 現在のパスが保護されたパスかどうかをチェック
      const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
      
      if (isProtectedPath) {
        // マイページを訪問したことがあるかチェック
        const hasVisitedMypage = localStorage.getItem("hasVisitedMypage");
        
        // マイページを訪問したことがない場合、マイページにリダイレクト
        if (!hasVisitedMypage) {
          console.log(
            "ProtectedRoute: 保護されたパスへのアクセスはマイページ経由のみ許可されています。マイページにリダイレクトします。",
            {
              pathname,
              hasVisitedMypage,
            }
          );
          
          router.push("/mypage");
        }
      }
    }
  }, [
    isLoading,
    isAuthenticated,
    requireAuth,
    router,
    pathname,
    user,
    session,
  ]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">ページを読み込み中...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      </div>
    );
  }

  // ログインページなど、認証が不要なページの場合は常に表示
  if (!requireAuth) {
    return <>{children}</>;
  }

  // 認証が必要なページで未認証の場合は、リダイレクト中の表示を返す
  // useEffectでリダイレクト処理を行うため、ここでは一時的な表示を返す
  if (requireAuth && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">認証が必要です</h2>
          <p className="mb-4">ログインページにリダイレクトしています...</p>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
