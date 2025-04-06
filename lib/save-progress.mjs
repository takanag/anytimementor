// ES Module版の実装も提供します
export function getLocalSavedData() {
  if (typeof window === "undefined") return null;
  try {
    const data = localStorage.getItem("worksheetData");
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error("Error getting local data:", e);
    return null;
  }
}

// 既存の関数をそのまま保持します
import { getSupabaseClient } from "@/lib/supabase";

function getAnonymousId() {
  if (typeof window !== "undefined") {
    let anonymousId = localStorage.getItem("anonymousId");
    if (!anonymousId) {
      anonymousId = generateUUID();
      localStorage.setItem("anonymousId", anonymousId);
    }
    return anonymousId;
  }
  return null;
}

function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function saveProgressToSupabase(data, currentStep) {
  try {
    const supabase = getSupabaseClient();
    
    if (!supabase) {
      return { success: false, message: "Supabaseクライアントの初期化に失敗しました。" };
    }

    const anonymousId = getAnonymousId();
    if (!anonymousId) {
      return { success: false, message: "匿名IDが見つかりません。" };
    }

    const completeData = {
      ...data,
      current_step: currentStep,
    };

    try {
      const { data: existingData, error: fetchError } = await supabase
        .from("worksheet_progress")
        .select("id")
        .eq("anonymous_id", anonymousId)
        .maybeSingle();

      if (fetchError) {
        return { success: false, message: `データの取得中にエラーが発生しました: ${fetchError.message}` };
      }

      if (existingData) {
        const { error: updateError } = await supabase
          .from("worksheet_progress")
          .update({
            data: completeData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingData.id);

        if (updateError) {
          return { success: false, message: `データの更新中にエラーが発生しました: ${updateError.message}` };
        }

        return { success: true };
      } else {
        const { error: insertError } = await supabase
          .from("worksheet_progress")
          .insert({
            anonymous_id: anonymousId,
            data: completeData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (insertError) {
          if (insertError.code === "23505") {
            const { data: latestRecord, error: latestRecordError } = await supabase
              .from("worksheet_progress")
              .select("id")
              .order("updated_at", { ascending: false })
              .limit(1)
              .single();

            if (latestRecordError) {
              return { success: false, message: `最新レコードの取得中にエラーが発生しました: ${latestRecordError.message}` };
            }

            const { error: finalUpdateError } = await supabase
              .from("worksheet_progress")
              .update({
                anonymous_id: anonymousId,
                data: completeData,
                updated_at: new Date().toISOString(),
              })
              .eq("id", latestRecord.id);

            if (finalUpdateError) {
              return { success: false, message: `最終更新中にエラーが発生しました: ${finalUpdateError.message}` };
            }

            return { success: true };
          } else {
            return { success: false, message: `データの挿入中にエラーが発生しました: ${insertError.message}` };
          }
        }

        return { success: true };
      }
    } catch (error) {
      return { success: false, message: `Supabase操作中にエラーが発生しました: ${error.message}` };
    }
  } catch (error) {
    return { success: false, message: `予期しないエラーが発生しました: ${error.message}` };
  }
}

