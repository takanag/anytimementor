"use client"

import type { WorksheetData } from "@/types/worksheet"
import { getSupabaseClient, supabase as supabaseClient } from "@/lib/supabase"
import { getAnonymousId } from "./anonymous-id"
import { getCurrentUser } from "./auth"

// getAnonymousId関数を再エクスポート
export { getAnonymousId }

// ワークシートデータを保存・同期する関数（新規レコードとして追加）
export async function saveAndSyncWorksheetData(
  data: WorksheetData,
  currentStep: number,
  providedUserId?: string // 外部から提供されるユーザーID（オプション）
): Promise<{ success: boolean; message?: string }> {
  try {
    // 匿名IDを取得
    const anonymousId = getAnonymousId()
    if (!anonymousId) {
      return { success: false, message: "匿名IDが見つかりません。" }
    }

    // 認証済みユーザーの情報を取得（可能であれば）
    let userId = providedUserId || null // 提供されたユーザーIDがあれば使用
    
    if (!userId) {
      console.log("saveAndSyncWorksheetData: 提供されたユーザーIDがないため、認証状態を確認します")
      
      try {
        // まずセッションから直接取得を試みる
        const { data: { session } } = await supabaseClient.auth.getSession()
        if (session && session.user) {
          userId = session.user.id
          console.log("saveAndSyncWorksheetData: セッションから認証済みユーザーIDを取得しました:", userId)
        } else {
          console.log("saveAndSyncWorksheetData: セッションが見つかりませんでした。getCurrentUserを試みます")
          
          // セッションがない場合はgetCurrentUserを試す
          const currentUser = await getCurrentUser()
          if (currentUser) {
            userId = currentUser.id
            console.log("saveAndSyncWorksheetData: getCurrentUserから認証済みユーザーIDを取得しました:", userId)
            
            // getCurrentUser内でセッションリフレッシュを試みているので、
            // ここでは追加のリフレッシュは行わない
          } else {
            console.log("saveAndSyncWorksheetData: ユーザー情報を取得できませんでした")
            
            // ローカルストレージのトークンを確認
            if (typeof window !== 'undefined') {
              try {
                const localToken = localStorage.getItem('supabase.auth.token')
                console.log("saveAndSyncWorksheetData: ローカルストレージのトークン状態:", localToken ? "存在します" : "存在しません")
                
                if (localToken) {
                  console.log("saveAndSyncWorksheetData: ローカルストレージにトークンが存在するため、セッションリフレッシュを試みます")
                  
                  try {
                    const { data, error } = await supabaseClient.auth.refreshSession()
                    
                    if (error) {
                      console.warn("saveAndSyncWorksheetData: セッションリフレッシュに失敗しました:", error.message)
                    } else if (data.session && data.user) {
                      userId = data.user.id
                      console.log("saveAndSyncWorksheetData: セッションを正常にリフレッシュしました:", {
                        userId: data.user.id,
                        email: data.user.email
                      })
                    }
                  } catch (refreshError) {
                    console.error("saveAndSyncWorksheetData: セッションリフレッシュ中にエラーが発生しました:", refreshError)
                  }
                }
              } catch (storageError) {
                console.error("saveAndSyncWorksheetData: ローカルストレージへのアクセス中にエラーが発生しました:", storageError)
              }
            }
          }
        }
      } catch (userError) {
        console.log("saveAndSyncWorksheetData: 認証ユーザー情報の取得に失敗しました。匿名IDのみを使用します:", userError)
      }
    } else {
      console.log("saveAndSyncWorksheetData: 外部から提供された認証済みユーザーIDを使用します:", userId)
    }

    console.log("saveAndSyncWorksheetData関数が呼び出されました。匿名ID:", anonymousId)

    // Supabaseクライアントを取得
    const supabase = getSupabaseClient()
    if (!supabase) {
      return { success: false, message: "Supabaseクライアントの初期化に失敗しました。" }
    }

    // 保存するデータを準備
    const worksheetDataToSave: any = {
      anonymous_id: anonymousId,
      worksheet_id: "default",
      data: data,
      current_step: currentStep,
      completed: currentStep === 8,
      updated_at: new Date().toISOString(),
    }
    
    // 認証済みユーザーIDがある場合は必ず追加
    // これは重要: トリガーが動作しない場合のバックアップとして
    if (userId) {
      worksheetDataToSave.user_id = userId
      console.log("認証済みユーザーIDをデータに設定します:", userId)
    } else {
      console.log("認証済みユーザーIDがないため、匿名IDのみを使用します:", anonymousId)
    }

    // worksheet_data_syncテーブルに新規レコードとしてデータを保存
    const { error } = await supabase.from("worksheet_data_sync").insert(worksheetDataToSave)

    if (error) {
      console.error("データの保存中にエラーが発生しました:", error)
      return { success: false, message: `データの保存中にエラーが発生しました: ${error.message}` }
    }

    // worksheet_analyticsテーブルにも同じデータを保存（テーブル構造に合わせて整形）
    try {
      // テーブル構造に合わせてデータを変換
      // 型変換を明示的に行い、nullやundefinedを適切に処理
      const analyticsData: any = {
        anonymous_id: anonymousId,
        // 文字列フィールド - nullやundefinedの場合は明示的にnullを設定
        user_name: data.introduction?.name || null,
        mentor_name: data.introduction?.mentorName || null,
        experience_level: data.introduction?.experience || null,
        change_lens: data.bias?.changeLens || null,
        activities: data.motivation?.activities || null,
        new_activity: data.newBeginnings?.activity || null,
        timeframe: data.newBeginnings?.timeframe || null,
        obstacles: data.newBeginnings?.obstacles || null,
        commitment: data.newBeginnings?.commitment || null,
        seed_planting_action: data.seedPlanting?.action || null,
        seed_planting_custom: data.seedPlanting?.customAction || null,
        strengths: data.capability?.strengths || null,
        improvements: data.capability?.improvements || null,
        
        // 配列フィールド - 配列でない場合や空の場合はnullを設定
        work_meanings: Array.isArray(data.bias?.workMeanings) ? data.bias?.workMeanings : null,
        thought_origins: Array.isArray(data.bias?.thoughtOrigins) ? data.bias?.thoughtOrigins : null,
        admired_traits: Array.isArray(data.internalMotivation?.admiredTraits) ? data.internalMotivation?.admiredTraits : null,
        disliked_traits: Array.isArray(data.internalMotivation?.dislikedTraits) ? data.internalMotivation?.dislikedTraits : null,
        values: Array.isArray(data.motivation?.values) ? data.motivation?.values : null,
        
        // 数値フィールド - 数値でない場合はnullを設定
        enjoyment_level: typeof data.motivation?.enjoyment === 'number' ? data.motivation?.enjoyment : null,
        leadership_score: typeof data.capability?.leadership === 'number' ? data.capability?.leadership : null,
        communication_score: typeof data.capability?.communication === 'number' ? data.capability?.communication : null,
        technical_score: typeof data.capability?.technical === 'number' ? data.capability?.technical : null,
        problem_solving_score: typeof data.capability?.problemSolving === 'number' ? data.capability?.problemSolving : null,
        creativity_score: typeof data.capability?.creativity === 'number' ? data.capability?.creativity : null,
        
        // その他のフィールド
        completed_step: currentStep,
        is_completed: currentStep === 8,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // 認証済みユーザーIDがある場合は必ず追加
      // これは重要: トリガーが動作しない場合のバックアップとして
      if (userId) {
        analyticsData.user_id = userId
        console.log("認証済みユーザーIDを分析データに設定します:", userId)
      }

      console.log("worksheet_analyticsに保存するデータ:", analyticsData);
      
      try {
        // insertの代わりにupsertを使用し、anonymous_idで競合した場合は更新する
        const { error: analyticsError } = await supabase
          .from("worksheet_analytics")
          .upsert(analyticsData, {
            onConflict: 'anonymous_id', // anonymous_idが競合した場合は更新
            ignoreDuplicates: false // 重複を無視せず、更新する
          });

        if (analyticsError) {
          console.error("分析データの保存中にエラーが発生しました:", {
            code: analyticsError.code,
            message: analyticsError.message,
            details: analyticsError.details,
            hint: analyticsError.hint
          });
          
          // エラーの詳細を確認し、テーブル構造の問題かどうかを判断
          if (analyticsError.code === '23502') { // NOT NULL制約違反
            console.error("NOT NULL制約違反が発生しました。テーブル構造を確認してください。");
          } else if (analyticsError.code === '23505') { // 一意制約違反
            console.error("一意制約違反が発生しました。重複するデータが存在します。");
          }
          
          // 分析データの保存に失敗しても、メインのデータ保存は成功しているので、エラーとはしない
        } else {
          console.log("分析データが正常に保存されました");
        }
      } catch (insertError) {
        console.error("分析データの挿入中に例外が発生しました:", insertError);
      }
    } catch (analyticsError) {
      console.warn("分析データの保存中に例外が発生しました:", analyticsError)
      // 分析データの保存に失敗しても、メインのデータ保存は成功しているので、エラーとはしない
    }

    return { success: true, message: "データが正常に保存されました。" }
  } catch (error: any) {
    console.error("データの保存中に予期しないエラーが発生しました:", error)
    return { success: false, message: `データの保存中に予期しないエラーが発生しました: ${error.message}` }
  }
}

// ワークシートデータを保存する関数（古い関数名との互換性のため）
export async function saveWorksheetData(
  worksheetId: number,
  data: WorksheetData,
): Promise<{ success: boolean; message?: string }> {
  try {
    // 匿名IDを取得
    const anonymousId = getAnonymousId()
    if (!anonymousId) {
      return { success: false, message: "匿名IDが見つかりません。" }
    }

    // 認証済みユーザーの情報を取得（可能であれば）
    let userId = null
    try {
      const currentUser = await getCurrentUser()
      if (currentUser) {
        userId = currentUser.id
        console.log("認証済みユーザーIDを使用します:", userId)
      }
    } catch (userError) {
      console.log("認証ユーザー情報の取得に失敗しました。匿名IDのみを使用します:", userError)
    }

    console.log(`saveWorksheetData関数が呼び出されました。ワークシートID: ${worksheetId}, 匿名ID: ${anonymousId}`)

    // Supabaseクライアントを取得
    const supabase = getSupabaseClient()
    if (!supabase) {
      return { success: false, message: "Supabaseクライアントの初期化に失敗しました。" }
    }

    // 保存するデータを準備
    const saveData: any = {
      anonymous_id: anonymousId,
      worksheet_id: String(worksheetId), // worksheet_idを文字列に変換
      data: data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    
    // 認証済みユーザーIDがある場合は追加
    if (userId) {
      saveData.user_id = userId
      console.log("認証済みユーザーIDをデータに設定します:", userId)
    }

    // worksheet_data_syncテーブルにデータを保存
    const { error } = await supabase.from("worksheet_data_sync").insert(saveData)

    if (error) {
      console.error("データの保存中にエラーが発生しました:", error)
      return { success: false, message: `データの保存中にエラーが発生しました: ${error.message}` }
    }

    console.log("データが正常に保存されました。")
    return { success: true, message: "データが正常に保存されました。" }
  } catch (error: any) {
    console.error("データの保存中に予期しないエラーが発生しました:", error)
    return { success: false, message: `データの保存中に予期しないエラーが発生しました: ${error.message}` }
  }
}

// 最新のワークシートデータを取得する関数
export async function getLatestWorksheetData(): Promise<{
  data: WorksheetData | null
  currentStep: number
  error?: string
}> {
  try {
    // 匿名IDを取得
    const anonymousId = getAnonymousId()
    
    // 認証済みユーザーの情報を取得（可能であれば）
    let userId = null
    try {
      const currentUser = await getCurrentUser()
      if (currentUser) {
        userId = currentUser.id
      }
    } catch (userError) {
      console.log("認証ユーザー情報の取得に失敗しました。匿名IDのみを使用します:", userError)
    }

    // 匿名IDもユーザーIDもない場合はエラー
    if (!anonymousId && !userId) {
      return {
        data: null,
        currentStep: 0,
        error: "匿名IDとユーザーIDのどちらも見つかりません。",
      }
    }

    // Supabaseクライアントを取得
    const supabase = getSupabaseClient()
    if (!supabase) {
      return {
        data: null,
        currentStep: 0,
        error: "Supabaseクライアントの初期化に失敗しました。",
      }
    }

    // クエリを構築
    let query = supabase
      .from("worksheet_data_sync")
      .select("*")
      .eq("worksheet_id", "default")
      .order("updated_at", { ascending: false })
      .limit(1)

    // 認証済みユーザーIDがある場合は優先的に使用
    if (userId) {
      query = query.eq("user_id", userId)
    } else if (anonymousId) {
      query = query.eq("anonymous_id", anonymousId)
    }

    // データ取得を実行
    const { data, error } = await query.single()

    if (error) {
      console.error("データの取得中にエラーが発生しました:", error)
      
      // データが見つからなかった場合は特別なエラーではなく空のデータを返す
      if (error.code === "PGRST116") {
        return { data: null, currentStep: 0 }
      }
      
      return {
        data: null,
        currentStep: 0,
        error: `データの取得中にエラーが発生しました: ${error.message}`,
      }
    }

    // データが見つからない場合
    if (!data) {
      return { data: null, currentStep: 0 }
    }

    return {
      data: data.data,
      currentStep: data.current_step || 0,
    }
  } catch (error: any) {
    console.error("データの取得中に予期しないエラーが発生しました:", error)
    return {
      data: null,
      currentStep: 0,
      error: `データの取得中に予期しないエラーが発生しました: ${error.message}`,
    }
  }
}

// ローカルストレージからワークシートデータを取得する関数
export function getLocalWorksheetData(): WorksheetData | null {
  if (typeof window === "undefined") return null
  try {
    const data = localStorage.getItem("worksheetData")
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error("ローカルストレージからのデータ取得に失敗しました:", error)
    return null
  }
}
