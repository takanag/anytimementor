"use client"

import { useEffect, useRef } from "react"
import { Chart, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from "chart.js"
import { Radar } from "react-chartjs-2"

Chart.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

interface RadarChartProps {
  data: {
    labels: string[]
    datasets: {
      label: string
      data: number[]
      backgroundColor: string
      borderColor: string
      borderWidth: number
    }[]
  }
  onRender?: () => void
}

export default function RadarChart({ data, onRender }: RadarChartProps) {
  const chartRef = useRef(null)

  useEffect(() => {
    // チャートのレンダリングが完了したことを通知
    if (chartRef.current && onRender) {
      console.log("レーダーチャートがレンダリングされました")

      // レンダリング完了を通知する前に少し待機
      // チャートの描画が完全に完了するまで十分な時間を確保
      setTimeout(() => {
        onRender()
      }, 1000)
    }
  }, [data, onRender])

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 0, // アニメーションを無効化
    },
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        enabled: false, // PDFでは不要なのでツールチップを無効化
      },
    },
    scales: {
      r: {
        min: 0,
        max: 6,
        ticks: {
          stepSize: 1,
          backdropColor: "transparent",
        },
        grid: {
          color: "rgba(0, 0, 0, 0.2)", // グリッド線を濃くして見やすく
        },
        angleLines: {
          color: "rgba(0, 0, 0, 0.3)", // 角度線も濃くして見やすく
        },
      },
    },
    elements: {
      line: {
        borderWidth: 3, // 線を太くして見やすく
      },
      point: {
        radius: 4, // ポイントを大きくして見やすく
        hoverRadius: 4,
      },
    },
  }

  return (
    <div className="w-full h-full">
      <Radar ref={chartRef} data={data} options={options} />
    </div>
  )
}

