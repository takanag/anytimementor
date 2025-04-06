-- mentoring_data_syncテーブルの作成
CREATE TABLE IF NOT EXISTS mentoring_data_sync (
  id SERIAL PRIMARY KEY,
  anonymous_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS mentoring_data_sync_anonymous_id_idx ON mentoring_data_sync (anonymous_id);
CREATE INDEX IF NOT EXISTS mentoring_data_sync_session_id_idx ON mentoring_data_sync (session_id);
CREATE INDEX IF NOT EXISTS mentoring_data_sync_created_at_idx ON mentoring_data_sync (created_at);

-- 最新のメンタリングデータを取得するビューの作成
CREATE OR REPLACE VIEW latest_mentoring_data AS
SELECT DISTINCT ON (anonymous_id) *
FROM mentoring_data_sync
ORDER BY anonymous_id, created_at DESC;

-- コメント
COMMENT ON TABLE mentoring_data_sync IS '週次メンタリングのデータを保存するテーブル';
COMMENT ON COLUMN mentoring_data_sync.anonymous_id IS 'ユーザーの匿名ID';
COMMENT ON COLUMN mentoring_data_sync.session_id IS 'メンタリングセッションの一意のID';
COMMENT ON COLUMN mentoring_data_sync.data IS 'メンタリングデータ（JSON形式）';
COMMENT ON COLUMN mentoring_data_sync.created_at IS 'レコード作成日時';
COMMENT ON COLUMN mentoring_data_sync.updated_at IS 'レコード更新日時';

