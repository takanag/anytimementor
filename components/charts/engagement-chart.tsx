"use client"

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Legend } from "recharts"

const data = [
  { subject: "仕事をするのが楽しい", おおほり: 85, かのみ: 70, やまざき: 75, らんこ: 90, まいまい: 65 },
  {
    subject: "自分の貢献が組織に認められていると感じる",
    おおほり: 75,
    かのみ: 65,
    やまざき: 80,
    らんこ: 70,
    まいまい: 60,
  },
  { subject: "12か月後もこの会社で仕事をしている", おおほり: 90, かのみ: 75, やまざき: 85, らんこ: 95, まいまい: 70 },
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

export function EngagementChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid />
          <PolarAngleAxis
            dataKey="subject"
            tick={(props) => {
              const { x, y, payload } = props
              const lines = payload.value.split(" ")
              const lineHeight = 12

              return (
                <g transform={`translate(${x},${y})`}>
                  {lines.map((line, index) => (
                    <text
                      key={index}
                      x={0}
                      y={index * lineHeight}
                      dy={10}
                      textAnchor="middle"
                      fill="currentColor"
                      fontSize={10}
                    >
                      {line}
                    </text>
                  ))}
                </g>
              )
            }}
          />
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

