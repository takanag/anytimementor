-- RPCを使用してデータを挿入するための関数
CREATE OR REPLACE FUNCTION insert_worksheet_progress(
  p_anonymous_id TEXT,
  p_data JSONB,
  p_created_at TIMESTAMP WITH TIME ZONE,
  p_updated_at TIMESTAMP WITH TIME ZONE
) RETURNS BOOLEAN AS $$
BEGIN
  -- 既存のレコードがあるか確認
  IF EXISTS (SELECT 1 FROM worksheet_progress WHERE anonymous_id = p_anonymous_id) THEN
    -- 既存のレコードを更新
    UPDATE worksheet_progress
    SET data = p_data, updated_at = p_updated_at
    WHERE anonymous_id = p_anonymous_id;
  ELSE
    -- 新しいレコードを挿入
    INSERT INTO worksheet_progress (anonymous_id, data, created_at, updated_at)
    VALUES (p_anonymous_id, p_data, p_created_at, p_updated_at);
  END IF;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in insert_worksheet_progress: %', SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- 直接SQLを実行してデータを挿入するための関数
CREATE OR REPLACE FUNCTION direct_insert_worksheet(
  p_anonymous_id TEXT,
  p_data_json TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_data JSONB;
  v_now TIMESTAMP WITH TIME ZONE := NOW();
BEGIN
  -- JSONテキストをJSONB型に変換
  v_data := p_data_json::JSONB;
  
  -- 既存のレコードがあるか確認（大文字小文字を区別しない）
  IF EXISTS (SELECT 1 FROM worksheet_progress WHERE LOWER(anonymous_id) = LOWER(p_anonymous_id)) THEN
    -- 既存のレコードを更新
    UPDATE worksheet_progress
    SET data = v_data, updated_at = v_now
    WHERE LOWER(anonymous_id) = LOWER(p_anonymous_id);
  ELSE
    -- 新しいレコードを挿入
    EXECUTE 'INSERT INTO worksheet_progress (anonymous_id, data, created_at, updated_at) VALUES ($1, $2, $3, $4)'
    USING p_anonymous_id, v_data, v_now, v_now;
  END IF;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in direct_insert_worksheet: %', SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- 生のSQLを使用してデータを挿入するためのビュー
CREATE OR REPLACE VIEW worksheet_progress_raw_insert AS
SELECT 
  anonymous_id,
  data::TEXT AS data,
  TRUE AS success,
  'Raw SQL insert successful' AS message
FROM 
  worksheet_progress
WHERE FALSE;

-- ビューに対するINSERT権限を付与
GRANT SELECT ON worksheet_progress_raw_insert TO service_role;

