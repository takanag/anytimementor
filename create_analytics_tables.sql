-- 1. メンタリングセッション分析用のテーブル
CREATE TABLE mentoring_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  anonymous_id TEXT REFERENCES worksheet_progress(anonymous_id),
  session_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- ユーザー基本情報
  user_name TEXT,
  mentor_name TEXT,
  experience_level TEXT,
  
  -- バイアス関連データ
  work_meanings TEXT[],
  thought_origins TEXT[],
  change_lens TEXT,
  
  -- 内発的動機
  admired_traits TEXT[],
  disliked_traits TEXT[],
  
  -- モチベーション
  enjoyment_level INTEGER,
  values TEXT[],
  activities TEXT,
  
  -- 新しい取り組み
  new_activity TEXT,
  timeframe TEXT,
  obstacles TEXT,
  commitment TEXT,
  
  -- 種まきアクション
  seed_planting_action TEXT,
  seed_planting_custom TEXT,
  
  -- ケイパビリティ
  leadership_score INTEGER,
  communication_score INTEGER,
  technical_score INTEGER,
  problem_solving_score INTEGER,
  creativity_score INTEGER,
  strengths TEXT,
  improvements TEXT,
  
  -- メタデータ
  completed_step INTEGER,
  is_completed BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- トリガー関数の問題を修正します。JSONパスが正しくないか、トリガーが正しく実行されていない可能性があります。

-- 既存のトリガーを削除
DROP TRIGGER IF EXISTS worksheet_progress_sync ON worksheet_progress;
DROP FUNCTION IF EXISTS sync_mentoring_analytics();

-- トリガー関数を再作成
CREATE OR REPLACE FUNCTION sync_mentoring_analytics()
RETURNS TRIGGER AS $$
BEGIN
  -- デバッグ用のログ出力
  RAISE NOTICE 'Syncing data for anonymous_id: %', NEW.anonymous_id;
  RAISE NOTICE 'seedPlanting data: %', (NEW.data->>'seedPlanting')::jsonb;
  
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
    (NEW.data->>'seedPlanting')::jsonb->>'action',
    (NEW.data->>'seedPlanting')::jsonb->>'customAction',
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
    seed_planting_action = EXCLUDED.seed_planting_action,
    seed_planting_custom = EXCLUDED.seed_planting_custom,
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

-- 4. 既存データの移行
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
SELECT
  anonymous_id,
  (data->>'introduction')::jsonb->>'name',
  (data->>'introduction')::jsonb->>'mentorName',
  (data->>'introduction')::jsonb->>'experience',
  (SELECT ARRAY(SELECT jsonb_array_elements_text((data->>'bias')::jsonb->'workMeanings')) WHERE (data->>'bias')::jsonb->'workMeanings' IS NOT NULL),
  (SELECT ARRAY(SELECT jsonb_array_elements_text((data->>'bias')::jsonb->'thoughtOrigins')) WHERE (data->>'bias')::jsonb->'thoughtOrigins' IS NOT NULL),
  (data->>'bias')::jsonb->>'changeLens',
  (SELECT ARRAY(SELECT jsonb_array_elements_text((data->>'internalMotivation')::jsonb->'admiredTraits')) WHERE (data->>'internalMotivation')::jsonb->'admiredTraits' IS NOT NULL),
  (SELECT ARRAY(SELECT jsonb_array_elements_text((data->>'internalMotivation')::jsonb->'dislikedTraits')) WHERE (data->>'internalMotivation')::jsonb->'dislikedTraits' IS NOT NULL),
  ((data->>'motivation')::jsonb->>'enjoyment')::INTEGER,
  (SELECT ARRAY(SELECT jsonb_array_elements_text((data->>'motivation')::jsonb->'values')) WHERE (data->>'motivation')::jsonb->'values' IS NOT NULL),
  (data->>'motivation')::jsonb->>'activities',
  (data->>'newBeginnings')::jsonb->>'activity',
  (data->>'newBeginnings')::jsonb->>'timeframe',
  (data->>'newBeginnings')::jsonb->>'obstacles',
  (data->>'newBeginnings')::jsonb->>'commitment',
  (data->>'seedPlanting')::jsonb->>'action',
  (data->>'seedPlanting')::jsonb->>'customAction',
  ((data->>'capability')::jsonb->>'leadership')::INTEGER,
  ((data->>'capability')::jsonb->>'communication')::INTEGER,
  ((data->>'capability')::jsonb->>'technical')::INTEGER,
  ((data->>'capability')::jsonb->>'problemSolving')::INTEGER,
  ((data->>'capability')::jsonb->>'creativity')::INTEGER,
  (data->>'capability')::jsonb->>'strengths',
  (data->>'capability')::jsonb->>'improvements',
  (data->>'currentStep')::INTEGER,
  (data->>'currentStep')::INTEGER = 7
FROM
  worksheet_progress
ON CONFLICT (anonymous_id) DO NOTHING;

