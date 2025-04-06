"use client"

import { Suspense } from "react"
import NewBeginningsWorksheet from "@/components/worksheets/new-beginnings"
import WorksheetLayout from "@/components/worksheet-layout"
import { WorksheetProvider } from "@/context/worksheet-context"
import ProtectedRoute from "@/components/protected-route"

export default function NewBeginningsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WorksheetProvider>
        <ProtectedRoute>
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
        </ProtectedRoute>
      </WorksheetProvider>
    </Suspense>
  )
}
