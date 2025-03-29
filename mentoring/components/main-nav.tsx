import Link from "next/link"
import Image from "next/image"

export function MainNav() {
  return (
    <div className="flex items-center space-x-4 lg:space-x-6">
      <Link href="/" className="flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary">
        <div className="relative h-16 w-16">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Any%20time%20mentor%20logo-FBOxEywsp0r4qVCbTILsvbKY3h19Ui.jpeg"
            alt="ANY TIME MENTOR logo"
            width={64}
            height={64}
            className="object-contain"
          />
        </div>
        <span className="font-bold text-xl">ANY TIME MENTOR</span>
      </Link>
      <nav className="flex items-center space-x-4 lg:space-x-6">
        <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
          ダッシュボード
        </Link>
        <Link
          href="/sessions"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          セッション
        </Link>
        <Link
          href="/mentors"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          メンター
        </Link>
        <Link
          href="/resources"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          リソース
        </Link>
        <Link
          href="https://v0-any-time-mentor-marketplace.vercel.app/mypage"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          target="_blank"
          rel="noopener noreferrer"
        >
          マイページ
        </Link>
      </nav>
    </div>
  )
}

