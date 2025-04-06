"use client"

import { v4 as uuidv4 } from "uuid"

// 匿名IDを取得する関数
export function getAnonymousId(): string | null {
  if (typeof window === "undefined") return null

  // ローカルストレージから匿名IDを取得
  let anonymousId = localStorage.getItem("anonymousId") || localStorage.getItem("anon_id")

  // 匿名IDが存在しない場合は新しいIDを生成
  if (!anonymousId) {
    // ランダムな文字列を生成（UUIDの簡易版）
    const randomId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    anonymousId = `anon_${randomId}`

    // 生成したIDをローカルストレージに保存
    localStorage.setItem("anonymousId", anonymousId)
    localStorage.setItem("anon_id", anonymousId) // 互換性のために両方に保存

    console.log("新しい匿名IDを生成しました:", anonymousId)
  } else {
    console.log("既存の匿名IDを使用します:", anonymousId)
  }

  return anonymousId
}

// 匿名IDを取得または作成する関数
export const getOrCreateAnonymousId = () => {
  // サーバーサイドの場合は一時的なIDを返す
  if (typeof window === 'undefined') {
    return uuidv4()
  }
  
  try {
    // ローカルストレージから匿名IDを取得
    const storedId = localStorage.getItem("anonymousId")

    if (storedId) {
      return storedId
    }

    // 新しい匿名IDを作成
    const newId = uuidv4()
    localStorage.setItem("anonymousId", newId)
    return newId
  } catch (error) {
    console.error("Error getting or creating anonymous ID:", error)
    // エラーが発生した場合でも一時的なIDを返す
    return uuidv4()
  }
}
