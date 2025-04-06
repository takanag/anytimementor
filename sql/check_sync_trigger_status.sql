-- トリガーの存在を確認
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

-- トリガー関数の定義を確認
SELECT 
    pg_get_functiondef(oid) 
FROM 
    pg_proc 
WHERE 
    proname = 'sync_worksheet_data_to_analytics';

-- 最近のトリガー実行ログを確認（もし存在すれば）
SELECT * FROM pg_stat_activity 
WHERE query LIKE '%sync_worksheet_data_to_analytics%'
ORDER BY query_start DESC
LIMIT 5;

-- worksheet_data_syncテーブルの最新データを確認
SELECT 
    id, 
    anonymous_id, 
    created_at, 
    updated_at, 
    data->>'currentStep' as current_step
FROM 
    worksheet_data_sync
ORDER BY 
    updated_at DESC
LIMIT 5;

-- worksheet_analyticsテーブルの最新データを確認
SELECT 
    id, 
    anonymous_id, 
    created_at, 
    updated_at, 
    current_step
FROM 
    worksheet_analytics
ORDER BY 
    updated_at DESC
LIMIT 5;

