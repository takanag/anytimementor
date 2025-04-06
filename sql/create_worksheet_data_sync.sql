-- 新しいワークシートデータ同期テーブルの作成
CREATE TABLE IF NOT EXISTS worksheet_data_sync (
  id BIGSERIAL PRIMARY KEY,
  anonymous_id TEXT NOT NULL,
  worksheet_id TEXT,
  data JSONB NOT NULL,
  current_step INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- anonymous_idに対するインデックスを作成（検索を高速化するため）
CREATE INDEX IF NOT EXISTS idx_worksheet_data_sync_anonymous_id ON worksheet_data_sync(anonymous_id);

-- 最新のレコードを取得するためのビューを作成
CREATE OR REPLACE VIEW latest_worksheet_data AS
SELECT DISTINCT ON (anonymous_id, worksheet_id)
  id,
  anonymous_id,
  worksheet_id,
  data,
  current_step,
  completed,
  created_at,
  updated_at
FROM worksheet_data_sync
ORDER BY anonymous_id, worksheet_id, updated_at DESC;

-- テスト用のデータ取得関数
CREATE OR REPLACE FUNCTION get_latest_worksheet_data(p_anonymous_id TEXT)
RETURNS TABLE (
  id BIGINT,
  anonymous_id TEXT,
  worksheet_id TEXT,
  data JSONB,
  current_step INTEGER,
  completed BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM latest_worksheet_data
  WHERE anonymous_id = p_anonymous_id;
END;
$$ LANGUAGE plpgsql;

