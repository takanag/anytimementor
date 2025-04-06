-- 手動同期用の関数を作成
CREATE OR REPLACE FUNCTION manual_sync_worksheet_analytics(target_anonymous_id UUID)
RETURNS VOID AS $$
DECLARE
    progress_record RECORD;
BEGIN
    -- 指定された anonymous_id のレコードを取得
    FOR progress_record IN 
        SELECT * FROM worksheet_progress 
        WHERE anonymous_id = target_anonymous_id
    LOOP
        -- 既存のトリガー関数を手動で実行するための疑似イベント
        -- TG_OP = 'UPDATE' として扱い、既存のトリガー関数のロジックを再利用
        PERFORM sync_worksheet_analytics_manual(progress_record);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 手動同期用のヘルパー関数（トリガー関数と同じロジックを使用）
CREATE OR REPLACE FUNCTION sync_worksheet_analytics_manual(progress_record worksheet_progress)
RETURNS VOID AS $$
DECLARE
    -- 既存のトリガー関数と同じ変数を定義
BEGIN
    -- worksheet_analyticsテーブルにUPSERT
    INSERT INTO worksheet_analytics (
      worksheet_progress_id,
      anonymous_id,
      created_at,
      updated_at,
      
      -- currentStep
      current_step,
      
      -- bias関連
      bias_change_lens,
      bias_other_change_lens,
      bias_work_meanings,
      bias_thought_origins,
      
      -- avatar関連
      avatar_url,
      avatar_type,
      
      -- capability関連
      capability_leadership_lead_others,
      capability_leadership_self_growth,
      capability_leadership_org_strength,
      capability_collaboration_global_mind,
      capability_expertise_quality_control,
      capability_collaboration_adaptability,
      capability_expertise_knowledge_sharing,
      capability_expertise_specialized_knowledge,
      capability_integrity_and_trust_communication,
      capability_collaboration_network_utilization,
      capability_integrity_and_trust_client_response,
      capability_business_understanding_value_creation,
      capability_business_understanding_env_understanding,
      capability_integrity_and_trust_relationship_building,
      capability_business_understanding_analytical_thinking,
      
      -- userAvatar関連
      user_avatar_url,
      user_avatar_type,
      
      -- celebration関連
      celebration_completed,
      celebration_ritual_gift,
      celebration_ritual_type,
      celebration_ritual_toast,
      celebration_ritual_letter,
      celebration_news_article_lead,
      celebration_news_article_quote,
      celebration_news_article_content,
      celebration_news_article_headline,
      celebration_interview_work,
      celebration_interview_advice,
      celebration_interview_free_time,
      celebration_interview_schedule,
      celebration_interview_fulfillment,
      
      -- introduction関連
      introduction_name,
      introduction_experience,
      introduction_mentor_name,
      
      -- seedPlanting関連
      seed_planting_action,
      seed_planting_custom_action,
      
      -- valueArticulation関連
      value_articulation_action,
      value_articulation_result,
      value_articulation_feedback,
      value_articulation_keyword1,
      value_articulation_keyword2,
      value_articulation_keyword3,
      value_articulation_situation,
      value_articulation_value_statement,
      
      -- internalMotivation関連
      internal_motivation_admired_traits,
      internal_motivation_disliked_traits,
      
      -- motivation関連
      motivation_selected_values,
      
      -- newBeginnings関連
      new_beginnings_action,
      new_beginnings_custom_action,
      
      -- 元のJSONBデータ全体を保存
      raw_data
    )
    VALUES (
      progress_record.id,
      progress_record.anonymous_id,
      progress_record.created_at,
      progress_record.updated_at,
      
      -- currentStep
      (progress_record.data->>'currentStep')::integer,
      
      -- bias関連
      progress_record.data->'bias'->>'changeLens',
      progress_record.data->'bias'->>'otherChangeLens',
      CASE 
        WHEN jsonb_typeof(progress_record.data->'bias'->'workMeanings') = 'array' 
        THEN ARRAY(SELECT jsonb_array_elements_text(progress_record.data->'bias'->'workMeanings'))
        ELSE NULL
      END,
      CASE 
        WHEN jsonb_typeof(progress_record.data->'bias'->'thoughtOrigins') = 'array' 
        THEN ARRAY(SELECT jsonb_array_elements_text(progress_record.data->'bias'->'thoughtOrigins'))
        ELSE NULL
      END,
      
      -- avatar関連
      progress_record.data->'avatar'->>'url',
      progress_record.data->'avatar'->>'type',
      
      -- capability関連
      (progress_record.data->'capability'->>'leadership_leadOthers')::integer,
      (progress_record.data->'capability'->>'leadership_selfGrowth')::integer,
      (progress_record.data->'capability'->>'leadership_orgStrength')::integer,
      (progress_record.data->'capability'->>'collaboration_globalMind')::integer,
      (progress_record.data->'capability'->>'expertise_qualityControl')::integer,
      (progress_record.data->'capability'->>'collaboration_adaptability')::integer,
      (progress_record.data->'capability'->>'expertise_knowledgeSharing')::integer,
      (progress_record.data->'capability'->>'expertise_specializedKnowledge')::integer,
      (progress_record.data->'capability'->>'integrityAndTrust_communication')::integer,
      (progress_record.data->'capability'->>'collaboration_networkUtilization')::integer,
      (progress_record.data->'capability'->>'integrityAndTrust_clientResponse')::integer,
      (progress_record.data->'capability'->>'businessUnderstanding_valueCreation')::integer,
      (progress_record.data->'capability'->>'businessUnderstanding_envUnderstanding')::integer,
      (progress_record.data->'capability'->>'integrityAndTrust_relationshipBuilding')::integer,
      (progress_record.data->'capability'->>'businessUnderstanding_analyticalThinking')::integer,
      
      -- userAvatar関連
      progress_record.data->'userAvatar'->>'url',
      progress_record.data->'userAvatar'->>'type',
      
      -- celebration関連
      (progress_record.data->'celebration'->>'completed')::boolean,
      progress_record.data->'celebration'->'ritual'->>'gift',
      progress_record.data->'celebration'->'ritual'->>'type',
      progress_record.data->'celebration'->'ritual'->>'toast',
      progress_record.data->'celebration'->'ritual'->>'letter',
      progress_record.data->'celebration'->'newsArticle'->>'lead',
      progress_record.data->'celebration'->'newsArticle'->>'quote',
      progress_record.data->'celebration'->'newsArticle'->>'content',
      progress_record.data->'celebration'->'newsArticle'->>'headline',
      progress_record.data->'celebration'->'interviewAnswers'->>'work',
      progress_record.data->'celebration'->'interviewAnswers'->>'advice',
      progress_record.data->'celebration'->'interviewAnswers'->>'freeTime',
      progress_record.data->'celebration'->'interviewAnswers'->>'schedule',
      progress_record.data->'celebration'->'interviewAnswers'->>'fulfillment',
      
      -- introduction関連
      progress_record.data->'introduction'->>'name',
      progress_record.data->'introduction'->>'experience',
      progress_record.data->'introduction'->>'mentorName',
      
      -- seedPlanting関連
      progress_record.data->'seedPlanting'->>'action',
      progress_record.data->'seedPlanting'->>'customAction',
      
      -- valueArticulation関連
      progress_record.data->'valueArticulation'->>'action',
      progress_record.data->'valueArticulation'->>'result',
      progress_record.data->'valueArticulation'->>'feedback',
      progress_record.data->'valueArticulation'->>'keyword1',
      progress_record.data->'valueArticulation'->>'keyword2',
      progress_record.data->'valueArticulation'->>'keyword3',
      progress_record.data->'valueArticulation'->>'situation',
      progress_record.data->'valueArticulation'->>'valueStatement',
      
      -- internalMotivation関連
      CASE 
        WHEN jsonb_typeof(progress_record.data->'internalMotivation'->'admiredTraits') = 'array' 
        THEN ARRAY(SELECT jsonb_array_elements_text(progress_record.data->'internalMotivation'->'admiredTraits'))
        ELSE NULL
      END,
      CASE 
        WHEN jsonb_typeof(progress_record.data->'internalMotivation'->'dislikedTraits') = 'array' 
        THEN ARRAY(SELECT jsonb_array_elements_text(progress_record.data->'internalMotivation'->'dislikedTraits'))
        ELSE NULL
      END,
      
      -- motivation関連
      CASE 
        WHEN jsonb_typeof(progress_record.data->'motivation'->'selectedValues') = 'array' 
        THEN ARRAY(SELECT jsonb_array_elements_text(progress_record.data->'motivation'->'selectedValues'))
        ELSE NULL
      END,
      
      -- newBeginnings関連
      progress_record.data->'newBeginnings'->>'action',
      progress_record.data->'newBeginnings'->>'customAction',
      
      -- 元のJSONBデータ全体を保存
      progress_record.data
    )
    ON CONFLICT (worksheet_progress_id)
    DO UPDATE SET
      anonymous_id = EXCLUDED.anonymous_id,
      updated_at = EXCLUDED.updated_at,
      current_step = EXCLUDED.current_step,
      bias_change_lens = EXCLUDED.bias_change_lens,
      bias_other_change_lens = EXCLUDED.bias_other_change_lens,
      bias_work_meanings = EXCLUDED.bias_work_meanings,
      bias_thought_origins = EXCLUDED.bias_thought_origins,
      avatar_url = EXCLUDED.avatar_url,
      avatar_type = EXCLUDED.avatar_type,
      capability_leadership_lead_others = EXCLUDED.capability_leadership_lead_others,
      capability_leadership_self_growth = EXCLUDED.capability_leadership_self_growth,
      capability_leadership_org_strength = EXCLUDED.capability_leadership_org_strength,
      capability_collaboration_global_mind = EXCLUDED.capability_collaboration_global_mind,
      capability_expertise_quality_control = EXCLUDED.capability_expertise_quality_control,
      capability_collaboration_adaptability = EXCLUDED.capability_collaboration_adaptability,
      capability_expertise_knowledge_sharing = EXCLUDED.capability_expertise_knowledge_sharing,
      capability_expertise_specialized_knowledge = EXCLUDED.capability_expertise_specialized_knowledge,
      capability_integrity_and_trust_communication = EXCLUDED.capability_integrity_and_trust_communication,
      capability_collaboration_network_utilization = EXCLUDED.capability_collaboration_network_utilization,
      capability_integrity_and_trust_client_response = EXCLUDED.capability_integrity_and_trust_client_response,
      capability_business_understanding_value_creation = EXCLUDED.capability_business_understanding_value_creation,
      capability_business_understanding_env_understanding = EXCLUDED.capability_business_understanding_env_understanding,
      capability_integrity_and_trust_relationship_building = EXCLUDED.capability_integrity_and_trust_relationship_building,
      capability_business_understanding_analytical_thinking = EXCLUDED.capability_business_understanding_analytical_thinking,
      user_avatar_url = EXCLUDED.user_avatar_url,
      user_avatar_type = EXCLUDED.user_avatar_type,
      celebration_completed = EXCLUDED.celebration_completed,
      celebration_ritual_gift = EXCLUDED.celebration_ritual_gift,
      celebration_ritual_type = EXCLUDED.celebration_ritual_type,
      celebration_ritual_toast = EXCLUDED.celebration_ritual_toast,
      celebration_ritual_letter = EXCLUDED.celebration_ritual_letter,
      celebration_news_article_lead = EXCLUDED.celebration_news_article_lead,
      celebration_news_article_quote = EXCLUDED.celebration_news_article_quote,
      celebration_news_article_content = EXCLUDED.celebration_news_article_content,
      celebration_news_article_headline = EXCLUDED.celebration_news_article_headline,
      celebration_interview_work = EXCLUDED.celebration_interview_work,
      celebration_interview_advice = EXCLUDED.celebration_interview_advice,
      celebration_interview_free_time = EXCLUDED.celebration_interview_free_time,
      celebration_interview_schedule = EXCLUDED.celebration_interview_schedule,
      celebration_interview_fulfillment = EXCLUDED.celebration_interview_fulfillment,
      introduction_name = EXCLUDED.introduction_name,
      introduction_experience = EXCLUDED.introduction_experience,
      introduction_mentor_name = EXCLUDED.introduction_mentor_name,
      seed_planting_action = EXCLUDED.seed_planting_action,
      seed_planting_custom_action = EXCLUDED.seed_planting_custom_action,
      value_articulation_action = EXCLUDED.value_articulation_action,
      value_articulation_result = EXCLUDED.value_articulation_result,
      value_articulation_feedback = EXCLUDED.value_articulation_feedback,
      value_articulation_keyword1 = EXCLUDED.value_articulation_keyword1,
      value_articulation_keyword2 = EXCLUDED.value_articulation_keyword2,
      value_articulation_keyword3 = EXCLUDED.value_articulation_keyword3,
      value_articulation_situation = EXCLUDED.value_articulation_situation,
      value_articulation_value_statement = EXCLUDED.value_articulation_value_statement,
      internal_motivation_admired_traits = EXCLUDED.internal_motivation_admired_traits,
      internal_motivation_disliked_traits = EXCLUDED.internal_motivation_disliked_traits,
      motivation_selected_values = EXCLUDED.motivation_selected_values,
      new_beginnings_action = EXCLUDED.new_beginnings_action,
      new_beginnings_custom_action = EXCLUDED.new_beginnings_custom_action,
      raw_data = EXCLUDED.raw_data;
END;
$$ LANGUAGE plpgsql;

-- 既存のトリガーが存在するか確認し、存在しない場合は作成
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'trigger_sync_worksheet_analytics'
    ) THEN
        CREATE TRIGGER trigger_sync_worksheet_analytics
        AFTER INSERT OR UPDATE OR DELETE ON worksheet_progress
        FOR EACH ROW
        EXECUTE FUNCTION sync_worksheet_analytics();
    END IF;
END
$$;

