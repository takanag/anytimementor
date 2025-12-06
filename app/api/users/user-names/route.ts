import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// サーバーサイドでSupabaseクライアントを作成（サービスロールを使用）
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { user_ids } = body;

    if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
      return NextResponse.json(
        { error: "user_idsが必要です" },
        { status: 400 }
      );
    }

    // サービスロールキーが設定されていない場合はエラー
    if (!supabaseServiceRoleKey) {
      console.error("SUPABASE_SERVICE_ROLE_KEYが設定されていません");
      return NextResponse.json(
        { error: "サーバー設定エラー" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // worksheet_analyticsからuser_idで検索
    const { data: worksheetData, error: worksheetError } = await supabase
      .from("worksheet_analytics")
      .select("user_id, introduction_name, user_name, updated_at, created_at")
      .in("user_id", user_ids)
      .order("updated_at", { ascending: false });

    if (worksheetError) {
      console.error("worksheet_analytics取得エラー:", worksheetError);
      return NextResponse.json(
        {
          error: "データの取得に失敗しました",
          details: worksheetError.message,
        },
        { status: 500 }
      );
    }

    // 各ユーザーIDごとに最新のレコードを選択
    const latestRecords = new Map<string, any>();
    if (worksheetData) {
      worksheetData.forEach((item: any) => {
        if (item.user_id) {
          const userId = String(item.user_id).trim();
          const existing = latestRecords.get(userId);
          const itemDate = item.updated_at || item.created_at;
          const existingDate = existing?.updated_at || existing?.created_at;

          if (
            !existing ||
            (itemDate &&
              (!existingDate || new Date(itemDate) > new Date(existingDate)))
          ) {
            latestRecords.set(userId, item);
          }
        }
      });
    }

    // マップに変換
    const userNameMap: { [key: string]: string | null } = {};
    latestRecords.forEach((record, userId) => {
      const introName = record.introduction_name
        ? String(record.introduction_name).trim()
        : null;
      const userName = record.user_name
        ? String(record.user_name).trim()
        : null;
      userNameMap[userId] = introName || userName || null;
    });

    return NextResponse.json({ user_names: userNameMap });
  } catch (error: any) {
    console.error("APIエラー:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました", details: error.message },
      { status: 500 }
    );
  }
}
