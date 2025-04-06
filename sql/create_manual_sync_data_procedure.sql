-- worksheet_data_syncからworksheet_analyticsへの手動同期用のストアドプロシージャ
CREATE OR REPLACE FUNCTION manual_sync_data_to_analytics(
  p_anonymous_id TEXT,
  p_data JSONB,
  p_created_at TIMESTAMP WITH TIME ZONE,
  p_updated_at TIMESTAMP WITH TIME ZONE
) RETURNS VOID AS $$
BEGIN
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
    p_anonymous_id,
    COALESCE((p_data->>'current_step')::INT, 0),
    COALESCE((p_data->'introduction'->>'completed')::BOOLEAN, false),
    COALESCE((p_data->'bias'->>'completed')::BOOLEAN, false),
    COALESCE((p_data->'motivation'->>'completed')::BOOLEAN, false),
    COALESCE((p_data->'capability'->>'completed')::BOOLEAN, false),
    COALESCE((p_data->'new_beginnings'->>'completed')::BOOLEAN, false),
    COALESCE((p_data->'celebration'->>'completed')::BOOLEAN, false),
    COALESCE((p_data->'internal_motivation'->>'completed')::BOOLEAN, false),
    COALESCE((p_data->'shadow_explanation'->>'completed')::BOOLEAN, false),
    COALESCE((p_data->'seed_planting'->>'completed')::BOOLEAN, false),
    COALESCE((p_data->'final_reflection'->>'completed')::BOOLEAN, false),
    COALESCE((p_data->'value_articulation'->>'completed')::BOOLEAN, false),
    p_created_at,
    p_updated_at
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
END;
$$ LANGUAGE plpgsql;

