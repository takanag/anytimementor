export interface WorksheetData {
  engagement?: any
  capability?: any
  mentoring?: MentoringData
  [key: string]: any
}

export interface MentoringData {
  name?: string
  goal?: string
  deadline?: string
  yoshuku?: string
  actions?: Array<{
    id: string
    text: string
    deadline: string
  }>
  [key: string]: any
}

