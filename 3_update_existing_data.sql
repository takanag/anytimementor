-- このSQLをSupabaseのSQLエディタで実行して、既存データを更新します

-- 既存データを更新（正しいJSONパスを使用）
UPDATE mentoring_analytics ma
SET 
  vision = (wp.data->>'celebration')::jsonb->>'vision',
  feelings = (wp.data->>'celebration')::jsonb->>'feelings',
  gratitude = (wp.data->>'celebration')::jsonb->>'gratitude',
  -- valueArticulationの正しいキーを使用
  values_description = (wp.data->>'valueArticulation')::jsonb->>'valueStatement',
  values_reflection = (wp.data->>'valueArticulation')::jsonb->>'situation',
  seed_planting_action = (wp.data->>'seedPlanting')::jsonb->>'action',
  seed_planting_custom = (wp.data->>'seedPlanting')::jsonb->>'customAction'
FROM worksheet_progress wp
WHERE ma.anonymous_id = wp.anonymous_id;

-- 更新されたデータを確認
SELECT 
  anonymous_id, 
  user_name,
  seed_planting_action,
  seed_planting_custom,
  vision,
  feelings,
  gratitude,
  values_description,
  values_reflection
FROM mentoring_analytics
WHERE 
  seed_planting_action IS NOT NULL OR
  vision IS NOT NULL OR
  values_description IS NOT NULL
ORDER BY updated_at DESC
LIMIT 10;

