"use client"

import { useState } from "react"

interface TreeNode {
  name: string
  value?: number
  children?: TreeNode[]
}

const treeData: TreeNode = {
  name: "関心事",
  children: [
    {
      name: "テクノロジー",
      children: [
        { name: "AI", value: 15 },
        { name: "Web開発", value: 12 },
        { name: "データサイエンス", value: 10 },
        { name: "サイバーセキュリティ", value: 8 },
      ],
    },
    {
      name: "ビジネス",
      children: [
        { name: "リーダーシップ", value: 14 },
        { name: "起業家精神", value: 11 },
        { name: "マーケティング", value: 9 },
        { name: "ファイナンス", value: 7 },
      ],
    },
    {
      name: "自己成長",
      children: [
        { name: "生産性", value: 13 },
        { name: "マインドフルネス", value: 10 },
        { name: "コミュニケーション", value: 8 },
        { name: "ワークライフバランス", value: 6 },
      ],
    },
  ],
}

// Custom React-based tree visualization
export function KeywordTree() {
  return (
    <div className="h-[300px] w-full overflow-auto p-4">
      <div className="flex justify-center">
        <TreeNode node={treeData} level={0} />
      </div>
    </div>
  )
}

function TreeNode({ node, level }: { node: TreeNode; level: number }) {
  const [expanded, setExpanded] = useState(true)

  // Calculate size based on value or default
  const size = node.value ? Math.sqrt(node.value) * 1.5 + 5 : 8

  // Different colors for different levels
  const colors = ["#C4BD97", "#B0A87F", "#9C9468", "#887F50"]
  const color = colors[level % colors.length]

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-col items-center mb-2">
        <div
          className="rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:opacity-80"
          style={{
            width: `${size * 2}px`,
            height: `${size * 2}px`,
            backgroundColor: color,
          }}
          onClick={() => node.children && setExpanded(!expanded)}
        >
          <span className="text-xs text-white font-bold">{node.children ? (expanded ? "-" : "+") : ""}</span>
        </div>
        <div className="mt-1 text-sm font-medium">{node.name}</div>
      </div>

      {expanded && node.children && (
        <div className="flex flex-wrap justify-center gap-6 mt-2 pt-4 border-t border-dashed border-gray-300">
          {node.children.map((child, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="h-6 w-px bg-gray-300 mb-1"></div>
              <TreeNode node={child} level={level + 1} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

