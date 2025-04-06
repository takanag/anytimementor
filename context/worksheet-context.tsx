"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

// ワークシートの応答データの型定義
interface WorksheetResponses {
  introduction?: {
    name?: string
    experience?: string
    mentorName?: string
  }
  avatar?: {
    url?: string
  }
  userAvatar?: {
    url?: string
  }
  bias?: {
    workMeanings?: string[]
    otherWorkMeaning?: string
    thoughtOrigins?: string[]
    otherThoughtOrigin?: string
    changeLens?: string
    otherChangeLens?: string
  }
  internalMotivation?: {
    admiredTraits?: string[]
    dislikedTraits?: string[]
  }
  motivation?: {
    enjoyment?: number
    values?: string[]
    activities?: string
  }
  seedPlanting?: {
    action?: string
    customAction?: string
  }
  newBeginnings?: {
    activity?: string
    customActivity?: string
    timeframe?: string
    obstacles?: string
    commitment?: string
  }
  celebration?: {
    vision?: string
    feelings?: string
    gratitude?: string
  }
  capability?: {
    [key: string]: any
  }
  valueArticulation?: {
    action?: string
    result?: string
    feedback?: string
    keyword1?: string
    keyword2?: string
    keyword3?: string
    situation?: string
    valueStatement?: string
  }
}

interface WorksheetContextType {
  currentStep: number
  setCurrentStep: (step: number) => void
  responses: WorksheetResponses
  updateResponse: (section: keyof WorksheetResponses, field: string, value: any) => void
  saveResponses: () => void
  isLoading: boolean
  error: string | null
}

const WorksheetContext = createContext<WorksheetContextType | undefined>(undefined)

export function WorksheetProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [responses, setResponses] = useState<WorksheetResponses>({})
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const updateResponse = (section: keyof WorksheetResponses, field: string, value: any) => {
    setResponses((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }))
  }

  const saveResponses = () => {
    // Placeholder for save functionality
  }

  return (
    <WorksheetContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        responses,
        updateResponse,
        saveResponses,
        isLoading,
        error,
      }}
    >
      {children}
    </WorksheetContext.Provider>
  )
}

export function useWorksheet() {
  const context = useContext(WorksheetContext)
  if (context === undefined) {
    throw new Error("useWorksheet must be used within a WorksheetProvider")
  }
  return context
}

export const useWorksheetContext = useWorksheet

