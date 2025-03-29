// Supabaseで実行するSQLクエリ
// worksheet_progressテーブルにuser_idカラムを追加

/*
ALTER TABLE worksheet_progress
ADD COLUMN user_id UUID REFERENCES auth.users(id);

CREATE INDEX idx_worksheet_progress_user_id ON worksheet_progress(user_id);

-- 既存のデータ移行のためのトリガー関数
CREATE OR REPLACE FUNCTION link_worksheet_to_user()
RETURNS TRIGGER AS $$
BEGIN
  -- 新しいユーザーが作成されたとき、匿名IDが一致するワークシートデータがあれば紐付ける
  UPDATE worksheet_progress
  SET user_id = NEW.id
  WHERE anonymous_id = NEW.email || '_anonymous'
  AND user_id IS NULL;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ユーザー作成時のトリガー
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION link_worksheet_to_user();
*/

