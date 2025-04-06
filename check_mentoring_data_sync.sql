-- このSQLをSupabaseのSQLエディタで実行して、データの同期状況を確認します

-- 1. mentoring_analyticsテーブルのスキーマを確認
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'mentoring_analytics'
ORDER BY ordinal_position;

-- 2. valueArticulation, seedPlanting, celebrationのデータが存在するか確認
SELECT 
  COUNT(*) as total_records,
  COUNT(seed_planting_action) as seed_planting_count,
  COUNT(seed_planting_custom) as seed_planting_custom_count,
  -- celebrationカラムが存在する場合（存在しない場合はコメントアウト）
  COUNT(vision) as vision_count,
  COUNT(feelings) as feelings_count,
  COUNT(gratitude) as gratitude_count
  -- valueArticulationカラムが存在する場合（存在しない場合はコメントアウト）
  -- COUNT(value_articulation_field) as value_articulation_count
FROM mentoring_analytics;

-- 3. worksheet_progressテーブルでこれらのデータが存在するか確認
SELECT 
  COUNT(*) as total_records,
  COUNT(*) FILTER (WHERE data->>'seedPlanting' IS NOT NULL) as seed_planting_count,
  COUNT(*) FILTER (WHERE data->>'celebration' IS NOT NULL) as celebration_count,
  COUNT(*) FILTER (WHERE data->>'valueArticulation' IS NOT NULL) as value_articulation_count
FROM worksheet_progress;

-- 4. 特定のレコードでデータの比較を行う（最新の10件）
SELECT 
  wp.anonymous_id,
  wp.data->>'currentStep' as current_step,
  wp.data->'seedPlanting' as wp_seed_planting,
  wp.data->'celebration' as wp_celebration,
  wp.data->'valueArticulation' as wp_value_articulation,
  ma.seed_planting_action,
  ma.seed_planting_custom,
  ma.vision,
  ma.feelings,
  ma.gratitude
  -- valueArticulationのフィールドがあれば追加
FROM worksheet_progress wp
LEFT JOIN mentoring_analytics ma ON wp.anonymous_id = ma.anonymous_id
WHERE 
  wp.data->>'seedPlanting' IS NOT NULL OR
  wp.data->>'celebration' IS NOT NULL OR
  wp.data->>'valueArticulation' IS NOT NULL
ORDER BY wp.updated_at DESC
LIMIT 10;

