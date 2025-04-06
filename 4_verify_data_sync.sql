-- このSQLをSupabaseのSQLエディタで実行して、データの同期が正しく行われたか確認します

-- 1. 特定のレコードでデータの比較を行う（最新の10件）
SELECT 
  wp.anonymous_id,
  wp.data->>'currentStep' as current_step,
  (wp.data->>'seedPlanting')::jsonb->>'action' as wp_seed_action,
  (wp.data->>'celebration')::jsonb->>'vision' as wp_vision,
  (wp.data->>'valueArticulation')::jsonb->>'valueStatement' as wp_value_statement,
  ma.seed_planting_action,
  ma.vision,
  ma.values_description
FROM worksheet_progress wp
LEFT JOIN mentoring_analytics ma ON wp.anonymous_id = ma.anonymous_id
WHERE 
  wp.data->>'seedPlanting' IS NOT NULL OR
  wp.data->>'celebration' IS NOT NULL OR
  wp.data->>'valueArticulation' IS NOT NULL
ORDER BY wp.updated_at DESC
LIMIT 10;

-- 2. 不一致があるデータを検出
SELECT 
  wp.anonymous_id,
  (wp.data->>'valueArticulation')::jsonb->>'valueStatement' as wp_value_statement,
  ma.values_description
FROM worksheet_progress wp
JOIN mentoring_analytics ma ON wp.anonymous_id = ma.anonymous_id
WHERE 
  (wp.data->>'valueArticulation')::jsonb->>'valueStatement' IS NOT NULL AND
  ((wp.data->>'valueArticulation')::jsonb->>'valueStatement' != ma.values_description OR ma.values_description IS NULL)
ORDER BY wp.updated_at DESC
LIMIT 10;

-- 3. 新しいフィールドのデータが存在するか確認
SELECT 
  COUNT(*) as total_records,
  COUNT(seed_planting_action) as seed_planting_count,
  COUNT(vision) as vision_count,
  COUNT(values_description) as values_description_count
FROM mentoring_analytics;

