// 新しいファイル: 環境変数チェッカー
export function checkEnvironmentVariables() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log("環境変数チェック:")
  console.log("NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl || "未設定")
  console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY:", supabaseKey ? "設定済み" : "未設定")

  if (!supabaseUrl || supabaseUrl === "https://your-project-url.supabase.co") {
    console.error("警告: Supabase URLが正しく設定されていません。プレースホルダーが使用されています。")
    return false
  }

  if (!supabaseKey || supabaseKey === "your-anon-key") {
    console.error("警告: Supabase匿名キーが正しく設定されていません。プレースホルダーが使用されています。")
    return false
  }

  return true
}

