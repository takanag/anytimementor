-- テーブルのカラム情報を取得
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM 
    information_schema.columns
WHERE 
    table_name = 'worksheet_progress'
ORDER BY 
    ordinal_position;

-- テーブルの制約情報を取得
SELECT
    con.conname AS constraint_name,
    con.contype AS constraint_type,
    pg_get_constraintdef(con.oid) AS constraint_definition
FROM
    pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE
    rel.relname = 'worksheet_progress'
    AND nsp.nspname = 'public';

-- テーブルのインデックス情報を取得
SELECT
    indexname,
    indexdef
FROM
    pg_indexes
WHERE
    tablename = 'worksheet_progress'
    AND schemaname = 'public';

-- サンプルデータを取得（最新の5件）
SELECT 
    id, 
    anonymous_id, 
    data, 
    created_at, 
    updated_at
FROM 
    worksheet_progress
ORDER BY 
    created_at DESC
LIMIT 5;

-- anonymous_idカラムの値の例を取得
SELECT 
    anonymous_id, 
    COUNT(*) as record_count
FROM 
    worksheet_progress
GROUP BY 
    anonymous_id
ORDER BY 
    record_count DESC
LIMIT 10;

