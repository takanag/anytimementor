-- テーブルの列情報を取得
SELECT 
    column_name, 
    data_type, 
    character_maximum_length, 
    column_default, 
    is_nullable
FROM 
    information_schema.columns
WHERE 
    table_name = 'worksheet_analytics'
ORDER BY 
    ordinal_position;

-- テーブルの制約情報を取得
SELECT
    con.conname AS constraint_name,
    con.contype AS constraint_type,
    CASE
        WHEN con.contype = 'p' THEN 'PRIMARY KEY'
        WHEN con.contype = 'f' THEN 'FOREIGN KEY'
        WHEN con.contype = 'u' THEN 'UNIQUE'
        WHEN con.contype = 'c' THEN 'CHECK'
        ELSE con.contype::text
    END AS constraint_type_desc,
    pg_get_constraintdef(con.oid) AS constraint_definition
FROM
    pg_constraint con
JOIN
    pg_class rel ON rel.oid = con.conrelid
JOIN
    pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE
    rel.relname = 'worksheet_analytics';

-- テーブルのインデックス情報を取得
SELECT
    idx.indexname AS index_name,
    idx.indexdef AS index_definition
FROM
    pg_indexes idx
WHERE
    idx.tablename = 'worksheet_analytics';

-- テーブルに関連するトリガー情報を取得
SELECT
    trig.tgname AS trigger_name,
    pg_get_triggerdef(trig.oid) AS trigger_definition
FROM
    pg_trigger trig
JOIN
    pg_class rel ON rel.oid = trig.tgrelid
WHERE
    rel.relname = 'worksheet_analytics';

-- テーブルに関連する関数情報を取得
SELECT
    p.proname AS function_name,
    pg_get_functiondef(p.oid) AS function_definition
FROM
    pg_proc p
JOIN
    pg_namespace n ON p.pronamespace = n.oid
WHERE
    p.proname LIKE '%worksheet_analytics%';

