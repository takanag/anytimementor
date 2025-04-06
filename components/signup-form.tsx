"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SignupForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const { signUp } = useAuth()
  const router = useRouter()

  // handleSubmit関数を修正して、データ移行を行うようにします
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)

    // パスワード確認
    if (password !== confirmPassword) {
      setError("パスワードが一致しません。")
      return
    }

    // パスワードの強度チェック
    if (password.length < 8) {
      setError("パスワードは8文字以上である必要があります。")
      return
    }

    setIsSubmitting(true)

    try {
      const { user } = await signUp(email, password)

      if (!user) {
        setSuccessMessage("登録確認メールを送信しました。メールを確認してアカウントを有効化してください。")
        return
      }

      // データ移行が必要かチェック
      const pendingMigration = localStorage.getItem("pendingDataMigration") === "true"

      if (pendingMigration && user) {
        // データ移行APIを呼び出し
        try {
          const response = await fetch("/api/migrate-data", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          })

          if (response.ok) {
            // 移行完了後にフラグをクリア
            localStorage.removeItem("pendingDataMigration")
          }
        } catch (migrationError) {
          console.error("Error migrating data:", migrationError)
        }
      }

      setSuccessMessage("登録確認メールを送信しました。メールを確認してアカウントを有効化してください。")

      // ワークシート完了からの登録の場合はダッシュボードにリダイレクト
      if (pendingMigration) {
        router.push("/dashboard")
      }
    } catch (err: any) {
      setError(err.message || "登録に失敗しました。")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>アカウント登録</CardTitle>
        <CardDescription>新しいアカウントを作成してください</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert className="bg-green-50 text-green-800 border-green-200">
              <AlertDescription>{successMessage}</AlertDescription>
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
            <Label htmlFor="password">パスワード</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              required
              autoComplete="new-password"
            />
            <p className="text-xs text-muted-foreground">パスワードは8文字以上で設定してください</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">パスワード（確認）</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="********"
              required
              autoComplete="new-password"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting || !!successMessage}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                登録中...
              </>
            ) : (
              "登録する"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          すでにアカウントをお持ちの場合は
          <Link href="/login" className="text-primary hover:underline ml-1">
            ログイン
          </Link>
          してください
        </p>
      </CardFooter>
    </Card>
  )
}
