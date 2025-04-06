"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useWorksheet } from "@/context/worksheet-context"
import { Upload, Camera } from "lucide-react"

export default function UserAvatar() {
  const { responses, updateResponse } = useWorksheet()
  const [selectedAvatar, setSelectedAvatar] = useState(
    responses.userAvatar?.url || "/placeholder.svg?height=100&width=100",
  )
  const [isUploading, setIsUploading] = useState(false)

  // コンポーネントがマウントされたときに、responsesからアバターURLを取得
  useEffect(() => {
    if (responses.userAvatar?.url) {
      console.log("Setting user avatar from responses:", responses.userAvatar.url)
      setSelectedAvatar(responses.userAvatar.url)
    }
  }, [responses.userAvatar?.url])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)
      // In a real application, you would upload the file to a storage service
      // For now, we'll create a local URL
      const url = URL.createObjectURL(file)
      setSelectedAvatar(url)
      updateResponse("userAvatar", "url", url)
    } catch (error) {
      console.error("Error uploading file:", error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative group">
        <div className="w-32 h-32 relative rounded-full overflow-hidden border-4 border-[#C4BD97]">
          <Image src={selectedAvatar || "/placeholder.svg"} alt="あなたの写真" fill className="object-cover" priority />
        </div>

        <label
          htmlFor="user-avatar-upload"
          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer"
        >
          <div className="flex flex-col items-center">
            <Camera className="w-8 h-8 text-white mb-1" />
            <span className="text-white text-sm">写真を追加</span>
          </div>
        </label>

        <Input
          id="user-avatar-upload"
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          disabled={isUploading}
          className="hidden"
        />
      </div>

      {!responses.userAvatar?.url && (
        <Button asChild variant="outline" className="mt-3" disabled={isUploading} size="sm">
          <label htmlFor="user-avatar-upload" className="cursor-pointer flex items-center justify-center">
            <Upload className="w-4 h-4 mr-2" />
            {isUploading ? "アップロード中..." : "写真をアップロード"}
          </label>
        </Button>
      )}
    </div>
  )
}

