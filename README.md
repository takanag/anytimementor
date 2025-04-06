# Any Time Mentor Dashboard

## 環境変数の設定

このアプリケーションを実行するには、以下の環境変数を設定する必要があります：

### 必須の環境変数

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase プロジェクトの URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase の匿名キー
- `SUPABASE_SERVICE_KEY`: Supabase のサービスキー

### オプションの環境変数

- `OPENAI_API_KEY`: OpenAI API キー（ニュース記事生成機能に必要）

環境変数は `.env.local` ファイルに設定するか、Vercel などのホスティングサービスの環境変数設定で追加できます。

