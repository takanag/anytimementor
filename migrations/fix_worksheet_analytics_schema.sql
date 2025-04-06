-- worksheet_analyticsテーブルの現在のスキーマを確認
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM 
  information_schema.columns
WHERE 
  table_name = 'worksheet_analytics'
ORDER BY 
  ordinal_position;

-- 存在しないカラムを追加するための関数
CREATE OR REPLACE FUNCTION add_column_if_not_exists(
  p_table_name text,
  p_column_name text,
  p_data_type text
) RETURNS void AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = p_table_name AND column_name = p_column_name
  ) THEN
    EXECUTE format('ALTER TABLE %I ADD COLUMN %I %s', p_table_name, p_column_name, p_data_type);
    RAISE NOTICE 'カラムを追加しました: %.%', p_table_name, p_column_name;
  ELSE
    RAISE NOTICE 'カラムは既に存在します: %.%', p_table_name, p_column_name;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- エラーメッセージで指摘されたカラムを追加
SELECT add_column_if_not_exists('worksheet_analytics', 'activities', 'TEXT');

-- 基本的なユーザー情報カラムを追加
SELECT add_column_if_not_exists('worksheet_analytics', 'user_name', 'TEXT');
SELECT add_column_if_not_exists('worksheet_analytics', 'mentor_name', 'TEXT');
SELECT add_column_if_not_exists('worksheet_analytics', 'experience_level', 'TEXT');

-- その他の可能性のあるカラムも追加
SELECT add_column_if_not_exists('worksheet_analytics', 'work_meanings', 'TEXT[]');
SELECT add_column_if_not_exists('worksheet_analytics', 'thought_origins', 'TEXT[]');
SELECT add_column_if_not_exists('worksheet_analytics', 'admired_traits', 'TEXT[]');
SELECT add_column_if_not_exists('worksheet_analytics', 'disliked_traits', 'TEXT[]');
SELECT add_column_if_not_exists('worksheet_analytics', 'values', 'TEXT[]');
SELECT add_column_if_not_exists('worksheet_analytics', 'change_lens', 'TEXT');
SELECT add_column_if_not_exists('worksheet_analytics', 'new_activity', 'TEXT');
SELECT add_column_if_not_exists('worksheet_analytics', 'timeframe', 'TEXT');
SELECT add_column_if_not_exists('worksheet_analytics', 'obstacles', 'TEXT');
SELECT add_column_if_not_exists('worksheet_analytics', 'commitment', 'TEXT');
SELECT add_column_if_not_exists('worksheet_analytics', 'seed_planting_action', 'TEXT');
SELECT add_column_if_not_exists('worksheet_analytics', 'seed_planting_custom', 'TEXT');
SELECT add_column_if_not_exists('worksheet_analytics', 'strengths', 'TEXT');
SELECT add_column_if_not_exists('worksheet_analytics', 'improvements', 'TEXT');
SELECT add_column_if_not_exists('worksheet_analytics', 'enjoyment_level', 'INTEGER');
SELECT add_column_if_not_exists('worksheet_analytics', 'leadership_score', 'INTEGER');
SELECT add_column_if_not_exists('worksheet_analytics', 'communication_score', 'INTEGER');
SELECT add_column_if_not_exists('worksheet_analytics', 'technical_score', 'INTEGER');
SELECT add_column_if_not_exists('worksheet_analytics', 'problem_solving_score', 'INTEGER');
SELECT add_column_if_not_exists('worksheet_analytics', 'creativity_score', 'INTEGER');
SELECT add_column_if_not_exists('worksheet_analytics', 'completed_step', 'INTEGER');
SELECT add_column_if_not_exists('worksheet_analytics', 'is_completed', 'BOOLEAN');
SELECT add_column_if_not_exists('worksheet_analytics', 'user_id', 'UUID REFERENCES auth.users(id)');

-- 修正後のスキーマを確認
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM 
  information_schema.columns
WHERE 
  table_name = 'worksheet_analytics'
ORDER BY 
  ordinal_position;

-- 認証状態の確認
SELECT current_setting('request.jwt.claims', true)::json->>'sub' as current_user_id;
SELECT auth.uid() as auth_uid;
SELECT auth.role() as auth_role;

-- 既存データの確認（カラムが存在するかどうかを確認してから実行）
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'worksheet_analytics' AND column_name = 'user_name'
  ) THEN
    EXECUTE '
      SELECT 
        id, 
        anonymous_id, 
        user_id, 
        user_name, 
        created_at, 
        updated_at
      FROM 
        worksheet_analytics
      LIMIT 10;
    ';
  ELSE
    EXECUTE '
      SELECT 
        id, 
        anonymous_id, 
        user_id, 
        created_at, 
        updated_at
      FROM 
        worksheet_analytics
      LIMIT 10;
    ';
  END IF;
END $$;
