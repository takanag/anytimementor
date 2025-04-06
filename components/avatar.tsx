"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useWorksheet } from "@/context/worksheet-context"
import { Upload } from "lucide-react"
import { User, Bot } from "lucide-react"

interface AvatarProps {
  isUser?: boolean
  className?: string
}

// デフォルトアバターの配列を更新
const defaultAvatars = [
  {
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/avator%201-UqQV1NQPIICexukdQNCSwWbBBozxWa.jpeg",
    alt: "メンター 1",
  },
  {
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/20250212_230227888_iOS-I8kdmcvOPDy3aXs49tqz7nLqMuNCRL.png",
    alt: "メンター 2",
  },
  {
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/avator%202.jpg-KgS9IJpcGLJJ3ZhCe8ObWl88zBR7cB.jpeg",
    alt: "メンター 3",
  },
  {
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/avator%203.jpg-AGqgIq4ge0YMSWks8egp8cNfLuefGt.jpeg",
    alt: "メンター 4",
  },
  {
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/avator%204.jpg-wOHIRytnFA5lLjUw1TepmbM2EmJ276.jpeg",
    alt: "メンター 5",
  },
  {
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/avator%205.jpg-aCul9JWcwR5sr4gLAA8Hn9Ymrjd8gl.jpeg",
    alt: "メンター 6",
  },
]

export default function AvatarSelector() {
  const { responses, updateResponse } = useWorksheet()
  const [selectedAvatar, setSelectedAvatar] = useState(responses.avatar?.url || defaultAvatars[0].url)
  const [isUploading, setIsUploading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // コンポーネントがマウントされたときに、responsesからアバターURLを取得
  useEffect(() => {
    if (responses.avatar?.url) {
      console.log("Setting avatar from responses:", responses.avatar.url)
      setSelectedAvatar(responses.avatar.url)
    }
  }, [responses.avatar?.url])

  const handleAvatarSelect = (url: string) => {
    setSelectedAvatar(url)
    updateResponse("avatar", "url", url)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)
      // In a real application, you would upload the file to a storage service
      // For now, we'll create a local URL
      const url = URL.createObjectURL(file)
      handleAvatarSelect(url)
    } catch (error) {
      console.error("Error uploading file:", error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={() => setIsModalOpen(true)}
        className="relative group cursor-pointer bg-transparent border-0 p-0 w-32 h-32 focus:outline-none"
      >
        <div className="w-32 h-32 relative rounded-full overflow-hidden border-4 border-[#C4BD97]">
          <Image
            src={selectedAvatar || "/placeholder.svg"}
            alt="メンターアバター"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
          <span className="text-white text-sm">変更</span>
        </div>
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white rounded-lg p-6 max-w-md w-full mx-4 z-10">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <h3 className="text-lg font-medium mb-4">メンターアバターを選択</h3>

            <div className="grid grid-cols-3 gap-4 py-4">
              {defaultAvatars.map((avatar, index) => (
                <div
                  key={index}
                  className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                    selectedAvatar === avatar.url
                      ? "border-[#C4BD97] scale-105"
                      : "border-transparent hover:border-gray-300"
                  }`}
                  onClick={() => {
                    handleAvatarSelect(avatar.url)
                    setIsModalOpen(false)
                  }}
                >
                  <Image
                    src={avatar.url || "/placeholder.svg"}
                    alt={avatar.alt}
                    width={100}
                    height={100}
                    className="w-full h-auto object-cover aspect-square"
                  />
                </div>
              ))}
            </div>

            <div className="border-t pt-4 mt-4">
              <Label htmlFor="avatar-upload" className="block text-sm font-medium text-gray-700 mb-2">
                または、画像をアップロード
              </Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    handleFileUpload(e)
                    setIsModalOpen(false)
                  }}
                  disabled={isUploading}
                  className="hidden"
                />
                <Button asChild variant="outline" className="w-full" disabled={isUploading}>
                  <label htmlFor="avatar-upload" className="cursor-pointer flex items-center justify-center">
                    <Upload className="w-4 h-4 mr-2" />
                    {isUploading ? "アップロード中..." : "画像を選択"}
                  </label>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <h3 className="text-lg font-medium text-gray-900 mt-3">キャリアメンター</h3>
      <p className="text-sm text-gray-500">あなたのキャリアをサポートします</p>
    </div>
  )
}

export function Avatar({ isUser = false, className = "" }: AvatarProps) {
  return (
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center ${isUser ? "bg-blue-500" : "bg-gray-500"} text-white ${className}`}
    >
      {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
    </div>
  )
}

