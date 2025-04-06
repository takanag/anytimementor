-- このSQLをSupabaseのSQLエディタで実行して、JSONデータの実際の構造を確認します

-- 1. 特定のユーザーのJSONデータ全体を確認
SELECT 
  anonymous_id, 
  data->>'valueArticulation' as value_articulation_raw,
  data->>'seedPlanting' as seed_planting_raw,
  data->>'celebration' as celebration_raw
FROM worksheet_progress
WHERE anonymous_id = 'anon_knzp2aa384h_m84onhkn';

-- 2. 複数のユーザーのJSONデータを確認（最新の5件）
SELECT 
  anonymous_id, 
  data->>'valueArticulation' as value_articulation_raw,
  data->>'seedPlanting' as seed_planting_raw,
  data->>'celebration' as celebration_raw
FROM worksheet_progress
WHERE 
  data->>'valueArticulation' IS NOT NULL OR
  data->>'seedPlanting' IS NOT NULL OR
  data->>'celebration' IS NOT NULL
ORDER BY updated_at DESC
LIMIT 5;

-- 3. JSONデータの構造をより詳細に確認
SELECT 
  anonymous_id,
  jsonb_pretty(data->'valueArticulation') as value_articulation_pretty,
  jsonb_pretty(data->'seedPlanting') as seed_planting_pretty,
  jsonb_pretty(data->'celebration') as celebration_pretty
FROM worksheet_progress
WHERE 
  data->>'valueArticulation' IS NOT NULL OR
  data->>'seedPlanting' IS NOT NULL OR
  data->>'celebration' IS NOT NULL
ORDER BY updated_at DESC
LIMIT 1;

