-- mentoring_analyticsテーブルの構造を確認
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'mentoring_analytics'
ORDER BY ordinal_position;

-- seed_plantingカラムが存在しない場合は追加
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'mentoring_analytics' 
    AND column_name = 'seed_planting_action'
  ) THEN
    ALTER TABLE mentoring_analytics ADD COLUMN seed_planting_action TEXT;
    ALTER TABLE mentoring_analytics ADD COLUMN seed_planting_custom TEXT;
  END IF;
END $$;

-- トリガー関数が正しく設定されているか確認
SELECT 
  trigger_name, 
  event_manipulation, 
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'worksheet_progress';

-- 最新のデータを確認
SELECT 
  wp.anonymous_id,
  (wp.data->>'seedPlanting')::jsonb->>'action' as wp_action,
  (wp.data->>'seedPlanting')::jsonb->>'customAction' as wp_custom_action,
  ma.seed_planting_action as ma_action,
  ma.seed_planting_custom as ma_custom_action
FROM worksheet_progress wp
LEFT JOIN mentoring_analytics ma ON wp.anonymous_id = ma.anonymous_id
WHERE (wp.data->>'seedPlanting')::jsonb->>'action' IS NOT NULL
ORDER BY wp.updated_at DESC
LIMIT 10;

