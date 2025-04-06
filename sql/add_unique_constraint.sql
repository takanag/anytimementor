-- worksheet_analyticsテーブルのanonymous_idカラムに一意性制約を追加
ALTER TABLE worksheet_analytics
ADD CONSTRAINT unique_anonymous_id UNIQUE (anonymous_id);

