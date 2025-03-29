import { supabase } from "./supabase"
import { getAnonymousId } from "./anonymous-id"

/**
 * テスト用のワークシートデータを作成する
 */
export async function createTestWorksheetData(): Promise<{ success: boolean; message?: string }> {
  try {
    const anonymousId = getAnonymousId()
    if (!anonymousId) {
      return { success: false, message: "匿名IDが見つかりません" }
    }

    console.log("テストデータ作成開始: 匿名ID", anonymousId)

    const now = new Date().toISOString()

    // サンプルデータを作成 - currentStepを数値に変更
    const sampleData = {
      introduction: {
        name: "テストユーザー",
        experience: "5年以上",
        mentorName: "テストメンター",
      },
      bias: {
        changeLens: "ポジティブ",
        otherChangeLens: "",
        workMeanings: ["自己成長", "社会貢献"],
        thoughtOrigins: ["過去の経験", "学び"],
      },
      internalMotivation: {
        admiredTraits: ["創造性", "忍耐力", "共感力"],
        dislikedTraits: ["怠惰", "不誠実", "自己中心的"],
      },
      motivation: {
        values: ["成長", "貢献", "自律"],
      },
      newBeginnings: {
        activity: "新しいスキルを学ぶ",
        customActivity: "プログラミング言語の習得",
      },
      seedPlanting: {
        action: "定期的な振り返り",
        customAction: "週次の目標設定と振り返り",
      },
      valueArticulation: {
        action: "価値観の明確化",
        result: "自分の価値観を再確認できた",
        feedback: "とても有意義な時間だった",
        keyword1: "成長",
        keyword2: "貢献",
        keyword3: "自律",
        situation: "チームでの困難なプロジェクト",
        valueStatement: "私は常に成長し、社会に貢献することを大切にしています",
      },
    }

    // worksheet_data_syncテーブルにデータを挿入
    const { error: insertError } = await supabase.from("worksheet_data_sync").insert({
      anonymous_id: anonymousId,
      created_at: now,
      updated_at: now,
      current_step: 6, // valueArticulationに対応する数値
      data: sampleData,
    })

    if (insertError) {
      console.error("テストデータの作成に失敗しました:", insertError)
      return { success: false, message: `テストデータの作成に失敗しました: ${insertError.message}` }
    }

    console.log("テストデータが正常に作成されました")
    return { success: true, message: "テストデータが正常に作成されました" }
  } catch (error) {
    console.error("テストデータの作成中にエラーが発生しました:", error)
    return {
      success: false,
      message:
        error instanceof Error
          ? `テストデータの作成中にエラーが発生しました: ${error.message}`
          : "テストデータの作成中に不明なエラーが発生しました",
    }
  }
}

/**
 * 現在の匿名IDのデータ存在確認
 */
export async function checkDataExists() {
  try {
    const anonymousId = getAnonymousId()
    if (!anonymousId) {
      return {
        success: false,
        error: "匿名IDが見つかりません",
        worksheetDataExists: false,
        analyticsDataExists: false,
      }
    }

    console.log("データ存在確認開始: 匿名ID", anonymousId)

    // worksheet_data_syncテーブルのデータ確認
    const { data: worksheetData, error: worksheetError } = await supabase
      .from("worksheet_data_sync")
      .select("id")
      .eq("anonymous_id", anonymousId)
      .limit(1)

    if (worksheetError) {
      console.error("ワークシートデータの確認に失敗しました:", worksheetError)
      return {
        success: false,
        error: `ワークシートデータの確認に失敗しました: ${worksheetError.message}`,
        worksheetDataExists: false,
        analyticsDataExists: false,
      }
    }

    // worksheet_analyticsテーブルのデータ確認
    const { data: analyticsData, error: analyticsError } = await supabase
      .from("worksheet_analytics")
      .select("id")
      .eq("anonymous_id", anonymousId)
      .limit(1)

    if (analyticsError) {
      console.error("分析データの確認に失敗しました:", analyticsError)
      return {
        success: false,
        error: `分析データの確認に失敗しました: ${analyticsError.message}`,
        worksheetDataExists: worksheetData && worksheetData.length > 0,
        analyticsDataExists: false,
      }
    }

    return {
      success: true,
      worksheetDataExists: worksheetData && worksheetData.length > 0,
      analyticsDataExists: analyticsData && analyticsData.length > 0,
    }
  } catch (error) {
    console.error("データ存在確認中にエラーが発生しました:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "不明なエラー",
      worksheetDataExists: false,
      analyticsDataExists: false,
    }
  }
}

/**
 * worksheet_data_syncテーブルからworksheet_analyticsテーブルへデータを手動で同期する
 */
export async function syncWorksheetAnalytics(): Promise<{ success: boolean; message?: string }> {
  try {
    const anonymousId = getAnonymousId()
    if (!anonymousId) {
      return { success: false, message: "匿名IDが見つかりません" }
    }

    console.log("同期開始: 匿名ID", anonymousId)

    // ワークシートデータを取得
    const { data, error } = await supabase
      .from("worksheet_data_sync")
      .select("*")
      .eq("anonymous_id", anonymousId)
      .order("created_at", { ascending: false })
      .limit(1)

    if (error) {
      console.error("ワークシートデータの取得に失敗しました:", error)
      return { success: false, message: `ワークシートデータの取得に失敗しました: ${error.message}` }
    }

    // データが存在しない場合
    if (!data || data.length === 0) {
      console.log("ワークシートデータが見つかりませんでした")
      return { success: false, message: "ワークシートデータが見つかりませんでした" }
    }

    console.log("ワークシートデータを取得しました:", data.length, "件")

    // 最新のデータを使用
    const latestData = data[0]

    // ワークシートデータを分析データに同期
    const { error: syncError } = await supabase.from("worksheet_analytics").upsert(
      {
        anonymous_id: latestData.anonymous_id,
        created_at: latestData.created_at,
        updated_at: latestData.updated_at,
        current_step: latestData.current_step, // 直接カラムから取得
        raw_data: latestData.data,

        // 導入部分
        introduction_name: (latestData.data as any)?.introduction?.name,
        introduction_experience: (latestData.data as any)?.introduction?.experience,
        introduction_mentor_name: (latestData.data as any)?.introduction?.mentorName,

        // バイアス関連
        bias_change_lens: (latestData.data as any)?.bias?.changeLens,
        bias_other_change_lens: (latestData.data as any)?.bias?.otherChangeLens,
        bias_work_meanings: (latestData.data as any)?.bias?.workMeanings,
        bias_thought_origins: (latestData.data as any)?.bias?.thoughtOrigins,

        // 内発的動機
        internal_motivation_admired_traits: (latestData.data as any)?.internalMotivation?.admiredTraits,
        internal_motivation_disliked_traits: (latestData.data as any)?.internalMotivation?.dislikedTraits,

        // モチベーション
        motivation_selected_values: (latestData.data as any)?.motivation?.values,

        // 新しい始まり
        new_beginnings_action: (latestData.data as any)?.newBeginnings?.activity,
        new_beginnings_custom_action: (latestData.data as any)?.newBeginnings?.customActivity,

        // シードプランティング
        seed_planting_action: (latestData.data as any)?.seedPlanting?.action,
        seed_planting_custom_action: (latestData.data as any)?.seedPlanting?.customAction,

        // 価値観の明確化
        value_articulation_action: (latestData.data as any)?.valueArticulation?.action,
        value_articulation_result: (latestData.data as any)?.valueArticulation?.result,
        value_articulation_feedback: (latestData.data as any)?.valueArticulation?.feedback,
        value_articulation_keyword1: (latestData.data as any)?.valueArticulation?.keyword1,
        value_articulation_keyword2: (latestData.data as any)?.valueArticulation?.keyword2,
        value_articulation_keyword3: (latestData.data as any)?.valueArticulation?.keyword3,
        value_articulation_situation: (latestData.data as any)?.valueArticulation?.situation,
        value_articulation_value_statement: (latestData.data as any)?.valueArticulation?.valueStatement,
      },
      { onConflict: "anonymous_id" },
    )

    if (syncError) {
      console.error("分析データへの同期中にエラーが発生しました:", syncError)
      return { success: false, message: `分析データへの同期中にエラーが発生しました: ${syncError.message}` }
    }

    console.log("データが正常に同期されました")
    return { success: true, message: "データが正常に同期されました" }
  } catch (error) {
    console.error("ワークシートデータの同期中にエラーが発生しました:", error)
    return {
      success: false,
      message:
        error instanceof Error
          ? `ワークシートデータの同期中にエラーが発生しました: ${error.message}`
          : "ワークシートデータの同期中に不明なエラーが発生しました",
    }
  }
}

/**
 * 現在の匿名IDのワークシート分析データを取得する
 */
export async function getWorksheetAnalytics() {
  try {
    const anonymousId = getAnonymousId()
    if (!anonymousId) {
      console.error("匿名IDが見つかりません")
      return { success: false, error: "匿名IDが見つかりません", data: null }
    }

    console.log("分析データ取得開始: 匿名ID", anonymousId)

    // .single()の代わりに、最新のデータを取得するために順序付けと制限を使用
    const { data, error } = await supabase
      .from("worksheet_analytics")
      .select("*")
      .eq("anonymous_id", anonymousId)
      .order("updated_at", { ascending: false })
      .limit(1)

    if (error) {
      console.error("分析データの取得に失敗しました:", error)
      return { success: false, error: error.message, data: null }
    }

    // データが存在しない場合は空のオブジェクトを返す
    if (!data || data.length === 0) {
      console.log("分析データが見つかりませんでした")
      return { success: true, data: null }
    }

    console.log("分析データを取得しました")
    // 最初の（最新の）行を返す
    return { success: true, data: data[0] }
  } catch (error) {
    console.error("分析データの取得中にエラーが発生しました:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "不明なエラー",
      data: null,
    }
  }
}

/**
 * トリガー関数の状態を確認する
 */
export async function checkTriggerStatus(): Promise<{
  success: boolean
  message?: string
  triggerExists?: boolean
  triggerFunction?: string
}> {
  try {
    // トリガーの存在を確認
    const { data: triggerData, error: triggerError } = await supabase.rpc("check_trigger_exists", {
      trigger_name: "trigger_sync_worksheet_data_to_analytics",
      table_name: "worksheet_data_sync",
    })

    if (triggerError) {
      console.error("トリガー確認中にエラーが発生しました:", triggerError)
      return {
        success: false,
        message: `トリガー確認中にエラーが発生しました: ${triggerError.message}`,
        triggerExists: false,
      }
    }

    // トリガー関数の定義を取得
    const { data: functionData, error: functionError } = await supabase.rpc("get_function_definition", {
      function_name: "sync_worksheet_data_to_analytics",
    })

    if (functionError) {
      console.error("トリガー関数定義の取得中にエラーが発生しました:", functionError)
      return {
        success: false,
        message: `トリガー関数定義の取得中にエラーが発生しました: ${functionError.message}`,
        triggerExists: triggerData && triggerData.exists,
      }
    }

    return {
      success: true,
      triggerExists: triggerData && triggerData.exists,
      triggerFunction: functionData && functionData.definition,
      message: triggerData && triggerData.exists ? "トリガーが存在します" : "トリガーが存在しません",
    }
  } catch (error) {
    console.error("トリガー状態確認中にエラーが発生しました:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "不明なエラー",
    }
  }
}

/**
 * トリガー関数を再作成する
 */
export async function recreateTrigger(): Promise<{ success: boolean; message?: string }> {
  try {
    // SQL実行関数を呼び出す
    const { error } = await supabase.rpc("execute_sql", {
      sql_statement: `
        -- トリガー関数を再作成
        CREATE OR REPLACE FUNCTION sync_worksheet_data_to_analytics()
        RETURNS TRIGGER AS $$
        BEGIN
            -- worksheet_analytics テーブルに UPSERT
            INSERT INTO worksheet_analytics (
                anonymous_id,
                created_at,
                updated_at,
                current_step,
                raw_data,
                
                -- 導入部分
                introduction_name,
                introduction_experience,
                introduction_mentor_name,
                
                -- バイアス関連
                bias_change_lens,
                bias_other_change_lens,
                bias_work_meanings,
                bias_thought_origins,
                
                -- 内発的動機
                internal_motivation_admired_traits,
                internal_motivation_disliked_traits,
                
                -- モチベーション
                motivation_selected_values,
                
                -- 新しい始まり
                new_beginnings_action,
                new_beginnings_custom_action,
                
                -- シードプランティング
                seed_planting_action,
                seed_planting_custom_action,
                
                -- 価値観の明確化
                value_articulation_action,
                value_articulation_result,
                value_articulation_feedback,
                value_articulation_keyword1,
                value_articulation_keyword2,
                value_articulation_keyword3,
                value_articulation_situation,
                value_articulation_value_statement
            )
            VALUES (
                NEW.anonymous_id,
                NEW.created_at,
                NEW.updated_at,
                NEW.current_step,  -- 修正: JSONからではなく直接カラムから取得
                NEW.data,
                
                -- 導入部分
                (NEW.data->'introduction'->>'name'),
                (NEW.data->'introduction'->>'experience'),
                (NEW.data->'introduction'->>'mentorName'),
                
                -- バイアス関連
                (NEW.data->'bias'->>'changeLens'),
                (NEW.data->'bias'->>'otherChangeLens'),
                (SELECT ARRAY(SELECT jsonb_array_elements_text(NEW.data->'bias'->'workMeanings')) WHERE NEW.data->'bias'->'workMeanings' IS NOT NULL),
                (SELECT ARRAY(SELECT jsonb_array_elements_text(NEW.data->'bias'->'thoughtOrigins')) WHERE NEW.data->'bias'->'thoughtOrigins' IS NOT NULL),
                
                -- 内発的動機
                (SELECT ARRAY(SELECT jsonb_array_elements_text(NEW.data->'internalMotivation'->'admiredTraits')) WHERE NEW.data->'internalMotivation'->'admiredTraits' IS NOT NULL),
                (SELECT ARRAY(SELECT jsonb_array_elements_text(NEW.data->'internalMotivation'->'dislikedTraits')) WHERE NEW.data->'internalMotivation'->'dislikedTraits' IS NOT NULL),
                
                -- モチベーション
                (SELECT ARRAY(SELECT jsonb_array_elements_text(NEW.data->'motivation'->'values')) WHERE NEW.data->'motivation'->'values' IS NOT NULL),
                
                -- 新しい始まり
                (NEW.data->'newBeginnings'->>'activity'),
                (NEW.data->'newBeginnings'->>'customActivity'),
                
                -- シードプランティング
                (NEW.data->'seedPlanting'->>'action'),
                (NEW.data->'seedPlanting'->>'customAction'),
                
                -- 価値観の明確化
                (NEW.data->'valueArticulation'->>'action'),
                (NEW.data->'valueArticulation'->>'result'),
                (NEW.data->'valueArticulation'->>'feedback'),
                (NEW.data->'valueArticulation'->>'keyword1'),
                (NEW.data->'valueArticulation'->>'keyword2'),
                (NEW.data->'valueArticulation'->>'keyword3'),
                (NEW.data->'valueArticulation'->>'situation'),
                (NEW.data->'valueArticulation'->>'valueStatement')
            )
            ON CONFLICT (anonymous_id) 
            DO UPDATE SET
                updated_at = EXCLUDED.updated_at,
                current_step = EXCLUDED.current_step,
                raw_data = EXCLUDED.raw_data,
                
                -- 導入部分
                introduction_name = EXCLUDED.introduction_name,
                introduction_experience = EXCLUDED.introduction_experience,
                introduction_mentor_name = EXCLUDED.introduction_mentor_name,
                
                -- バイアス関連
                bias_change_lens = EXCLUDED.bias_change_lens,
                bias_other_change_lens = EXCLUDED.bias_other_change_lens,
                bias_work_meanings = EXCLUDED.bias_work_meanings,
                bias_thought_origins = EXCLUDED.bias_thought_origins,
                
                -- 内発的動機
                internal_motivation_admired_traits = EXCLUDED.internal_motivation_admired_traits,
                internal_motivation_disliked_traits = EXCLUDED.internal_motivation_disliked_traits,
                
                -- モチベーション
                motivation_selected_values = EXCLUDED.motivation_selected_values,
                
                -- 新しい始まり
                new_beginnings_action = EXCLUDED.new_beginnings_action,
                new_beginnings_custom_action = EXCLUDED.new_beginnings_custom_action,
                
                -- シードプランティング
                seed_planting_action = EXCLUDED.seed_planting_action,
                seed_planting_custom_action = EXCLUDED.seed_planting_custom_action,
                
                -- 価値観の明確化
                value_articulation_action = EXCLUDED.value_articulation_action,
                value_articulation_result = EXCLUDED.value_articulation_result,
                value_articulation_feedback = EXCLUDED.value_articulation_feedback,
                value_articulation_keyword1 = EXCLUDED.value_articulation_keyword1,
                value_articulation_keyword2 = EXCLUDED.value_articulation_keyword2,
                value_articulation_keyword3 = EXCLUDED.value_articulation_keyword3,
                value_articulation_situation = EXCLUDED.value_articulation_situation,
                value_articulation_value_statement = EXCLUDED.value_articulation_value_statement;
            
            RETURN NEW;
        EXCEPTION
            WHEN OTHERS THEN
                -- エラーログを記録
                RAISE NOTICE 'Error in sync_worksheet_data_to_analytics: %', SQLERRM;
                -- エラーを無視して処理を続行
                RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        -- トリガーを再作成
        DROP TRIGGER IF EXISTS trigger_sync_worksheet_data_to_analytics ON worksheet_data_sync;

        CREATE TRIGGER trigger_sync_worksheet_data_to_analytics
        AFTER INSERT OR UPDATE ON worksheet_data_sync
        FOR EACH ROW
        EXECUTE FUNCTION sync_worksheet_data_to_analytics();
      `,
    })

    if (error) {
      console.error("トリガー再作成中にエラーが発生しました:", error)
      return { success: false, message: `トリガー再作成中にエラーが発生しました: ${error.message}` }
    }

    return { success: true, message: "トリガーが正常に再作成されました" }
  } catch (error) {
    console.error("トリガー再作成中にエラーが発生しました:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "不明なエラー",
    }
  }
}

/**
 * 手動でデータを同期する
 */
export async function syncDataSyncToAnalytics(): Promise<{ success: boolean; message?: string }> {
  try {
    const anonymousId = getAnonymousId()
    if (!anonymousId) {
      return { success: false, message: "匿名IDが見つかりません" }
    }

    console.log("同期開始: 匿名ID", anonymousId)

    // ワークシートデータを取得
    const { data, error } = await supabase
      .from("worksheet_data_sync")
      .select("*")
      .eq("anonymous_id", anonymousId)
      .order("created_at", { ascending: false })
      .limit(1)

    if (error) {
      console.error("ワークシートデータの取得に失敗しました:", error)
      return { success: false, message: `ワークシートデータの取得に失敗しました: ${error.message}` }
    }

    if (!data || data.length === 0) {
      return { success: false, message: "ワークシートデータが見つかりませんでした" }
    }

    // ワークシートデータを分析データに同期
    const { error: syncError } = await supabase.from("worksheet_analytics").upsert(
      {
        anonymous_id: data[0].anonymous_id,
        created_at: data[0].created_at,
        updated_at: data[0].updated_at,
        current_step: data[0].current_step, // 修正: 直接カラムから取得
        raw_data: data[0].data,

        // 導入部分
        introduction_name: (data[0].data as any)?.introduction?.name,
        introduction_experience: (data[0].data as any)?.introduction?.experience,
        introduction_mentor_name: (data[0].data as any)?.introduction?.mentorName,

        // バイアス関連
        bias_change_lens: (data[0].data as any)?.bias?.changeLens,
        bias_other_change_lens: (data[0].data as any)?.bias?.otherChangeLens,
        bias_work_meanings: (data[0].data as any)?.bias?.workMeanings,
        bias_thought_origins: (data[0].data as any)?.bias?.thoughtOrigins,

        // 内発的動機
        internal_motivation_admired_traits: (data[0].data as any)?.internalMotivation?.admiredTraits,
        internal_motivation_disliked_traits: (data[0].data as any)?.internalMotivation?.dislikedTraits,

        // モチベーション
        motivation_selected_values: (data[0].data as any)?.motivation?.values,

        // 新しい始まり
        new_beginnings_action: (data[0].data as any)?.newBeginnings?.activity,
        new_beginnings_custom_action: (data[0].data as any)?.newBeginnings?.customActivity,

        // シードプランティング
        seed_planting_action: (data[0].data as any)?.seedPlanting?.action,
        seed_planting_custom_action: (data[0].data as any)?.seedPlanting?.customAction,

        // 価値観の明確化
        value_articulation_action: (data[0].data as any)?.valueArticulation?.action,
        value_articulation_result: (data[0].data as any)?.valueArticulation?.result,
        value_articulation_feedback: (data[0].data as any)?.valueArticulation?.feedback,
        value_articulation_keyword1: (data[0].data as any)?.valueArticulation?.keyword1,
        value_articulation_keyword2: (data[0].data as any)?.valueArticulation?.keyword2,
        value_articulation_keyword3: (data[0].data as any)?.valueArticulation?.keyword3,
        value_articulation_situation: (data[0].data as any)?.valueArticulation?.situation,
        value_articulation_value_statement: (data[0].data as any)?.valueArticulation?.valueStatement,
      },
      { onConflict: "anonymous_id" },
    )

    if (syncError) {
      console.error("分析データへの同期中にエラーが発生しました:", syncError)
      return { success: false, message: `分析データへの同期中にエラーが発生しました: ${syncError.message}` }
    }

    return { success: true, message: "データが正常に同期されました" }
  } catch (error) {
    console.error("ワークシートデータの同期中にエラーが発生しました:", error)
    return { success: false, message: "ワークシートデータの同期中にエラーが発生しました" }
  }
}

/**
 * トリガーのテスト実行
 */
export async function testTrigger(): Promise<{ success: boolean; message?: string }> {
  try {
    // テストデータを作成して同期をテスト
    const testResult = await createTestWorksheetData()
    if (!testResult.success) {
      return testResult
    }

    // 少し待機してトリガーが実行される時間を与える
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // 分析データを取得して確認
    const analyticsResult = await getWorksheetAnalytics()
    if (!analyticsResult.success) {
      return {
        success: false,
        message: `テストデータは作成されましたが、分析データの取得に失敗しました: ${analyticsResult.error}`,
      }
    }

    if (!analyticsResult.data) {
      return {
        success: false,
        message: "テストデータは作成されましたが、トリガーが実行されなかったか、分析データが作成されませんでした",
      }
    }

    return {
      success: true,
      message: "トリガーのテストが成功しました。データが正常に同期されています。",
    }
  } catch (error) {
    console.error("トリガーテスト中にエラーが発生しました:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "不明なエラー",
    }
  }
}

