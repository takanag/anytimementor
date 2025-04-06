"use client";

import { useAuth } from "@/components/auth-provider";
import { type ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
}

export default function ProtectedRoute({ children, requireAuth = true }: ProtectedRouteProps) {
  const { user, session, isLoading, isAuthenticated } = useAuth();

  // ミドルウェアでリダイレクト処理を行うため、ここではリダイレクト処理を行わない

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

  // 認証が必要なページで未認証の場合は何も表示しない
  // ミドルウェアでリダイレクトされるため、ここでは何も表示しない
  if (requireAuth && !isAuthenticated) {
    console.log("ProtectedRoute: 認証が必要ですが、認証されていません", {
      user: user ? { id: user.id, email: user.email } : null,
      session: session ? { userId: session.user.id, email: session.user.email } : null,
      isAuthenticated
    });
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
