-- worksheet_data_syncテーブルの構造を確認
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM 
  information_schema.columns
WHERE 
  table_name = 'worksheet_data_sync';

-- 一意制約の確認
SELECT 
  tc.constraint_name, 
  tc.constraint_type,
  kcu.column_name
FROM 
  information_schema.table_constraints tc
JOIN 
  information_schema.key_column_usage kcu
ON 
  tc.constraint_name = kcu.constraint_name
WHERE 
  tc.table_name = 'worksheet_data_sync' AND 
  tc.constraint_type = 'UNIQUE';

-- 必要に応じて一意制約を追加
-- ALTER TABLE worksheet_data_sync ADD CONSTRAINT worksheet_data_sync_anon_worksheet_key UNIQUE (anonymous_id, worksheet_id);

-- 既存のデータを確認
SELECT 
  id, 
  anonymous_id, 
  worksheet_id, 
  current_step, 
  completed, 
  updated_at,
  (data IS NOT NULL) AS has_data
FROM 
  worksheet_data_sync
ORDER BY 
  updated_at DESC
LIMIT 10;

-- latest_worksheet_dataビューの確認
SELECT * FROM latest_worksheet_data LIMIT 5;

