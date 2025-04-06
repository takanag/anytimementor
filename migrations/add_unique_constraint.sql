-- worksheet_progressテーブルに一意制約を追加
ALTER TABLE worksheet_progress 
ADD CONSTRAINT unique_worksheet_user_constraint 
UNIQUE (worksheet_id, user_id);

