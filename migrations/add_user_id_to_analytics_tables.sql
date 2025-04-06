-- worksheet_data_syncテーブルにuser_idカラムを追加
ALTER TABLE worksheet_data_sync
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- worksheet_analyticsテーブルにuser_idカラムを追加
ALTER TABLE worksheet_analytics
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- インデックスを作成してクエリパフォーマンスを向上
CREATE INDEX IF NOT EXISTS idx_worksheet_data_sync_user_id ON worksheet_data_sync(user_id);
CREATE INDEX IF NOT EXISTS idx_worksheet_analytics_user_id ON worksheet_analytics(user_id);

-- 既存データ取得クエリのための関数の更新
-- 1. ユーザーIDを使用してワークシートデータを取得する関数
CREATE OR REPLACE FUNCTION get_worksheet_data_by_user_id(p_user_id UUID)
RETURNS TABLE (
  id BIGINT,
  anonymous_id TEXT,
  user_id UUID,
  worksheet_id TEXT,
  data JSONB,
  current_step INTEGER,
  completed BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    wds.id,
    wds.anonymous_id,
    wds.user_id,
    wds.worksheet_id,
    wds.data,
    wds.current_step,
    wds.completed,
    wds.created_at,
    wds.updated_at
  FROM worksheet_data_sync wds
  WHERE wds.user_id = p_user_id
  ORDER BY wds.updated_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- 2. 匿名IDまたはユーザーIDでワークシートデータを取得する関数
CREATE OR REPLACE FUNCTION get_latest_worksheet_data_by_any_id(
  p_anonymous_id TEXT DEFAULT NULL,
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id BIGINT,
  anonymous_id TEXT,
  user_id UUID,
  worksheet_id TEXT,
  data JSONB,
  current_step INTEGER,
  completed BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    wds.id,
    wds.anonymous_id,
    wds.user_id,
    wds.worksheet_id,
    wds.data,
    wds.current_step,
    wds.completed,
    wds.created_at,
    wds.updated_at
  FROM worksheet_data_sync wds
  WHERE 
    (p_anonymous_id IS NOT NULL AND wds.anonymous_id = p_anonymous_id)
    OR
    (p_user_id IS NOT NULL AND wds.user_id = p_user_id)
  ORDER BY wds.updated_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;
