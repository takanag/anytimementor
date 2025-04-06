-- worksheet_data_sync から worksheet_analytics への同期トリガー関数を作成
CREATE OR REPLACE FUNCTION sync_worksheet_data_to_analytics()
RETURNS TRIGGER AS $$
DECLARE
    json_data JSONB;
BEGIN
    -- 新しいデータまたは更新されたデータを取得
    json_data := NEW.data;
    
    -- worksheet_analytics テーブルに UPSERT
    INSERT INTO worksheet_analytics (
        anonymous_id,
        current_step,
        introduction_completed,
        bias_completed,
        motivation_completed,
        capability_completed,
        new_beginnings_completed,
        celebration_completed,
        internal_motivation_completed,
        shadow_explanation_completed,
        seed_planting_completed,
        final_reflection_completed,
        value_articulation_completed,
        created_at,
        updated_at
    )
    VALUES (
        NEW.anonymous_id,
        COALESCE((json_data->>'current_step')::INT, 0),
        COALESCE((json_data->'introduction'->>'completed')::BOOLEAN, false),
        COALESCE((json_data->'bias'->>'completed')::BOOLEAN, false),
        COALESCE((json_data->'motivation'->>'completed')::BOOLEAN, false),
        COALESCE((json_data->'capability'->>'completed')::BOOLEAN, false),
        COALESCE((json_data->'new_beginnings'->>'completed')::BOOLEAN, false),
        COALESCE((json_data->'celebration'->>'completed')::BOOLEAN, false),
        COALESCE((json_data->'internal_motivation'->>'completed')::BOOLEAN, false),
        COALESCE((json_data->'shadow_explanation'->>'completed')::BOOLEAN, false),
        COALESCE((json_data->'seed_planting'->>'completed')::BOOLEAN, false),
        COALESCE((json_data->'final_reflection'->>'completed')::BOOLEAN, false),
        COALESCE((json_data->'value_articulation'->>'completed')::BOOLEAN, false),
        NEW.created_at,
        NEW.updated_at
    )
    ON CONFLICT (anonymous_id) 
    DO UPDATE SET
        current_step = EXCLUDED.current_step,
        introduction_completed = EXCLUDED.introduction_completed,
        bias_completed = EXCLUDED.bias_completed,
        motivation_completed = EXCLUDED.motivation_completed,
        capability_completed = EXCLUDED.capability_completed,
        new_beginnings_completed = EXCLUDED.new_beginnings_completed,
        celebration_completed = EXCLUDED.celebration_completed,
        internal_motivation_completed = EXCLUDED.internal_motivation_completed,
        shadow_explanation_completed = EXCLUDED.shadow_explanation_completed,
        seed_planting_completed = EXCLUDED.seed_planting_completed,
        final_reflection_completed = EXCLUDED.final_reflection_completed,
        value_articulation_completed = EXCLUDED.value_articulation_completed,
        updated_at = EXCLUDED.updated_at;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガーを作成（まだ存在しない場合）
DROP TRIGGER IF EXISTS trigger_sync_worksheet_data_to_analytics ON worksheet_data_sync;

CREATE TRIGGER trigger_sync_worksheet_data_to_analytics
AFTER INSERT OR UPDATE ON worksheet_data_sync
FOR EACH ROW
EXECUTE FUNCTION sync_worksheet_data_to_analytics();

