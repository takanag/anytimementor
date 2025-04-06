/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 環境変数を明示的に公開
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
  },
  // 環境変数のログ出力を追加
  webpack: (config, { isServer }) => {
    if (isServer) {
      console.log("環境変数ステータス:")
      console.log("NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "設定済み" : "未設定")
      console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "設定済み" : "未設定")
    }
    return config
  },
}

module.exports = nextConfig

