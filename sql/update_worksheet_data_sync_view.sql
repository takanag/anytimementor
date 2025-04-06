-- latest_worksheet_dataビューの更新（オプション）
-- 注意: UPSERTを使用する場合、このビューは不要になる可能性があります
CREATE OR REPLACE VIEW latest_worksheet_data AS
SELECT *
FROM worksheet_data_sync;

-- ビューの確認
SELECT * FROM latest_worksheet_data LIMIT 5;

-- 履歴データの保存（オプション）
-- 履歴を保持したい場合は、トリガーを作成して変更をログテーブルに記録できます
CREATE TABLE IF NOT EXISTS worksheet_data_history (
  id SERIAL PRIMARY KEY,
  worksheet_data_id INTEGER REFERENCES worksheet_data_sync(id),
  anonymous_id TEXT NOT NULL,
  worksheet_id TEXT NOT NULL,
  data JSONB,
  current_step INTEGER,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 変更をログに記録するトリガー関数（オプション）
CREATE OR REPLACE FUNCTION log_worksheet_data_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO worksheet_data_history (
    worksheet_data_id,
    anonymous_id,
    worksheet_id,
    data,
    current_step,
    completed,
    created_at,
    updated_at
  ) VALUES (
    OLD.id,
    OLD.anonymous_id,
    OLD.worksheet_id,
    OLD.data,
    OLD.current_step,
    OLD.completed,
    OLD.created_at,
    OLD.updated_at
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガーの作成（オプション）
DROP TRIGGER IF EXISTS worksheet_data_update_trigger ON worksheet_data_sync;
CREATE TRIGGER worksheet_data_update_trigger
BEFORE UPDATE ON worksheet_data_sync
FOR EACH ROW
EXECUTE FUNCTION log_worksheet_data_changes();

