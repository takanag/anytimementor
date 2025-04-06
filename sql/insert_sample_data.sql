-- サンプルデータの挿入
INSERT INTO worksheet_progress (anonymous_id, data, updated_at)
VALUES 
    ('anon_i5cm8xs9k9mpzuw1d5fhk', 
     jsonb_build_object(
         'current_step', 1,
         'answers', jsonb_build_object(
             'question1', 'サンプル回答1',
             'question2', 'サンプル回答2'
         )
     ),
     NOW()
    )
ON CONFLICT (anonymous_id) 
DO UPDATE SET
    data = jsonb_build_object(
         'current_step', 1,
         'answers', jsonb_build_object(
             'question1', 'サンプル回答1（更新）',
             'question2', 'サンプル回答2（更新）'
         )
     ),
    updated_at = NOW();

-- 挿入結果の確認
SELECT * FROM worksheet_progress WHERE anonymous_id = 'anon_i5cm8xs9k9mpzuw1d5fhk';

