// 匿名IDを取得または生成する関数
export function getAnonymousId(): string | null {
  if (typeof window === "undefined") return null

  // ローカルストレージから匿名IDを取得
  let anonymousId = localStorage.getItem("anonymousId")

  // 匿名IDがない場合は新しく生成
  if (!anonymousId) {
    anonymousId = generateUUID()
    localStorage.setItem("anonymousId", anonymousId)
  }

  return anonymousId
}

// UUIDを生成する関数
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

