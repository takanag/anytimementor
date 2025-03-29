"use client"

import { useState, useEffect } from "react"
import { getSupabaseClient } from "@/lib/supabase"

export default function TableStructurePage() {
  const [tableInfo, setTableInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTableStructure() {
      try {
        setLoading(true)
        const supabase = getSupabaseClient()

        // テーブル構造を取得
        const { data: columns, error: columnsError } = await supabase.from("worksheet_progress").select("*").limit(1)

        if (columnsError) {
          throw new Error(`テーブル構造の取得に失敗しました: ${columnsError.message}`)
        }

        // サンプルデータを取得
        const { data: sampleData, error: sampleError } = await supabase.from("worksheet_progress").select("*").limit(5)

        if (sampleError) {
          throw new Error(`サンプルデータの取得に失敗しました: ${sampleError.message}`)
        }

        setTableInfo({
          columns: columns.length > 0 ? Object.keys(columns[0]) : [],
          sampleData,
        })
      } catch (err: any) {
        setError(err.message)
        console.error("Error fetching table structure:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchTableStructure()
  }, [])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">テーブル構造確認</h1>

      {loading && <p>読み込み中...</p>}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      {tableInfo && (
        <div>
          <h2 className="text-xl font-semibold mb-2">テーブル列</h2>
          <ul className="list-disc pl-5 mb-4">
            {tableInfo.columns.map((column: string) => (
              <li key={column}>{column}</li>
            ))}
          </ul>

          <h2 className="text-xl font-semibold mb-2">サンプルデータ</h2>
          {tableInfo.sampleData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-300">
                <thead>
                  <tr>
                    {tableInfo.columns.map((column: string) => (
                      <th key={column} className="border border-gray-300 px-4 py-2">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableInfo.sampleData.map((row: any, index: number) => (
                    <tr key={index}>
                      {tableInfo.columns.map((column: string) => (
                        <td key={`${index}-${column}`} className="border border-gray-300 px-4 py-2">
                          {typeof row[column] === "object" ? JSON.stringify(row[column]) : String(row[column] ?? "")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>データがありません</p>
          )}
        </div>
      )}
    </div>
  )
}

