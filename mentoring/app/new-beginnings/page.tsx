import { Suspense } from "react"
import type { Metadata } from "next"
import NewBeginningsWorksheet from "@/components/worksheets/new-beginnings"
import WorksheetLayout from "@/components/worksheet-layout"
import { WorksheetProvider } from "@/context/worksheet-context"

export const metadata: Metadata = {
  title: "週次メンタリング | Any Time Mentor",
  description: "5分で完了する週次メンタリングセッション",
}

export default function NewBeginningsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WorksheetProvider>
        <WorksheetLayout
          title="やさしいメンタリング"
          description="5分で完了する週次メンタリングセッション"
          currentStep={1}
          totalSteps={3}
          isOffline={false}
          hideProgress={true} // 進捗表示を非表示にする
        >
          <NewBeginningsWorksheet />
        </WorksheetLayout>
      </WorksheetProvider>
    </Suspense>
  )
}

