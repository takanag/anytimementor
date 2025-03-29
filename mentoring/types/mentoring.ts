// 週次メンタリングのデータ型定義

// メンタリングのステータス
export type MentoringStatus = "completed" | "skipped" | "in_progress"

// 内発的動機チェックの回答選択肢
export type InternalMotivationRating =
  | "very_satisfied"
  | "somewhat_satisfied"
  | "not_very_satisfied"
  | "not_satisfied_at_all"

// 先週のアクション振り返りの回答選択肢
export type PreviousActionRating = "fully_executed" | "partially_executed" | "attempted_but_failed" | "forgotten"

// 週次メンタリングのデータ構造
export interface WeeklyMentoringData {
  // 1. ウェルカム＆スタート
  status: MentoringStatus
  skip_reason?: string

  // 2. 今週の「内発的動機」チェック
  internal_motivation_rating?: InternalMotivationRating
  internal_motivation_comment?: string

  // 3. 先週の「小さな一歩」を振り返り
  previous_action_rating?: PreviousActionRating
  previous_action_comment?: string

  // 4. 今週の「価値発揮」を思い出す
  value_expression_rating?: number // 0-10のスライダー値
  value_expression_comment?: string

  // 5. 来週の「アクション」を決める
  next_action_1?: string
  next_action_2?: string
  next_action_3?: string

  // 6. いまの仕事・チームへの満足度
  job_continuation_rating?: number // 0-10のスライダー値
  team_recommendation_rating?: number // 0-10のスライダー値
  satisfaction_comment?: string

  // メタデータ
  created_at: string
  updated_at: string
}

// メンタリングセッションの保存データ
export interface MentoringSession {
  anonymous_id: string
  session_id: string
  data: WeeklyMentoringData
  created_at: string
  updated_at: string
}

