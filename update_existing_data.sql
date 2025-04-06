-- 既存のデータを更新するためのスクリプト
-- このSQLをSupabaseのSQLエディタで実行してください

-- 既存のデータを更新
UPDATE mentoring_analytics ma
SET 
  seed_planting_action = (wp.data->>'seedPlanting')::jsonb->>'action',
  seed_planting_custom = (wp.data->>'seedPlanting')::jsonb->>'customAction'
FROM worksheet_progress wp
WHERE ma.anonymous_id = wp.anonymous_id
  AND (wp.data->>'seedPlanting')::jsonb->>'action' IS NOT NULL;

-- 更新されたデータを確認
SELECT 
  anonymous_id, 
  user_name, 
  seed_planting_action, 
  seed_planting_custom
FROM mentoring_analytics
WHERE seed_planting_action IS NOT NULL
ORDER BY updated_at DESC
LIMIT 10;

