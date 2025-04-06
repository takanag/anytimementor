-- worksheet_progress から worksheet_analytics への同期トリガー関数を作成
CREATE OR REPLACE FUNCTION sync_worksheet_analytics()
RETURNS TRIGGER AS $$
DECLARE
    json_data JSONB;
BEGIN
    -- 新しいデータまたは更新されたデータを取得
    json_data := NEW.data;
    
    -- worksheet_analytics テーブルに UPSERT
    -- 注意: 以下のカラム名とJSONパスは実際のテーブル構造に合わせて調整する必要があります
    INSERT INTO worksheet_analytics (
        anonymous_id,
        -- 以下は実際のテーブル構造に合わせて調整してください
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
        -- 以下は実際のテーブル構造に合わせて調整してください
        (json_data->>'current_step')::INT,
        (json_data->'introduction'->>'completed')::BOOLEAN,
        (json_data->'bias'->>'completed')::BOOLEAN,
        (json_data->'motivation'->>'completed')::BOOLEAN,
        (json_data->'capability'->>'completed')::BOOLEAN,
        (json_data->'new_beginnings'->>'completed')::BOOLEAN,
        (json_data->'celebration'->>'completed')::BOOLEAN,
        (json_data->'internal_motivation'->>'completed')::BOOLEAN,
        (json_data->'shadow_explanation'->>'completed')::BOOLEAN,
        (json_data->'seed_planting'->>'completed')::BOOLEAN,
        (json_data->'final_reflection'->>'completed')::BOOLEAN,
        (json_data->'value_articulation'->>'completed')::BOOLEAN,
        NEW.created_at,
        NEW.updated_at
    )
    ON CONFLICT (anonymous_id) 
    DO UPDATE SET
        -- 以下は実際のテーブル構造に合わせて調整してください
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
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'trigger_sync_worksheet_analytics'
    ) THEN
        CREATE TRIGGER trigger_sync_worksheet_analytics
        AFTER INSERT OR UPDATE ON worksheet_progress
        FOR EACH ROW
        EXECUTE FUNCTION sync_worksheet_analytics();
    END IF;
END
$$;

-- 手動同期用の関数を作成
CREATE OR REPLACE FUNCTION manual_sync_worksheet_analytics(target_anonymous_id UUID)
RETURNS VOID AS $$
DECLARE
    progress_record RECORD;
BEGIN
    -- 指定された anonymous_id のレコードを取得
    SELECT * INTO progress_record
    FROM worksheet_progress
    WHERE anonymous_id = target_anonymous_id;
    
    -- レコードが存在する場合、トリガー関数を手動で実行
    IF FOUND THEN
        PERFORM sync_worksheet_analytics_manual(progress_record);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 手動同期用のヘルパー関数（トリガー関数と同じロジックだが、引数を受け取る）
CREATE OR REPLACE FUNCTION sync_worksheet_analytics_manual(progress_record worksheet_progress)
RETURNS VOID AS $$
DECLARE
    json_data JSONB;
BEGIN
    -- データを取得
    json_data := progress_record.data;
    
    -- worksheet_analytics テーブルに UPSERT
    -- 注意: 以下のカラム名とJSONパスは実際のテーブル構造に合わせて調整する必要があります
    INSERT INTO worksheet_analytics (
        anonymous_id,
        -- 以下は実際のテーブル構造に合わせて調整してください
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
        progress_record.anonymous_id,
        -- 以下は実際のテーブル構造に合わせて調整してください
        (json_data->>'current_step')::INT,
        (json_data->'introduction'->>'completed')::BOOLEAN,
        (json_data->'bias'->>'completed')::BOOLEAN,
        (json_data->'motivation'->>'completed')::BOOLEAN,
        (json_data->'capability'->>'completed')::BOOLEAN,
        (json_data->'new_beginnings'->>'completed')::BOOLEAN,
        (json_data->'celebration'->>'completed')::BOOLEAN,
        (json_data->'internal_motivation'->>'completed')::BOOLEAN,
        (json_data->'shadow_explanation'->>'completed')::BOOLEAN,
        (json_data->'seed_planting'->>'completed')::BOOLEAN,
        (json_data->'final_reflection'->>'completed')::BOOLEAN,
        (json_data->'value_articulation'->>'completed')::BOOLEAN,
        progress_record.created_at,
        progress_record.updated_at
    )
    ON CONFLICT (anonymous_id) 
    DO UPDATE SET
        -- 以下は実際のテーブル構造に合わせて調整してください
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
END;
$$ LANGUAGE plpgsql;

