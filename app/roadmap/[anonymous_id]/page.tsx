import { Suspense } from "react"
import { notFound } from "next/navigation"
import RoadmapPreview from "@/components/roadmap-preview"
import { supabase } from "@/lib/supabase"
import { Loader2 } from "lucide-react"

// データ取得関数
async function getWorksheetData(anonymousId: string) {
  try {
    console.log(`Fetching worksheet data for anonymous_id: ${anonymousId}`)

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
      .eq("anonymous_id", anonymousId)
      .limit(1)

    if (error) {
      console.error("Error fetching worksheet data:", error)
      return null
    }

    if (!data || data.length === 0) {
      console.log(`No data found for anonymous_id: ${anonymousId}`)
      return null
    }

    console.log("Fetched worksheet data successfully")
    return data[0]
  } catch (error) {
    console.error("Failed to fetch worksheet data:", error)
    return null
  }
}

export default async function RoadmapPage({ params }: { params: { anonymous_id: string } }) {
  const { anonymous_id } = params
  const worksheetData = await getWorksheetData(anonymous_id)

  // データが見つからない場合は404ページを表示
  if (!worksheetData) {
    notFound()
  }

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

