-- worksheet_analyticsテーブルの構造を確認
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM 
  information_schema.columns
WHERE 
  table_name = 'worksheet_analytics'
ORDER BY 
  ordinal_position;

-- worksheet_data_syncテーブルの構造も確認
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM 
  information_schema.columns
WHERE 
  table_name = 'worksheet_data_sync'
ORDER BY 
  ordinal_position;

-- 制約を確認
SELECT
  tc.constraint_name,
  tc.constraint_type,
  tc.table_name,
  kcu.column_name
FROM
  information_schema.table_constraints tc
JOIN
  information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE
  tc.table_name IN ('worksheet_analytics', 'worksheet_data_sync')
ORDER BY
  tc.table_name,
  tc.constraint_type,
  tc.constraint_name;

-- 必要に応じてテーブル構造を修正
-- 例: anonymous_idのユニーク制約を削除（もし存在する場合）
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'unique_anonymous_id' 
    AND table_name = 'worksheet_analytics'
  ) THEN
    ALTER TABLE worksheet_analytics DROP CONSTRAINT unique_anonymous_id;
  END IF;
END
$$;

-- user_idカラムが存在しない場合は追加
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'worksheet_analytics' 
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE worksheet_analytics ADD COLUMN user_id UUID REFERENCES auth.users(id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'worksheet_data_sync' 
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE worksheet_data_sync ADD COLUMN user_id UUID REFERENCES auth.users(id);
  END IF;
END
$$;

-- 必須フィールドがNOT NULLになっている場合、NULLを許可するように変更
DO $$
BEGIN
  -- worksheet_analyticsテーブルの各カラムをチェック
  -- 例: user_nameがNOT NULLの場合はNULLを許可する
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'worksheet_analytics' 
    AND column_name = 'user_name' 
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE worksheet_analytics ALTER COLUMN user_name DROP NOT NULL;
  END IF;
  
  -- 他の可能性のあるNOT NULL制約も同様に確認・修正
  -- mentor_name
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'worksheet_analytics' 
    AND column_name = 'mentor_name' 
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE worksheet_analytics ALTER COLUMN mentor_name DROP NOT NULL;
  END IF;
  
  -- experience_level
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'worksheet_analytics' 
    AND column_name = 'experience_level' 
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE worksheet_analytics ALTER COLUMN experience_level DROP NOT NULL;
  END IF;
  
  -- 他のフィールドも同様に...
END
$$;

-- テーブルの内容を確認
SELECT * FROM worksheet_analytics LIMIT 5;
SELECT * FROM worksheet_data_sync LIMIT 5;

-- 既存のデータを確認
SELECT 
  COUNT(*) as total_records,
  COUNT(user_id) as records_with_user_id,
  COUNT(anonymous_id) as records_with_anonymous_id
FROM 
  worksheet_analytics;

SELECT 
  COUNT(*) as total_records,
  COUNT(user_id) as records_with_user_id,
  COUNT(anonymous_id) as records_with_anonymous_id
FROM 
  worksheet_data_sync;
