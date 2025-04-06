import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 保護されたルートのパターン（すべてのルートを一時的に除外）
const protectedRoutes: string[] = [];

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  
  // ミドルウェアクライアントの作成
  const supabase = createMiddlewareClient({ req: request, res });

  // セッションの取得
  const {
    data: { session },
  } = await supabase.auth.getSession();
  
  // デバッグ用：すべてのクッキーを表示
  const allCookies = request.cookies.getAll();
  console.log("ミドルウェア: すべてのクッキー:", allCookies.map(c => `${c.name}=${c.value}`));
  
  // クライアント側の認証状態を確認するためのデバッグコード
  if (!session) {
    console.log("ミドルウェア: セッションが見つかりません。クライアント側の認証状態と不一致の可能性があります。");
  }
  
  // 現在のパスを取得
  const path = request.nextUrl.pathname;
  
  // デバッグ用ログ（詳細情報を追加）
  console.log("ミドルウェア: セッション状態", {
    path,
    hasSession: !!session,
    userId: session?.user?.id,
    email: session?.user?.email,
    expiresAt: session?.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : '不明',
    currentTime: new Date().toLocaleString(),
    headers: Object.fromEntries(request.headers),
    cookies: request.cookies.getAll().map(c => c.name)
  });

  // セッションの有効期限を確認
  if (session) {
    const expiresAt = session.expires_at;
    const now = Math.floor(Date.now() / 1000); // 現在のUNIXタイムスタンプ（秒）
    
    if (expiresAt && expiresAt < now) {
      console.log("ミドルウェア: セッションの有効期限が切れています", {
        expiresAt: new Date(expiresAt * 1000).toLocaleString(),
        now: new Date(now * 1000).toLocaleString()
      });
      
      // セッションの有効期限が切れている場合は、未認証として扱う
      return handleUnauthenticated(request, path);
    }
  }

  // ルートパスの場合は、認証状態に応じてリダイレクト
  if (path === "/") {
    if (session) {
      // 認証済みの場合はマイページにリダイレクト
      console.log(
        "ミドルウェア: 認証済みユーザーがルートパスにアクセスしました。マイページにリダイレクトします。"
      );
      return NextResponse.redirect(new URL("/mypage", request.url));
    } else {
      // 未認証の場合はログインページにリダイレクト
      console.log(
        "ミドルウェア: 未認証ユーザーがルートパスにアクセスしました。ログインページにリダイレクトします。"
      );
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // パスが保護されたルートかどうかをチェック
  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  );

  // ユーザーが認証されていない状態で保護されたルートにアクセスしようとした場合
  if (isProtectedRoute && !session) {
    return handleUnauthenticated(request, path);
  }

  // 認証済みユーザーがログインページにアクセスした場合のリダイレクト処理
  if ((path === "/login" || path === "/signup") && session) {
    // リダイレクト先パラメータがある場合はそちらを優先
    const redirectTo = request.nextUrl.searchParams.get("redirectTo");
    
    console.log(
      "ミドルウェア: 認証済みユーザーがログインページにアクセスしました。リダイレクトします。",
      { path, userId: session.user.id, redirectTo }
    );
    
    let redirectUrl;
    
    if (redirectTo) {
      // リダイレクト先パラメータがある場合
      console.log("ミドルウェア: リダイレクト先パラメータを検出:", redirectTo);
      
      // redirectToが/で始まっていることを確認
      const normalizedPath = redirectTo.startsWith('/') ? redirectTo : `/${redirectTo}`;
      redirectUrl = new URL(normalizedPath, request.url);
    } else {
      // リダイレクト先パラメータがない場合はマイページへ
      console.log("ミドルウェア: リダイレクト先パラメータがないため、マイページにリダイレクトします");
      redirectUrl = new URL("/mypage", request.url);
    }
    
    // 無限リダイレクトループを防ぐため、クエリパラメータを追加しない
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

// 未認証ユーザーの処理を行う関数
function handleUnauthenticated(request: NextRequest, path: string) {
  console.log(
    `ミドルウェア: 未認証状態で保護されたルート ${path} にアクセスしました。ログインページにリダイレクトします。`
  );

  // ログインページにリダイレクト
  const redirectUrl = new URL("/login", request.url);
  // 元のURLをクエリパラメータとして保存し、ログイン後に元のページにリダイレクトできるようにする
  redirectUrl.searchParams.set("redirectTo", path);
  return NextResponse.redirect(redirectUrl);
}

// すべてのルートでミドルウェアを実行（特定のルートのみに絞ることも可能）
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
