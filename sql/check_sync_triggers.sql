-- 既存のトリガーを確認
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table IN ('worksheet_data_sync', 'worksheet_progress')
ORDER BY event_object_table, trigger_name;

