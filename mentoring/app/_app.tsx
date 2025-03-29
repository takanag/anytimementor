"use client"

import { useEffect } from "react"
import type { AppProps } from "next/app"
import { setLocalStorageOnlyMode, resetConsecutiveFailures } from "@/lib/data"

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // アプリケーション起動時にローカルストレージのみモードをリセット
    if (typeof window !== "undefined") {
      setLocalStorageOnlyMode(false)
      resetConsecutiveFailures()
      console.log("アプリケーション起動時にローカルストレージのみモードをリセットしました")
    }
  }, [])

  return <Component {...pageProps} />
}

export default MyApp

