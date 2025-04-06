"use client"

import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts"

const data = [
  { month: "4月", おおほり: 3, かのみ: 2, やまざき: 4, らんこ: 1, まいまい: 2 },
  { month: "5月", おおほり: 4, かのみ: 3, やまざき: 3, らんこ: 2, まいまい: 3 },
  { month: "6月", おおほり: 5, かのみ: 4, やまざき: 5, らんこ: 3, まいまい: 4 },
  { month: "7月", おおほり: 4, かのみ: 5, やまざき: 4, らんこ: 4, まいまい: 3 },
  { month: "8月", おおほり: 6, かのみ: 4, やまざき: 6, らんこ: 5, まいまい: 5 },
  { month: "9月", おおほり: 5, かのみ: 6, やまざき: 5, らんこ: 6, まいまい: 4 },
]

// カスタム凡例のスタイル
const renderLegend = (props: any) => {
  const { payload } = props

  return (
    <ul className="flex flex-wrap justify-center gap-4 mt-2">
      {payload.map((entry: any, index: number) => (
        <li key={`item-${index}`} className="flex items-center">
          <span className="inline-block w-3 h-3 mr-1" style={{ backgroundColor: entry.color }} />
          <span className="text-xs">{entry.value}</span>
        </li>
      ))}
    </ul>
  )
}

export function MentoringChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 50, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="month" tick={{ fontSize: 10 }} />
          <YAxis
            tick={{ fontSize: 10 }}
            label={{
              value: "実施回数",
              angle: -90,
              position: "insideLeft",
              style: { textAnchor: "middle", fontSize: 10 },
              offset: -35,
            }}
          />
          <Legend content={renderLegend} />
          <Line type="linear" dataKey="おおほり" stroke="#C4BD97" strokeWidth={2} dot={{ fill: "#C4BD97", r: 4 }} />
          <Line type="linear" dataKey="かのみ" stroke="#8E8B70" strokeWidth={2} dot={{ fill: "#8E8B70", r: 4 }} />
          <Line type="linear" dataKey="やまざき" stroke="#5C5A48" strokeWidth={2} dot={{ fill: "#5C5A48", r: 4 }} />
          <Line type="linear" dataKey="らんこ" stroke="#FF9999" strokeWidth={2} dot={{ fill: "#FF9999", r: 4 }} />
          <Line type="linear" dataKey="まいまい" stroke="#9E7A7A" strokeWidth={2} dot={{ fill: "#9E7A7A", r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

