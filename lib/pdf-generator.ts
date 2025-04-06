import jsPDF from "jspdf"
import html2canvas from "html2canvas"

/**
 * 指定された要素のPDFを生成する（セクション分割実装）
 */
export async function generatePDF(elementId: string, filename = "certificate.pdf"): Promise<Blob> {
  try {
    // 対象の要素を取得
    const container = document.getElementById(elementId)
    if (!container) {
      throw new Error(`Element with ID "${elementId}" not found`)
    }

    console.log("PDF生成開始: セクションごとにキャプチャします")

    // PDFのサイズを設定（A4）
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    // ヘッダーセクションを取得
    const headerSection = container.querySelector(".header-section")

    // 各セクションを取得
    const sensibilitySection = document.getElementById("section-sensibility")
    const thinkingSection = document.getElementById("section-thinking")
    const willSection = document.getElementById("section-will")

    // フッターセクションを取得
    const footerSection = container.querySelector(".footer-section")

    if (!headerSection || !sensibilitySection || !thinkingSection || !willSection || !footerSection) {
      throw new Error("必要なセクションが見つかりません")
    }

    console.log("セクションを検出しました")

    // 画像を事前にロードする
    await preloadImages(container)

    // レーダーチャートのレンダリングを待機
    await waitForChartRendering()

    // ヘッダーと「自分の中にある感性」セクションを最初のページに追加
    await addSectionsToPage(pdf, [headerSection, sensibilitySection], 0)

    // 「自分の思考」セクションを2ページ目に追加
    pdf.addPage()
    await addSectionsToPage(pdf, [thinkingSection], 1)

    // 「自分の意志」セクションとフッターを3ページ目に追加
    pdf.addPage()
    await addSectionsToPage(pdf, [willSection, footerSection], 2)

    console.log("PDF生成完了")

    // PDFをBlobとして返す
    return pdf.output("blob")
  } catch (error) {
    console.error("PDF生成失敗:", error)
    throw error
  }
}

/**
 * 要素内のすべての画像を事前にロードする
 */
async function preloadImages(container: HTMLElement): Promise<void> {
  console.log("画像の事前ロードを開始します")
  const images = container.querySelectorAll("img")
  const imagePromises = Array.from(images).map((img) => {
    return new Promise<void>((resolve) => {
      // 既にロード済みの場合はすぐに解決
      if (img.complete) {
        console.log(`画像はすでにロード済み: ${img.src}`)
        resolve()
        return
      }

      // ロードイベントを設定
      const onLoad = () => {
        console.log(`画像のロードが完了: ${img.src}`)
        img.removeEventListener("load", onLoad)
        img.removeEventListener("error", onError)
        resolve()
      }

      // エラーイベントを設定
      const onError = () => {
        console.warn(`画像のロードに失敗: ${img.src}`)
        img.removeEventListener("load", onLoad)
        img.removeEventListener("error", onError)

        // エラー時はプレースホルダー画像を設定
        img.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f0f0f0'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='12' text-anchor='middle' dominant-baseline='middle' fill='%23999'%3EImage%3C/text%3E%3C/svg%3E`
        resolve()
      }

      // イベントリスナーを追加
      img.addEventListener("load", onLoad)
      img.addEventListener("error", onError)

      // CORSを設定
      if (!img.hasAttribute("crossorigin")) {
        img.setAttribute("crossorigin", "anonymous")
      }
    })
  })

  // タイムアウト設定（最大10秒）
  const timeout = new Promise<void>((resolve) => {
    setTimeout(() => {
      console.log("画像ロードのタイムアウト")
      resolve()
    }, 10000)
  })

  // すべての画像のロードを待機（またはタイムアウト）
  await Promise.race([Promise.all(imagePromises), timeout])
  console.log("画像の事前ロード完了")
}

/**
 * レーダーチャートのレンダリングが完了するのを待機する
 */
async function waitForChartRendering(): Promise<void> {
  return new Promise((resolve) => {
    // チャートのキャンバス要素を確認
    const checkChart = () => {
      const chartCanvas = document.querySelector("#radar-chart-container canvas")
      if (chartCanvas) {
        console.log("レーダーチャートのキャンバスを検出しました")
        // キャンバスが存在する場合、さらに少し待機してレンダリングを確実に完了させる
        setTimeout(resolve, 2000)
      } else {
        console.log("レーダーチャートのキャンバスを待機中...")
        setTimeout(checkChart, 300)
      }
    }

    // 最大15秒間待機
    const timeout = setTimeout(() => {
      console.log("レーダーチャートの待機がタイムアウトしました")
      resolve()
    }, 15000)

    // チェック開始
    checkChart()
  })
}

/**
 * 指定されたセクションをPDFのページに追加する
 */
async function addSectionsToPage(pdf, sections, pageIndex) {
  try {
    // 一時的なコンテナを作成
    const tempContainer = document.createElement("div")
    tempContainer.style.position = "absolute"
    tempContainer.style.left = "-9999px"
    tempContainer.style.top = "-9999px"
    tempContainer.style.width = "800px" // 元のコンテナと同じ幅
    document.body.appendChild(tempContainer)

    // セクションをコンテナに追加
    sections.forEach((section) => {
      const clone = section.cloneNode(true)
      tempContainer.appendChild(clone)
    })

    // ボタンを非表示
    const buttons = tempContainer.querySelectorAll("button")
    buttons.forEach((button) => {
      button.style.display = "none"
    })

    // html2canvasでキャプチャ
    const canvas = await html2canvas(tempContainer, {
      scale: 1.5,
      useCORS: true,
      allowTaint: true,
      logging: true,
      backgroundColor: "#ffffff",
      onclone: (documentClone) => {
        console.log(`クローン処理開始: ページ ${pageIndex + 1}`)

        // クローン内の画像を処理
        const images = documentClone.querySelectorAll("img")
        images.forEach((img) => {
          // CORSを設定
          img.setAttribute("crossorigin", "anonymous")

          // ブロブURLを検出して置き換え
          if (img.src.startsWith("blob:")) {
            console.log(`ブロブURLを検出: ${img.src}`)

            // ロゴ画像の場合は固定URLに置き換え
            if (img.alt && img.alt.includes("Logo")) {
              img.src =
                "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Any%20time%20mentor%20logo-g2zpGummxSMXbsYqrbBajqO3TwyTJD.jpeg"
            } else {
              // その他の画像はSVGプレースホルダーに置き換え
              img.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${img.width}' height='${img.height}' viewBox='0 0 ${img.width} ${img.height}'%3E%3Crect width='${img.width}' height='${img.height}' fill='%23f0f0f0'/%3E%3Ctext x='${img.width / 2}' y='${img.height / 2}' font-family='Arial' font-size='12' text-anchor='middle' dominant-baseline='middle' fill='%23999'%3EImage%3C/text%3E%3C/svg%3E`
            }
          }
        })

        // クローン内のレーダーチャートを処理
        if (pageIndex === 1) {
          // 思考セクション（2ページ目）にチャートがある場合
          const chartContainer = documentClone.querySelector("#radar-chart-container")
          if (chartContainer) {
            console.log("クローン内のレーダーチャートを処理します")

            // 元のチャートキャンバスを取得
            const originalCanvas = document.querySelector("#radar-chart-container canvas")
            if (originalCanvas) {
              console.log("元のレーダーチャートキャンバスを検出しました", originalCanvas.width, originalCanvas.height)

              try {
                // クローン内のチャートコンテナを取得
                const clonedChartContainer = documentClone.querySelector("#radar-chart-container")

                // 元のキャンバスの内容をクローンにコピー
                const newCanvas = documentClone.createElement("canvas")
                newCanvas.width = originalCanvas.width || 400
                newCanvas.height = originalCanvas.height || 400
                newCanvas.style.width = "100%"
                newCanvas.style.height = "100%"

                const ctx = newCanvas.getContext("2d")
                ctx.fillStyle = "#ffffff"
                ctx.fillRect(0, 0, newCanvas.width, newCanvas.height)

                try {
                  // キャンバスの内容をコピー
                  ctx.drawImage(originalCanvas, 0, 0)
                  console.log("レーダーチャートのキャンバスをコピーしました")
                } catch (e) {
                  console.error("キャンバスのコピー中にエラーが発生しました:", e)

                  // エラー時はプレースホルダーを描画
                  ctx.fillStyle = "#f0f0f0"
                  ctx.fillRect(0, 0, newCanvas.width, newCanvas.height)
                  ctx.font = "14px Arial"
                  ctx.fillStyle = "#999"
                  ctx.textAlign = "center"
                  ctx.fillText("Radar Chart", newCanvas.width / 2, newCanvas.height / 2)
                }

                // 既存のキャンバスを削除して新しいものに置き換え
                while (clonedChartContainer.firstChild) {
                  clonedChartContainer.removeChild(clonedChartContainer.firstChild)
                }
                clonedChartContainer.appendChild(newCanvas)
              } catch (e) {
                console.error("レーダーチャートの処理中にエラーが発生しました:", e)
              }
            } else {
              console.warn("元のレーダーチャートキャンバスが見つかりません")
            }
          }
        }
      },
    })

    // 一時的なコンテナを削除
    document.body.removeChild(tempContainer)

    // キャンバスをPDFに追加
    const imgWidth = 210 // A4の幅（mm）
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    // 画像が高すぎる場合は縮小
    const pageHeight = 297 // A4の高さ（mm）
    const maxHeight = pageHeight - 20 // 余白を考慮
    const finalImgHeight = Math.min(imgHeight, maxHeight)

    // 画像を中央に配置
    const x = 0
    const y = 10 // 上部に余白を追加

    pdf.addImage(canvas.toDataURL("image/png"), "PNG", x, y, imgWidth, finalImgHeight)

    console.log(`ページ ${pageIndex + 1} にセクションを追加しました`)
    return true
  } catch (error) {
    console.error(`ページ ${pageIndex + 1} の処理中にエラーが発生しました:`, error)
    throw error
  }
}

/**
 * PDFをダウンロードする
 */
export function downloadPDF(blob: Blob, filename: string): void {
  try {
    // Blobからダウンロードリンクを作成
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    console.log(`PDFダウンロード完了: ${filename}`)
  } catch (error) {
    console.error("PDFダウンロードエラー:", error)
    throw error
  }
}

/**
 * 予祝ロードマップPDFを生成する
 */
export function generateRoadmapPDF(data: any): jsPDF {
  console.log("PDF生成開始: 予祝ロードマップ", data)

  // PDFドキュメントの初期化 (A4サイズ)
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  return pdf
}

