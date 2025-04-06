-- ユーザーIDを自動的に設定するトリガー関数を作成
CREATE OR REPLACE FUNCTION set_user_id_from_auth()
RETURNS TRIGGER AS $$
BEGIN
  -- RLSが有効な場合、auth.uid()は現在のユーザーIDを返す
  -- しかし、RLSが無効な場合やサーバーサイドからの呼び出しの場合は動作しない
  -- そのため、クライアントサイドでユーザーIDを設定する必要がある
  
  -- すでにuser_idが設定されている場合はそのまま使用
  IF NEW.user_id IS NOT NULL THEN
    RETURN NEW;
  END IF;
  
  -- JWT認証情報からユーザーIDを取得（可能な場合）
  -- 注意: これはRLSが有効で、かつクライアントが認証されている場合のみ動作
  IF auth.role() = 'authenticated' AND auth.uid() IS NOT NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- worksheet_data_syncテーブルのトリガーを作成
DROP TRIGGER IF EXISTS set_user_id_worksheet_data_sync ON worksheet_data_sync;
CREATE TRIGGER set_user_id_worksheet_data_sync
BEFORE INSERT OR UPDATE ON worksheet_data_sync
FOR EACH ROW
EXECUTE FUNCTION set_user_id_from_auth();

-- worksheet_analyticsテーブルのトリガーを作成
DROP TRIGGER IF EXISTS set_user_id_worksheet_analytics ON worksheet_analytics;
CREATE TRIGGER set_user_id_worksheet_analytics
BEFORE INSERT OR UPDATE ON worksheet_analytics
FOR EACH ROW
EXECUTE FUNCTION set_user_id_from_auth();

-- 既存データの移行関数（手動実行用）
CREATE OR REPLACE FUNCTION migrate_anonymous_data_to_user_id()
RETURNS TEXT AS $$
DECLARE
  updated_data_sync INTEGER := 0;
  updated_analytics INTEGER := 0;
  user_record RECORD;
BEGIN
  -- 各認証ユーザーに対して処理
  FOR user_record IN SELECT id, email FROM auth.users
  LOOP
    -- worksheet_data_syncテーブルの更新
    WITH updated AS (
      UPDATE worksheet_data_sync
      SET user_id = user_record.id
      WHERE user_id IS NULL
      AND anonymous_id = user_record.email || '_anonymous'
      RETURNING id
    )
    SELECT COUNT(*) INTO updated_data_sync FROM updated;
    
    -- worksheet_analyticsテーブルの更新
    WITH updated AS (
      UPDATE worksheet_analytics
      SET user_id = user_record.id
      WHERE user_id IS NULL
      AND anonymous_id = user_record.email || '_anonymous'
      RETURNING id
    )
    SELECT COUNT(*) INTO updated_analytics FROM updated;
  END LOOP;
  
  RETURN 'データ移行完了: worksheet_data_sync=' || updated_data_sync || ', worksheet_analytics=' || updated_analytics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 使用例:
-- SELECT migrate_anonymous_data_to_user_id();
