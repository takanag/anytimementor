-- worksheet_data_sync から worksheet_analytics への同期トリガー関数を修正
CREATE OR REPLACE FUNCTION sync_worksheet_data_to_analytics()
RETURNS TRIGGER AS $$
BEGIN
    -- worksheet_analytics テーブルに UPSERT
    INSERT INTO worksheet_analytics (
        anonymous_id,
        created_at,
        updated_at,
        current_step,
        raw_data,
        
        -- 導入部分
        introduction_name,
        introduction_experience,
        introduction_mentor_name,
        
        -- バイアス関連
        bias_change_lens,
        bias_other_change_lens,
        bias_work_meanings,
        bias_thought_origins,
        
        -- 内発的動機
        internal_motivation_admired_traits,
        internal_motivation_disliked_traits,
        
        -- モチベーション
        motivation_selected_values,
        
        -- 新しい始まり
        new_beginnings_action,
        new_beginnings_custom_action,
        
        -- シードプランティング
        seed_planting_action,
        seed_planting_custom_action,
        
        -- 価値観の明確化
        value_articulation_action,
        value_articulation_result,
        value_articulation_feedback,
        value_articulation_keyword1,
        value_articulation_keyword2,
        value_articulation_keyword3,
        value_articulation_situation,
        value_articulation_value_statement
    )
    VALUES (
        NEW.anonymous_id,
        NEW.created_at,
        NEW.updated_at,
        (NEW.data->>'currentStep')::INTEGER,
        NEW.data,
        
        -- 導入部分
        (NEW.data->'introduction'->>'name'),
        (NEW.data->'introduction'->>'experience'),
        (NEW.data->'introduction'->>'mentorName'),
        
        -- バイアス関連
        (NEW.data->'bias'->>'changeLens'),
        (NEW.data->'bias'->>'otherChangeLens'),
        (SELECT ARRAY(SELECT jsonb_array_elements_text(NEW.data->'bias'->'workMeanings')) WHERE NEW.data->'bias'->'workMeanings' IS NOT NULL),
        (SELECT ARRAY(SELECT jsonb_array_elements_text(NEW.data->'bias'->'thoughtOrigins')) WHERE NEW.data->'bias'->'thoughtOrigins' IS NOT NULL),
        
        -- 内発的動機
        (SELECT ARRAY(SELECT jsonb_array_elements_text(NEW.data->'internalMotivation'->'admiredTraits')) WHERE NEW.data->'internalMotivation'->'admiredTraits' IS NOT NULL),
        (SELECT ARRAY(SELECT jsonb_array_elements_text(NEW.data->'internalMotivation'->'dislikedTraits')) WHERE NEW.data->'internalMotivation'->'dislikedTraits' IS NOT NULL),
        
        -- モチベーション
        (SELECT ARRAY(SELECT jsonb_array_elements_text(NEW.data->'motivation'->'values')) WHERE NEW.data->'motivation'->'values' IS NOT NULL),
        
        -- 新しい始まり
        (NEW.data->'newBeginnings'->>'activity'),
        (NEW.data->'newBeginnings'->>'customActivity'),
        
        -- シードプランティング
        (NEW.data->'seedPlanting'->>'action'),
        (NEW.data->'seedPlanting'->>'customAction'),
        
        -- 価値観の明確化
        (NEW.data->'valueArticulation'->>'action'),
        (NEW.data->'valueArticulation'->>'result'),
        (NEW.data->'valueArticulation'->>'feedback'),
        (NEW.data->'valueArticulation'->>'keyword1'),
        (NEW.data->'valueArticulation'->>'keyword2'),
        (NEW.data->'valueArticulation'->>'keyword3'),
        (NEW.data->'valueArticulation'->>'situation'),
        (NEW.data->'valueArticulation'->>'valueStatement')
    )
    ON CONFLICT (anonymous_id) 
    DO UPDATE SET
        updated_at = EXCLUDED.updated_at,
        current_step = EXCLUDED.current_step,
        raw_data = EXCLUDED.raw_data,
        
        -- 導入部分
        introduction_name = EXCLUDED.introduction_name,
        introduction_experience = EXCLUDED.introduction_experience,
        introduction_mentor_name = EXCLUDED.introduction_mentor_name,
        
        -- バイアス関連
        bias_change_lens = EXCLUDED.bias_change_lens,
        bias_other_change_lens = EXCLUDED.bias_other_change_lens,
        bias_work_meanings = EXCLUDED.bias_work_meanings,
        bias_thought_origins = EXCLUDED.bias_thought_origins,
        
        -- 内発的動機
        internal_motivation_admired_traits = EXCLUDED.internal_motivation_admired_traits,
        internal_motivation_disliked_traits = EXCLUDED.internal_motivation_disliked_traits,
        
        -- モチベーション
        motivation_selected_values = EXCLUDED.motivation_selected_values,
        
        -- 新しい始まり
        new_beginnings_action = EXCLUDED.new_beginnings_action,
        new_beginnings_custom_action = EXCLUDED.new_beginnings_custom_action,
        
        -- シードプランティング
        seed_planting_action = EXCLUDED.seed_planting_action,
        seed_planting_custom_action = EXCLUDED.seed_planting_custom_action,
        
        -- 価値観の明確化
        value_articulation_action = EXCLUDED.value_articulation_action,
        value_articulation_result = EXCLUDED.value_articulation_result,
        value_articulation_feedback = EXCLUDED.value_articulation_feedback,
        value_articulation_keyword1 = EXCLUDED.value_articulation_keyword1,
        value_articulation_keyword2 = EXCLUDED.value_articulation_keyword2,
        value_articulation_keyword3 = EXCLUDED.value_articulation_keyword3,
        value_articulation_situation = EXCLUDED.value_articulation_situation,
        value_articulation_value_statement = EXCLUDED.value_articulation_value_statement;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- エラーログを記録
        RAISE NOTICE 'Error in sync_worksheet_data_to_analytics: %', SQLERRM;
        -- エラーを無視して処理を続行
        RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガーを再作成
DROP TRIGGER IF EXISTS trigger_sync_worksheet_data_to_analytics ON worksheet_data_sync;

CREATE TRIGGER trigger_sync_worksheet_data_to_analytics
AFTER INSERT OR UPDATE ON worksheet_data_sync
FOR EACH ROW
EXECUTE FUNCTION sync_worksheet_data_to_analytics();

-- トリガーが正しく作成されたことを確認
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM 
    information_schema.triggers
WHERE 
    event_object_table = 'worksheet_data_sync'
ORDER BY 
    trigger_name;

