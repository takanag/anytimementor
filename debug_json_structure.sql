-- JSONデータの構造を確認するためのSQLスクリプト
-- このSQLをSupabaseのSQLエディタで実行してください

-- seedPlantingデータの構造を確認
SELECT 
  anonymous_id,
  data->>'seedPlanting' as seedPlanting_json,
  jsonb_typeof(data->>'seedPlanting') as seedPlanting_type,
  jsonb_typeof((data->>'seedPlanting')::jsonb) as seedPlanting_jsonb_type
FROM worksheet_progress
WHERE data->>'seedPlanting' IS NOT NULL
ORDER BY updated_at DESC
LIMIT 5;

-- seedPlantingデータの中身を詳細に確認
SELECT 
  anonymous_id,
  (data->>'seedPlanting')::jsonb->>'action' as action,
  (data->>'seedPlanting')::jsonb->>'customAction' as custom_action
FROM worksheet_progress
WHERE data->>'seedPlanting' IS NOT NULL
ORDER BY updated_at DESC
LIMIT 5;

-- JSONパスが正しく動作しているか確認
SELECT 
  anonymous_id,
  data->>'seedPlanting' as raw_json,
  (data->>'seedPlanting')::jsonb as parsed_json,
  (data->>'seedPlanting')::jsonb->>'action' as action_path,
  (data->>'seedPlanting')::jsonb->'action' as action_element
FROM worksheet_progress
WHERE data->>'seedPlanting' IS NOT NULL
ORDER BY updated_at DESC
LIMIT 5;

-- 手動でデータを更新してみる
UPDATE mentoring_analytics ma
SET 
  seed_planting_action = subquery.action,
  seed_planting_custom = subquery.custom_action
FROM (
  SELECT 
    anonymous_id,
    (data->>'seedPlanting')::jsonb->>'action' as action,
    (data->>'seedPlanting')::jsonb->>'customAction' as custom_action
  FROM worksheet_progress
  WHERE data->>'seedPlanting' IS NOT NULL
) as subquery
WHERE ma.anonymous_id = subquery.anonymous_id
AND subquery.action IS NOT NULL;

-- 更新結果を確認
SELECT 
  anonymous_id,
  seed_planting_action,
  seed_planting_custom
FROM mentoring_analytics
WHERE seed_planting_action IS NOT NULL
ORDER BY updated_at DESC
LIMIT 10;

