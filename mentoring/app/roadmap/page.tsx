import { Suspense } from "react"
import RoadmapPreview from "@/components/roadmap-preview"
import { supabase } from "@/lib/supabase"
import { Loader2 } from "lucide-react"

// テスト用の anonymous_id
const TEST_ANONYMOUS_ID = "anon_i5cm8xs9k9mpzuw1d5fhk"

// データ取得関数
async function getWorksheetData() {
  try {
    // 指定された anonymous_id を持つデータを取得
    const { data, error } = await supabase
      .from("worksheet_analytics")
      .select(`
        id,
        anonymous_id,
        user_avatar_type,
        user_avatar_url,
        internal_motivation_admired_traits,
        internal_motivation_disliked_traits,
        bias_work_meanings,
        bias_thought_origins,
        bias_change_lens,
        bias_other_change_lens,
        new_beginnings_action,
        value_articulation_value_statement,
        value_articulation_keyword1,
        value_articulation_keyword2,
        value_articulation_keyword3,
        capability_business_understanding_analytical_thinking,
        capability_business_understanding_env_understanding,
        capability_business_understanding_value_creation,
        capability_collaboration_adaptability,
        capability_collaboration_global_mind,
        capability_collaboration_network_utilization,
        capability_expertise_knowledge_sharing,
        capability_expertise_quality_control,
        capability_expertise_specialized_knowledge,
        capability_integrity_and_trust_client_response,
        capability_integrity_and_trust_communication,
        capability_integrity_and_trust_relationship_building,
        capability_leadership_lead_others,
        capability_leadership_org_strength,
        capability_leadership_self_growth,
        celebration_news_article_headline,
        celebration_news_article_lead,
        celebration_news_article_quote,
        celebration_news_article_content,
        created_at
      `)
      .eq("anonymous_id", TEST_ANONYMOUS_ID)
      .limit(1)

    if (error) {
      console.error("Error fetching worksheet data:", error)
      return getTestData()
    }

    if (!data || data.length === 0) {
      console.log("No data found for the specified anonymous_id, using test data")
      return getTestData()
    }

    console.log("Fetched worksheet data:", data[0])
    return data[0]
  } catch (error) {
    console.error("Failed to fetch worksheet data:", error)
    return getTestData()
  }
}

// テスト用のダミーデータを返す関数
function getTestData() {
  return {
    id: 1,
    anonymous_id: TEST_ANONYMOUS_ID,
    user_avatar_type: "テストユーザー",
    user_avatar_url: null,
    internal_motivation_admired_traits: JSON.stringify(["創造性", "忍耐力", "リーダーシップ"]),
    internal_motivation_disliked_traits: JSON.stringify(["優柔不断", "短気"]),
    bias_work_meanings: JSON.stringify(["収入を得る手段", "自己実現の場", "社会貢献の手段"]),
    bias_thought_origins: JSON.stringify(["家族からの影響", "過去の経験"]),
    bias_change_lens: "新しい視点で考える",
    bias_other_change_lens: "異なる立場の人の意見を聞く",
    new_beginnings_action: "毎日15分間の瞑想",
    value_articulation_value_statement: "私は困難な状況でも冷静に判断し、チームを成功に導くリーダーシップを発揮します",
    value_articulation_keyword1: "リーダーシップ",
    value_articulation_keyword2: "問題解決",
    value_articulation_keyword3: "チームワーク",
    capability_business_understanding_analytical_thinking: 2,
    capability_business_understanding_env_understanding: 1,
    capability_business_understanding_value_creation: 2,
    capability_collaboration_adaptability: 1,
    capability_collaboration_global_mind: 0,
    capability_collaboration_network_utilization: 1,
    capability_expertise_knowledge_sharing: 2,
    capability_expertise_quality_control: 1,
    capability_expertise_specialized_knowledge: 2,
    capability_integrity_and_trust_client_response: 1,
    capability_integrity_and_trust_communication: 2,
    capability_integrity_and_trust_relationship_building: 1,
    capability_leadership_lead_others: 2,
    capability_leadership_org_strength: 1,
    capability_leadership_self_growth: 2,
    celebration_news_article_headline: "チームの生産性が30%向上、メンバー全員が成長を実感",
    celebration_news_article_lead: "新しいリーダーシップアプローチが成功を収める",
    celebration_news_article_quote: "全員が自分の強みを活かせる環境を作ることが重要でした",
    celebration_news_article_content:
      "チームメンバー全員が自信を持って仕事に取り組み、互いに協力し合う文化が根付いています。プロジェクトは常に期限内に高品質で完了し、クライアントからの評価も高いです。",
    created_at: new Date().toISOString(),
  }
}

export default async function RoadmapPage() {
  const worksheetData = await getWorksheetData()

  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <RoadmapPreview worksheetData={worksheetData} />
    </Suspense>
  )
}

