-- RLS（Row Level Security）の状態を確認し、必要に応じて修正するスクリプト

-- 1. 現在のRLS設定を確認
SELECT
  schemaname,
  tablename,
  hasindexes,
  hasrules,
  hastriggers,
  rowsecurity
FROM
  pg_tables
WHERE
  schemaname = 'public'
  AND tablename IN ('worksheet_data_sync', 'worksheet_analytics');

-- 2. RLSが有効でない場合は有効化
ALTER TABLE IF EXISTS public.worksheet_data_sync ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.worksheet_analytics ENABLE ROW LEVEL SECURITY;

-- 3. 適切なポリシーを作成（存在しない場合のみ）
-- 認証ユーザーは自分のデータのみ読み書き可能
DO $$
BEGIN
  -- worksheet_data_syncテーブルのポリシーを確認・作成
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'worksheet_data_sync' AND policyname = 'auth_users_own_data'
  ) THEN
    CREATE POLICY auth_users_own_data ON public.worksheet_data_sync
      USING (auth.uid() = user_id OR user_id IS NULL)
      WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
  END IF;

  -- worksheet_analyticsテーブルのポリシーを確認・作成
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'worksheet_analytics' AND policyname = 'auth_users_own_data'
  ) THEN
    CREATE POLICY auth_users_own_data ON public.worksheet_analytics
      USING (auth.uid() = user_id OR user_id IS NULL)
      WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
  END IF;
END
$$;

-- 4. 既存のポリシーを確認
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM
  pg_policies
WHERE
  schemaname = 'public'
  AND tablename IN ('worksheet_data_sync', 'worksheet_analytics');

-- 5. トリガー関数を修正して、より確実にユーザーIDを設定
CREATE OR REPLACE FUNCTION set_user_id_from_auth()
RETURNS TRIGGER AS $$
DECLARE
  current_user_id UUID;
BEGIN
  -- すでにuser_idが設定されている場合はそのまま使用
  IF NEW.user_id IS NOT NULL THEN
    RETURN NEW;
  END IF;
  
  -- 現在の認証ユーザーIDを取得（複数の方法を試行）
  BEGIN
    -- 方法1: auth.uid()を使用
    IF auth.uid() IS NOT NULL THEN
      NEW.user_id := auth.uid();
      RAISE NOTICE 'ユーザーID設定: auth.uid()から %', NEW.user_id;
      RETURN NEW;
    END IF;
    
    -- 方法2: current_settingを使用
    BEGIN
      current_user_id := current_setting('request.jwt.claims', true)::json->>'sub';
      IF current_user_id IS NOT NULL THEN
        NEW.user_id := current_user_id;
        RAISE NOTICE 'ユーザーID設定: JWTから %', NEW.user_id;
        RETURN NEW;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      -- エラーを無視して次の方法を試す
      RAISE NOTICE 'JWT取得エラー: %', SQLERRM;
    END;
  END;
  
  -- いずれの方法でもユーザーIDが取得できなかった場合
  RAISE NOTICE 'ユーザーIDを設定できませんでした';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. トリガーを再作成
DROP TRIGGER IF EXISTS set_user_id_worksheet_data_sync ON worksheet_data_sync;
CREATE TRIGGER set_user_id_worksheet_data_sync
BEFORE INSERT OR UPDATE ON worksheet_data_sync
FOR EACH ROW
EXECUTE FUNCTION set_user_id_from_auth();

DROP TRIGGER IF EXISTS set_user_id_worksheet_analytics ON worksheet_analytics;
CREATE TRIGGER set_user_id_worksheet_analytics
BEFORE INSERT OR UPDATE ON worksheet_analytics
FOR EACH ROW
EXECUTE FUNCTION set_user_id_from_auth();

-- 7. 既存データの移行関数も改善
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
      AND (
        anonymous_id = user_record.email || '_anonymous'
        OR
        -- メールアドレスの一部が匿名IDに含まれている場合も対象に
        anonymous_id LIKE '%' || split_part(user_record.email, '@', 1) || '%'
      )
      RETURNING id
    )
    SELECT COUNT(*) INTO updated_data_sync FROM updated;
    
    -- worksheet_analyticsテーブルの更新
    WITH updated AS (
      UPDATE worksheet_analytics
      SET user_id = user_record.id
      WHERE user_id IS NULL
      AND (
        anonymous_id = user_record.email || '_anonymous'
        OR
        -- メールアドレスの一部が匿名IDに含まれている場合も対象に
        anonymous_id LIKE '%' || split_part(user_record.email, '@', 1) || '%'
      )
      RETURNING id
    )
    SELECT COUNT(*) INTO updated_analytics FROM updated;
  END LOOP;
  
  RETURN 'データ移行完了: worksheet_data_sync=' || updated_data_sync || ', worksheet_analytics=' || updated_analytics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 使用例:
-- SELECT migrate_anonymous_data_to_user_id();
