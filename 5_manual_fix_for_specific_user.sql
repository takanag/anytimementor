-- このSQLをSupabaseのSQLエディタで実行して、特定のユーザーのデータを手動で修正します

-- 特定のユーザー（anon_knzp2aa384h_m84onhkn）のデータを手動で修正
UPDATE mentoring_analytics
SET 
  values_description = '特定の値を手動で設定',
  values_reflection = '特定の値を手動で設定'
WHERE anonymous_id = 'anon_knzp2aa384h_m84onhkn';

-- 修正されたデータを確認
SELECT 
  anonymous_id, 
  values_description,
  values_reflection
FROM mentoring_analytics
WHERE anonymous_id = 'anon_knzp2aa384h_m84onhkn';

