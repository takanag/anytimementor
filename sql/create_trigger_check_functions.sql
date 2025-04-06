-- トリガーの存在を確認する関数
CREATE OR REPLACE FUNCTION check_trigger_exists(trigger_name TEXT, table_name TEXT)
RETURNS JSONB AS $$
DECLARE
    result BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.triggers
        WHERE trigger_name = check_trigger_exists.trigger_name
        AND event_object_table = check_trigger_exists.table_name
    ) INTO result;
    
    RETURN jsonb_build_object('exists', result);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 関数定義を取得する関数
CREATE OR REPLACE FUNCTION get_function_definition(function_name TEXT)
RETURNS JSONB AS $$
DECLARE
    func_def TEXT;
BEGIN
    SELECT pg_get_functiondef(oid)
    FROM pg_proc
    WHERE proname = get_function_definition.function_name
    LIMIT 1
    INTO func_def;
    
    RETURN jsonb_build_object('definition', func_def);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

