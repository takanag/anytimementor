"import { ReactNode } from \"react"
import { cn } from "@/lib/utils"
import { Avatar } from "@/components/avatar"

interface MessageBubbleProps {
  children: ReactNode
  isUser?: boolean
  className?: string
}

export function MessageBubble({ children, isUser = false, className }: MessageBubbleProps) {
  return (
    <div className={cn("flex items-start gap-4", isUser ? "flex-row-reverse" : "flex-row", className)}>
      <div className="flex-shrink-0 mt-1">
        <Avatar isUser={isUser} />
      </div>
      <div
        className={cn(
          "p-4 rounded-lg max-w-[85%]",
          isUser ? "bg-blue-100 text-blue-900 rounded-tr-none" : "bg-gray-100 text-gray-900 rounded-tl-none",
        )}
      >
        {children}
      </div>
    </div>
  )
}

export default MessageBubble

