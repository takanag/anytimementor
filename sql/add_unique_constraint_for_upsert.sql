-- worksheet_data_syncテーブルに一意制約を追加
ALTER TABLE worksheet_data_sync 
ADD CONSTRAINT worksheet_data_sync_anon_worksheet_key 
UNIQUE (anonymous_id, worksheet_id);

-- 制約が追加されたことを確認
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

