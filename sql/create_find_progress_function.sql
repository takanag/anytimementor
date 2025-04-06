-- JSONBフィールド内のanonymous_idで検索するための関数
CREATE OR REPLACE FUNCTION find_progress_by_anonymous_id(search_anonymous_id TEXT)
RETURNS TABLE (
  id UUID,
  data JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT wp.id, wp.data
  FROM worksheet_progress wp
  WHERE wp.data->>'anonymous_id' = search_anonymous_id;
END;
$$ LANGUAGE plpgsql;

