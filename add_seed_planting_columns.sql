-- mentoring_analyticsテーブルに必要なカラムを追加するスクリプト
-- このSQLをSupabaseのSQLエディタで実行してください

-- テーブル構造を確認
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'mentoring_analytics'
ORDER BY ordinal_position;

-- seed_planting_actionとseed_planting_customカラムを追加
ALTER TABLE mentoring_analytics 
ADD COLUMN IF NOT EXISTS seed_planting_action TEXT,
ADD COLUMN IF NOT EXISTS seed_planting_custom TEXT;

-- カラムが追加されたことを確認
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'mentoring_analytics' 
AND column_name IN ('seed_planting_action', 'seed_planting_custom')
ORDER BY ordinal_position;

-- 追加後、トリガー関数を修正するスクリプトを実行してください

