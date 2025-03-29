"use client"

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Legend } from "recharts"

const data = [
  { subject: "リーダーシップ", おおほり: 80, かのみ: 65, やまざき: 85, らんこ: 70, まいまい: 60 },
  { subject: "ビジネス理解", おおほり: 75, かのみ: 70, やまざき: 80, らんこ: 65, まいまい: 75 },
  { subject: "専門性", おおほり: 85, かのみ: 75, やまざき: 70, らんこ: 80, まいまい: 90 },
  { subject: "協働力", おおほり: 70, かのみ: 80, やまざき: 75, らんこ: 85, まいまい: 65 },
  { subject: "インテグリティ", おおほり: 90, かのみ: 85, やまざき: 80, らんこ: 75, まいまい: 80 },
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

export function CapabilityChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
          <Legend content={renderLegend} />
          <Radar name="おおほり" dataKey="おおほり" stroke="#C4BD97" fill="#C4BD97" fillOpacity={0.3} />
          <Radar name="かのみ" dataKey="かのみ" stroke="#8E8B70" fill="#8E8B70" fillOpacity={0.3} />
          <Radar name="やまざき" dataKey="やまざき" stroke="#5C5A48" fill="#5C5A48" fillOpacity={0.3} />
          <Radar name="らんこ" dataKey="らんこ" stroke="#FF9999" fill="#FF9999" fillOpacity={0.3} />
          <Radar name="まいまい" dataKey="まいまい" stroke="#9E7A7A" fill="#9E7A7A" fillOpacity={0.3} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}

