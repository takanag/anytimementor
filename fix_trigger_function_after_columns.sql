-- カラム追加後にトリガー関数を修正するスクリプト
-- このSQLをSupabaseのSQLエディタで実行してください

-- 既存のトリガーを削除
DROP TRIGGER IF EXISTS worksheet_progress_sync ON worksheet_progress;
DROP FUNCTION IF EXISTS sync_mentoring_analytics();

-- トリガー関数を再作成（JSONパスの問題を修正）
CREATE OR REPLACE FUNCTION sync_mentoring_analytics()
RETURNS TRIGGER AS $$
DECLARE
  seed_action TEXT;
  seed_custom TEXT;
BEGIN
  -- seedPlantingデータを取得して変数に格納（NULLチェック付き）
  IF (NEW.data->>'seedPlanting') IS NOT NULL THEN
    seed_action := (NEW.data->>'seedPlanting')::jsonb->>'action';
    seed_custom := (NEW.data->>'seedPlanting')::jsonb->>'customAction';
    
    -- デバッグログ
    RAISE NOTICE 'SeedPlanting data found: action=%, customAction=%', seed_action, seed_custom;
  ELSE
    seed_action := NULL;
    seed_custom := NULL;
    RAISE NOTICE 'No seedPlanting data found';
  END IF;

  -- worksheet_progressが更新または挿入されたとき、mentoring_analyticsテーブルを更新
  INSERT INTO mentoring_analytics (
    anonymous_id,
    user_name,
    mentor_name,
    experience_level,
    work_meanings,
    thought_origins,
    change_lens,
    admired_traits,
    disliked_traits,
    enjoyment_level,
    values,
    activities,
    new_activity,
    timeframe,
    obstacles,
    commitment,
    seed_planting_action,
    seed_planting_custom,
    leadership_score,
    communication_score,
    technical_score,
    problem_solving_score,
    creativity_score,
    strengths,
    improvements,
    completed_step,
    is_completed
  )
  VALUES (
    NEW.anonymous_id,
    (NEW.data->>'introduction')::jsonb->>'name',
    (NEW.data->>'introduction')::jsonb->>'mentorName',
    (NEW.data->>'introduction')::jsonb->>'experience',
    (SELECT ARRAY(SELECT jsonb_array_elements_text((NEW.data->>'bias')::jsonb->'workMeanings')) WHERE (NEW.data->>'bias')::jsonb->'workMeanings' IS NOT NULL),
    (SELECT ARRAY(SELECT jsonb_array_elements_text((NEW.data->>'bias')::jsonb->'thoughtOrigins')) WHERE (NEW.data->>'bias')::jsonb->'thoughtOrigins' IS NOT NULL),
    (NEW.data->>'bias')::jsonb->>'changeLens',
    (SELECT ARRAY(SELECT jsonb_array_elements_text((NEW.data->>'internalMotivation')::jsonb->'admiredTraits')) WHERE (NEW.data->>'internalMotivation')::jsonb->'admiredTraits' IS NOT NULL),
    (SELECT ARRAY(SELECT jsonb_array_elements_text((NEW.data->>'internalMotivation')::jsonb->'dislikedTraits')) WHERE (NEW.data->>'internalMotivation')::jsonb->'dislikedTraits' IS NOT NULL),
    ((NEW.data->>'motivation')::jsonb->>'enjoyment')::INTEGER,
    (SELECT ARRAY(SELECT jsonb_array_elements_text((NEW.data->>'motivation')::jsonb->'values')) WHERE (NEW.data->>'motivation')::jsonb->'values' IS NOT NULL),
    (NEW.data->>'motivation')::jsonb->>'activities',
    (NEW.data->>'newBeginnings')::jsonb->>'activity',
    (NEW.data->>'newBeginnings')::jsonb->>'timeframe',
    (NEW.data->>'newBeginnings')::jsonb->>'obstacles',
    (NEW.data->>'newBeginnings')::jsonb->>'commitment',
    seed_action,
    seed_custom,
    ((NEW.data->>'capability')::jsonb->>'leadership')::INTEGER,
    ((NEW.data->>'capability')::jsonb->>'communication')::INTEGER,
    ((NEW.data->>'capability')::jsonb->>'technical')::INTEGER,
    ((NEW.data->>'capability')::jsonb->>'problemSolving')::INTEGER,
    ((NEW.data->>'capability')::jsonb->>'creativity')::INTEGER,
    (NEW.data->>'capability')::jsonb->>'strengths',
    (NEW.data->>'capability')::jsonb->>'improvements',
    (NEW.data->>'currentStep')::INTEGER,
    (NEW.data->>'currentStep')::INTEGER = 7
  )
  ON CONFLICT (anonymous_id) 
  DO UPDATE SET
    user_name = EXCLUDED.user_name,
    mentor_name = EXCLUDED.mentor_name,
    experience_level = EXCLUDED.experience_level,
    work_meanings = EXCLUDED.work_meanings,
    thought_origins = EXCLUDED.thought_origins,
    change_lens = EXCLUDED.change_lens,
    admired_traits = EXCLUDED.admired_traits,
    disliked_traits = EXCLUDED.disliked_traits,
    enjoyment_level = EXCLUDED.enjoyment_level,
    values = EXCLUDED.values,
    activities = EXCLUDED.activities,
    new_activity = EXCLUDED.new_activity,
    timeframe = EXCLUDED.timeframe,
    obstacles = EXCLUDED.obstacles,
    commitment = EXCLUDED.commitment,
    seed_planting_action = seed_action,
    seed_planting_custom = seed_custom,
    leadership_score = EXCLUDED.leadership_score,
    communication_score = EXCLUDED.communication_score,
    technical_score = EXCLUDED.technical_score,
    problem_solving_score = EXCLUDED.problem_solving_score,
    creativity_score = EXCLUDED.creativity_score,
    strengths = EXCLUDED.strengths,
    improvements = EXCLUDED.improvements,
    completed_step = EXCLUDED.completed_step,
    is_completed = EXCLUDED.is_completed,
    updated_at = NOW();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガーを再設定
CREATE TRIGGER worksheet_progress_sync
AFTER INSERT OR UPDATE ON worksheet_progress
FOR EACH ROW
EXECUTE FUNCTION sync_mentoring_analytics();

-- 既存データの更新
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
  user_name,
  seed_planting_action,
  seed_planting_custom
FROM mentoring_analytics
WHERE seed_planting_action IS NOT NULL
ORDER BY updated_at DESC
LIMIT 10;

