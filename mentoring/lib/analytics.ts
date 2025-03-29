// エラーハンドリングを強化し、デバッグログを追加

import { supabase } from "./supabase"
import { getSupabaseClient } from "@/lib/supabase"

// メンタリングセッションの集計データを取得する関数
export async function getMentoringAnalytics() {
  try {
    console.log("Starting to fetch mentoring analytics...")

    // 総セッション数を取得
    const { count: totalCount, error: countError } = await supabase
      .from("mentoring_analytics")
      .select("*", { count: "exact", head: true })

    if (countError) {
      console.error("Error fetching total count:", countError)
      throw countError
    }

    console.log("Total count fetched:", totalCount)

    // 平均値を個別に取得
    const { data: avgData, error: avgError } = await supabase.from("mentoring_analytics").select(`
        enjoyment_level,
        leadership_score,
        communication_score,
        technical_score,
        problem_solving_score,
        creativity_score
      `)

    if (avgError) {
      console.error("Error fetching average data:", avgError)
      throw avgError
    }

    console.log("Average data fetched, records:", avgData?.length)

    // 手動で平均を計算
    const summary = {
      total_count: totalCount || 0,
      avg_enjoyment: calculateAverage(avgData, "enjoyment_level"),
      avg_leadership: calculateAverage(avgData, "leadership_score"),
      avg_communication: calculateAverage(avgData, "communication_score"),
      avg_technical: calculateAverage(avgData, "technical_score"),
      avg_problem_solving: calculateAverage(avgData, "problem_solving_score"),
      avg_creativity: calculateAverage(avgData, "creativity_score"),
    }

    console.log("Summary calculated:", summary)

    // 完了率の集計 - 各ステップの完了数を取得
    const { data: completionData, error: completionError } = await supabase
      .from("mentoring_analytics")
      .select("completed_step")
      .not("completed_step", "is", null)

    if (completionError) {
      console.error("Error fetching completion data:", completionError)
      throw completionError
    }

    console.log("Completion data fetched, records:", completionData?.length)

    // ステップごとの完了数を集計
    const stepCounts = completionData.reduce((acc: Record<number, number>, item: any) => {
      const step = item.completed_step
      acc[step] = (acc[step] || 0) + 1
      return acc
    }, {})

    const formattedCompletionData = Object.entries(stepCounts).map(([step, count]) => ({
      completed_step: Number.parseInt(step),
      count,
    }))

    console.log("Formatted completion data:", formattedCompletionData)

    // 仕事の意味の集計 - カスタムRPC関数を使用
    let workMeaningsData = []
    try {
      console.log("Fetching work meanings data...")
      const { data, error } = await supabase.rpc("count_array_values", {
        column_name: "work_meanings",
        table_name: "mentoring_analytics",
      })

      if (!error) {
        workMeaningsData = data || []
        console.log("Work meanings data fetched:", workMeaningsData)
      } else {
        console.error("Error fetching work meanings:", error)
        workMeaningsData = []
      }
    } catch (e) {
      console.error("RPC error for work_meanings:", e)
      workMeaningsData = []
    }

    // 考えの由来の集計 - カスタムRPC関数を使用
    let thoughtOriginsData = []
    try {
      console.log("Fetching thought origins data...")
      const { data, error } = await supabase.rpc("count_array_values", {
        column_name: "thought_origins",
        table_name: "mentoring_analytics",
      })

      if (!error) {
        thoughtOriginsData = data || []
        console.log("Thought origins data fetched:", thoughtOriginsData)
      } else {
        console.error("Error fetching thought origins:", error)
        thoughtOriginsData = []
      }
    } catch (e) {
      console.error("RPC error for thought_origins:", e)
      thoughtOriginsData = []
    }

    // 種まきアクションの集計 - 手動で集計
    console.log("Fetching seed planting actions...")
    const { data: seedPlantingRawData, error: seedPlantingError } = await supabase
      .from("mentoring_analytics")
      .select("seed_planting_action, seed_planting_custom")
      .not("seed_planting_action", "is", null)

    let seedPlantingData: any[] = []

    if (seedPlantingError) {
      console.error("Error fetching seed planting actions:", seedPlantingError)
      // エラーをスローせず、空の配列で続行
      console.log("Continuing with empty seed planting data")
    } else {
      // デバッグ用のログ出力
      console.log("Seed planting raw data:", seedPlantingRawData)

      // 手動で集計
      const seedPlantingCount = seedPlantingRawData.reduce((acc: Record<string, number>, item: any) => {
        const action = item.seed_planting_action
        if (action) {
          acc[action] = (acc[action] || 0) + 1
        }
        return acc
      }, {})

      seedPlantingData = Object.entries(seedPlantingCount)
        .map(([action, count]) => ({ action, count }))
        .sort((a, b) => b.count - a.count)

      // デバッグ用のログ出力
      console.log("Seed planting data:", seedPlantingData)
    }

    // メガネの変え方の集計 - 手動で集計
    console.log("Fetching change lens data...")
    const { data: changeLensRawData, error: changeLensError } = await supabase
      .from("mentoring_analytics")
      .select("change_lens")
      .not("change_lens", "is", null)

    let changeLensData: any[] = []

    if (changeLensError) {
      console.error("Error fetching change lens data:", changeLensError)
      // エラーをスローせず、空の配列で続行
    } else {
      // 手動で集計
      const changeLensCount = changeLensRawData.reduce((acc: Record<string, number>, item: any) => {
        const lens = item.change_lens
        if (lens) {
          acc[lens] = (acc[lens] || 0) + 1
        }
        return acc
      }, {})

      changeLensData = Object.entries(changeLensCount)
        .map(([change_lens, count]) => ({ change_lens, count }))
        .sort((a, b) => b.count - a.count)

      console.log("Change lens data:", changeLensData)
    }

    const result = {
      summary,
      completion: formattedCompletionData,
      workMeanings: workMeaningsData,
      thoughtOrigins: thoughtOriginsData,
      changeLens: changeLensData,
      seedPlanting: seedPlantingData, // 種まきアクションのデータを追加
    }

    console.log("Analytics data compilation complete")
    return result
  } catch (error) {
    console.error("Error fetching mentoring analytics:", error)
    throw error
  }
}

// 平均値を計算するヘルパー関数
function calculateAverage(data: any[], field: string): number {
  if (!data || data.length === 0) return 0

  const validValues = data.map((item) => item[field]).filter((val) => val !== null && val !== undefined)

  if (validValues.length === 0) return 0

  const sum = validValues.reduce((acc, val) => acc + val, 0)
  return sum / validValues.length
}

// 特定の期間のメンタリングデータを取得する関数
export async function getMentoringAnalyticsByDateRange(startDate: string, endDate: string) {
  try {
    const { data, error } = await supabase
      .from("mentoring_analytics")
      .select("*")
      .gte("created_at", startDate)
      .lte("created_at", endDate)

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error fetching mentoring analytics by date range:", error)
    throw error
  }
}

// 配列カラムの値をカウントするためのストアドプロシージャ
// この関数はSupabaseのSQLエディタで実行する必要があります
export const createArrayCountFunction = `
CREATE OR REPLACE FUNCTION count_array_values(table_name text, column_name text)
RETURNS TABLE(value text, count bigint) AS $$
BEGIN
RETURN QUERY EXECUTE format('
  SELECT unnest(%I) as value, COUNT(*) as count
  FROM %I
  WHERE %I IS NOT NULL
  GROUP BY value
  ORDER BY count DESC
', column_name, table_name, column_name);
END;
$$ LANGUAGE plpgsql;
`

// 分析データを保存する関数
export async function saveMentoringAnalytics(data: {
  anonymous_id: string
  event_type: string
  event_data?: any
  step?: number
}): Promise<{ success: boolean; message?: string }> {
  try {
    const supabase = getSupabaseClient()

    if (!supabase) {
      console.error("Supabaseクライアントの初期化に失敗しました。")
      return { success: false, message: "Supabaseクライアントの初期化に失敗しました。" }
    }

    const { error } = await supabase.from("mentoring_analytics").insert({
      anonymous_id: data.anonymous_id,
      event_type: data.event_type,
      event_data: data.event_data || {},
      step: data.step,
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error saving analytics:", error)
      return { success: false, message: `分析データの保存中にエラーが発生しました: ${error.message}` }
    }

    return { success: true }
  } catch (error: any) {
    console.error("Error in saveMentoringAnalytics:", error)
    return { success: false, message: `予期しないエラーが発生しました: ${error.message}` }
  }
}

