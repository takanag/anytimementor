// データ読み込みをデバッグするためのユーティリティ関数

export function debugDataLoading(data: any, source: string) {
  console.group(`データ読み込みデバッグ (${source})`)
  console.log("データ全体:", data)

  // capability（ステップ7）のデータを確認
  if (data?.capability) {
    console.log("capability データ:", data.capability)
    console.log("capability データ型:", typeof data.capability)

    // JSONの場合は解析を試みる
    if (typeof data.capability === "string") {
      try {
        const parsed = JSON.parse(data.capability)
        console.log("解析後のcapabilityデータ:", parsed)
      } catch (error) {
        console.error("capability JSONの解析エラー:", error)
        console.log("capability 生データ:", data.capability)
      }
    }
  } else {
    console.log("capability データが存在しません")
  }

  // データベースから読み込んだ生データを確認（raw_dataフィールドがある場合）
  if (data?.raw_data) {
    console.log("raw_data:", data.raw_data)
    console.log("raw_data型:", typeof data.raw_data)

    // JSONの場合は解析を試みる
    if (typeof data.raw_data === "string") {
      try {
        const parsed = JSON.parse(data.raw_data)
        console.log("解析後のraw_data:", parsed)
        // capability データを確認
        if (parsed.capability) {
          console.log("raw_data内のcapability:", parsed.capability)
        }
      } catch (error) {
        console.error("raw_data JSONの解析エラー:", error)
      }
    } else if (typeof data.raw_data === "object") {
      // オブジェクトの場合はcapabilityを直接確認
      if (data.raw_data.capability) {
        console.log("raw_data内のcapability:", data.raw_data.capability)
      }
    }
  }

  console.groupEnd()
  return data // 元のデータを変更せずに返す
}

