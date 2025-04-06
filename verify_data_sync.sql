-- このSQLをSupabaseのSQLエディタで実行して、データの同期が正しく行われたか確認します

-- 1. 更新されたmentoring_analyticsテーブルのスキーマを確認
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'mentoring_analytics'
ORDER BY ordinal_position;

-- 2. 新しいフィールドのデータが存在するか確認
SELECT 
  COUNT(*) as total_records,
  COUNT(seed_planting_action) as seed_planting_count,
  COUNT(seed_planting_custom) as seed_planting_custom_count,
  COUNT(vision) as vision_count,
  COUNT(feelings) as feelings_count,
  COUNT(gratitude) as gratitude_count,
  COUNT(values_description) as values_description_count,
  COUNT(values_reflection) as values_reflection_count
FROM mentoring_analytics;

-- 3. 特定のレコードでデータの比較を行う（最新の10件）
SELECT 
  wp.anonymous_id,
  wp.data->>'currentStep' as current_step,
  (wp.data->>'seedPlanting')::jsonb->>'action' as wp_seed_action,
  (wp.data->>'celebration')::jsonb->>'vision' as wp_vision,
  (wp.data->>'valueArticulation')::jsonb->>'description' as wp_values_desc,
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

