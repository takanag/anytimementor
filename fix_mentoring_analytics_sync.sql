-- このSQLをSupabaseのSQLエディタで実行して、mentoring_analyticsテーブルを修正します

-- 1. 不足しているカラムを追加
ALTER TABLE mentoring_analytics 
  ADD COLUMN IF NOT EXISTS vision TEXT,
  ADD COLUMN IF NOT EXISTS feelings TEXT,
  ADD COLUMN IF NOT EXISTS gratitude TEXT,
  ADD COLUMN IF NOT EXISTS values_description TEXT,
  ADD COLUMN IF NOT EXISTS values_reflection TEXT;

-- 2. トリガー関数を更新して、新しいフィールドを含める
CREATE OR REPLACE FUNCTION sync_mentoring_analytics()
RETURNS TRIGGER AS $$
BEGIN
  -- デバッグ用のログ出力
  RAISE NOTICE 'Syncing data for anonymous_id: %', NEW.anonymous_id;
  
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
    -- 追加フィールド
    vision,
    feelings,
    gratitude,
    values_description,
    values_reflection,
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
    (NEW.data->>'seedPlanting')::jsonb->>'action',
    (NEW.data->>'seedPlanting')::jsonb->>'customAction',
    ((NEW.data->>'capability')::jsonb->>'leadership')::INTEGER,
    ((NEW.data->>'capability')::jsonb->>'communication')::INTEGER,
    ((NEW.data->>'capability')::jsonb->>'technical')::INTEGER,
    ((NEW.data->>'capability')::jsonb->>'problemSolving')::INTEGER,
    ((NEW.data->>'capability')::jsonb->>'creativity')::INTEGER,
    (NEW.data->>'capability')::jsonb->>'strengths',
    (NEW.data->>'capability')::jsonb->>'improvements',
    -- 追加フィールド
    (NEW.data->>'celebration')::jsonb->>'vision',
    (NEW.data->>'celebration')::jsonb->>'feelings',
    (NEW.data->>'celebration')::jsonb->>'gratitude',
    (NEW.data->>'valueArticulation')::jsonb->>'description',
    (NEW.data->>'valueArticulation')::jsonb->>'reflection',
    (NEW.data->>'currentStep')::INTEGER,
    (NEW.data->>'currentStep')::INTEGER >= 7
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
    seed_planting_action = EXCLUDED.seed_planting_action,
    seed_planting_custom = EXCLUDED.seed_planting_custom,
    leadership_score = EXCLUDED.leadership_score,
    communication_score = EXCLUDED.communication_score,
    technical_score = EXCLUDED.technical_score,
    problem_solving_score = EXCLUDED.problem_solving_score,
    creativity_score = EXCLUDED.creativity_score,
    strengths = EXCLUDED.strengths,
    improvements = EXCLUDED.improvements,
    -- 追加フィールド
    vision = EXCLUDED.vision,
    feelings = EXCLUDED.feelings,
    gratitude = EXCLUDED.gratitude,
    values_description = EXCLUDED.values_description,
    values_reflection = EXCLUDED.values_reflection,
    completed_step = EXCLUDED.completed_step,
    is_completed = EXCLUDED.is_completed,
    updated_at = NOW();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. トリガーを再設定（既存のトリガーを削除して再作成）
DROP TRIGGER IF EXISTS worksheet_progress_sync ON worksheet_progress;
CREATE TRIGGER worksheet_progress_sync
AFTER INSERT OR UPDATE ON worksheet_progress
FOR EACH ROW
EXECUTE FUNCTION sync_mentoring_analytics();

-- 4. 既存データを更新
UPDATE mentoring_analytics ma
SET 
  vision = (wp.data->>'celebration')::jsonb->>'vision',
  feelings = (wp.data->>'celebration')::jsonb->>'feelings',
  gratitude = (wp.data->>'celebration')::jsonb->>'gratitude',
  values_description = (wp.data->>'valueArticulation')::jsonb->>'description',
  values_reflection = (wp.data->>'valueArticulation')::jsonb->>'reflection'
FROM worksheet_progress wp
WHERE ma.anonymous_id = wp.anonymous_id;

-- 5. 更新されたデータを確認
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

