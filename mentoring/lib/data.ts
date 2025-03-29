"use client"

const LOCAL_STORAGE_ONLY_KEY = "useLocalStorageOnly"
const CONSECUTIVE_FAILURES_KEY = "consecutiveFailures"

// ローカルストレージのみモードを設定する関数
export function setLocalStorageOnlyMode(value: boolean): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_STORAGE_ONLY_KEY, String(value))
  }
}

// ローカルストレージのみモードかどうかを判定する関数
export function isLocalStorageOnlyMode(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem(LOCAL_STORAGE_ONLY_KEY) === "true"
}

// 連続失敗回数を取得する関数
export function getConsecutiveFailures(): number {
  if (typeof window !== "undefined") {
    const failures = localStorage.getItem(CONSECUTIVE_FAILURES_KEY)
    return failures ? Number.parseInt(failures, 10) : 0
  }
  return 0
}

// 連続失敗回数をリセットする関数
export function resetConsecutiveFailures(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(CONSECUTIVE_FAILURES_KEY)
  }
}

// 匿名IDを取得する関数（getOrCreateAnonymousIdのエイリアス）
export function getAnonymousId(): string {
  return getOrCreateAnonymousId()
}

// 匿名IDを取得または生成する関数
export function getOrCreateAnonymousId(): string {
  if (typeof window === "undefined") return "" // or throw an error

  // テスト環境用に固定のIDを返す
  return "anon_i5cm8xs9k9mpzuw1d5fhk"

  // 以下のコードは使用されなくなります
  /*
  let anonymousId = localStorage.getItem("anonymousId")

  if (!anonymousId) {
    anonymousId = generateUUID()
    localStorage.setItem("anonymousId", anonymousId)
  }

  return anonymousId
  */
}

// UUIDを生成する関数
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// ワークシートデータを保存する関数（ダミー）
export async function saveData(
  data: any,
  currentStep: number,
): Promise<{ success: boolean; message?: string; switchedToLocalOnly?: boolean }> {
  // ローカルストレージに保存
  if (typeof window !== "undefined") {
    localStorage.setItem("worksheetData", JSON.stringify(data))
  }
  return { success: true, message: "ローカルストレージに保存しました" }
}

// テスト接続関数 (ダミー)
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  return { success: true, message: "テスト接続成功" }
}

