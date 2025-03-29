"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2 } from "lucide-react"

interface TeamSelectorProps {
  onTeamChange?: (team: string) => void
}

export function TeamSelector({ onTeamChange }: TeamSelectorProps) {
  const [selectedTeam, setSelectedTeam] = useState("新規事業開発本部")

  const handleTeamChange = (value: string) => {
    setSelectedTeam(value)
    if (onTeamChange) {
      onTeamChange(value)
    }
  }

  return (
    <div className="bg-white py-3 px-4 border-b">
      <div className="flex items-center space-x-2 pl-2">
        <Building2 className="h-5 w-5 text-[#4A593D]" />
        <span className="text-sm font-medium text-gray-700 mr-4">所属チーム:</span>
        <Select value={selectedTeam} onValueChange={handleTeamChange}>
          <SelectTrigger className="w-[280px] bg-white border-gray-300">
            <SelectValue placeholder="チームを選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="新規事業開発本部">新規事業開発本部</SelectItem>
            <SelectItem value="マーケティング部">マーケティング部</SelectItem>
            <SelectItem value="営業部">営業部</SelectItem>
            <SelectItem value="人事部">人事部</SelectItem>
            <SelectItem value="技術開発部">技術開発部</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

