"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/lib/supabase";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // ログイン処理
      const result = await signIn(email, password);
      console.log("ログイン成功:", result);

      // セッションが設定されるのを待つ
      await new Promise((resolve) => setTimeout(resolve, 500));

      // ユーザープロファイルの承認状態を確認
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("approval_status")
        .eq("id", result.user?.id)
        .single();

      console.log("プロファイル確認結果:", profile);

      if (profile?.approval_status === "pending") {
        console.log("承認待ちユーザー: pending-approvalにリダイレクト");
        document.location.replace("/pending-approval");
        return;
      }

      if (profile?.approval_status === "rejected") {
        setError("このアカウントは承認されていません。");
        return;
      }

      // リダイレクト先の取得
      const urlParams = new URLSearchParams(window.location.search);
      const redirectTo = urlParams.get("redirectTo");
      const targetPath = redirectTo || "/mypage";

      console.log("リダイレクト実行:", targetPath);
      document.location.replace(targetPath);
    } catch (err: any) {
      console.error("ログインエラー:", err);

      // エラーメッセージを日本語に翻訳
      let errorMessage =
        "ログインに失敗しました。メールアドレスとパスワードを確認してください。";

      if (err.message) {
        if (
          err.message.includes("Invalid login credentials") ||
          err.message.includes("invalid_credentials")
        ) {
          errorMessage = "メールアドレスまたはパスワードが正しくありません。";
        } else if (err.message.includes("Email not confirmed")) {
          errorMessage =
            "メールアドレスが確認されていません。確認メールを確認してください。";
        } else if (err.message.includes("User not found")) {
          errorMessage = "このメールアドレスのアカウントが見つかりません。";
        } else if (err.message.includes("Too many requests")) {
          errorMessage =
            "ログイン試行回数が多すぎます。しばらく待ってから再度お試しください。";
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-4">
        <div className="flex justify-center">
          <div className="text-2xl font-bold py-4">ANY TIME MENTOR</div>
        </div>
        <CardTitle>ログイン</CardTitle>
        <CardDescription>アカウントにログインしてください</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">パスワード</Label>
              <Link
                href="/reset-password"
                className="text-sm text-primary hover:underline"
              >
                パスワードをお忘れですか？
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              required
              autoComplete="current-password"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ログイン中...
              </>
            ) : (
              "ログイン"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          アカウントをお持ちでない場合は
          <Link href="/signup" className="text-primary hover:underline ml-1">
            新規登録
          </Link>
          してください
        </p>
      </CardFooter>
    </Card>
  );
}
