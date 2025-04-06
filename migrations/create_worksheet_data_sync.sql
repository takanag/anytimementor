-- worksheet_data_syncテーブルが存在しない場合は作成
CREATE TABLE IF NOT EXISTS worksheet_data_sync (
  id SERIAL PRIMARY KEY,
  anonymous_id TEXT NOT NULL,
  worksheet_id INTEGER,
  original_id INTEGER,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスを作成
CREATE INDEX IF NOT EXISTS idx_worksheet_data_sync_anonymous_id ON worksheet_data_sync(anonymous_id);
CREATE INDEX IF NOT EXISTS idx_worksheet_data_sync_worksheet_id ON worksheet_data_sync(worksheet_id);
CREATE INDEX IF NOT EXISTS idx_worksheet_data_sync_created_at ON worksheet_data_sync(created_at);

