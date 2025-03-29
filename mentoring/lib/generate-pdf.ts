import jsPDF from "jspdf"
import type { WorksheetData } from "@/types/worksheet"
import { formatDate } from "./utils"

// PDFのフォントサイズ定義
const FONT_SIZES = {
  TITLE: 24,
  SUBTITLE: 18,
  HEADING: 16,
  SUBHEADING: 14,
  NORMAL: 12,
  SMALL: 10,
}

// PDFの色定義
const COLORS = {
  PRIMARY: [41, 98, 255], // #2962FF (青)
  SECONDARY: [0, 0, 0], // 黒
  ACCENT: [245, 124, 0], // #F57C00 (オレンジ)
  BACKGROUND: [255, 255, 255], // 白
}

// マージン設定
const MARGIN = {
  TOP: 20,
  RIGHT: 20,
  BOTTOM: 20,
  LEFT: 20,
}

// ページサイズ
const PAGE_WIDTH = 210 // A4幅 (mm)
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN.LEFT - MARGIN.RIGHT

/**
 * 予祝ロードマップPDFを生成する
 */
export function generateRoadmapPDF(data: WorksheetData): jsPDF {
  console.log("PDF生成開始: 予祝ロードマップ", data)

  // PDFドキュメントの初期化 (A4サイズ)
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  try {
    // フォント設定
    doc.setFont("helvetica", "normal")

    // ヘッダー部分
    addHeader(doc, data)

    // 現在のY位置を取得
    let yPos = 60

    // 目標設定セクション
    yPos = addGoalSection(doc, data, yPos)

    // 現在のY位置が一定以上なら改ページ
    if (yPos > 240) {
      doc.addPage()
      yPos = MARGIN.TOP
    }

    // 行動計画セクション
    yPos = addActionPlanSection(doc, data, yPos)

    // 現在のY位置が一定以上なら改ページ
    if (yPos > 240) {
      doc.addPage()
      yPos = MARGIN.TOP
    }

    // 予祝セクション
    yPos = addYoshukuSection(doc, data, yPos)

    // フッター
    addFooter(doc)

    console.log("PDF生成完了")
    return doc
  } catch (error) {
    console.error("PDF生成エラー:", error)
    throw error
  }
}

/**
 * ヘッダーを追加
 */
function addHeader(doc: jsPDF, data: WorksheetData): void {
  // タイトル
  doc.setFontSize(FONT_SIZES.TITLE)
  doc.setTextColor(COLORS.PRIMARY[0], COLORS.PRIMARY[1], COLORS.PRIMARY[2])
  doc.text("予祝ロードマップ", PAGE_WIDTH / 2, MARGIN.TOP, { align: "center" })

  // 日付
  doc.setFontSize(FONT_SIZES.SMALL)
  doc.setTextColor(COLORS.SECONDARY[0], COLORS.SECONDARY[1], COLORS.SECONDARY[2])
  const today = formatDate(new Date())
  doc.text(`作成日: ${today}`, PAGE_WIDTH - MARGIN.RIGHT, MARGIN.TOP, { align: "right" })

  // 名前
  const name = data.mentoring?.name || "名前なし"
  doc.setFontSize(FONT_SIZES.NORMAL)
  doc.text(`名前: ${name}`, MARGIN.LEFT, MARGIN.TOP + 15)

  // 区切り線
  doc.setDrawColor(COLORS.PRIMARY[0], COLORS.PRIMARY[1], COLORS.PRIMARY[2])
  doc.setLineWidth(0.5)
  doc.line(MARGIN.LEFT, MARGIN.TOP + 20, PAGE_WIDTH - MARGIN.RIGHT, MARGIN.TOP + 20)
}

/**
 * 目標設定セクションを追加
 */
function addGoalSection(doc: jsPDF, data: WorksheetData, startY: number): number {
  let yPos = startY

  // セクションタイトル
  doc.setFontSize(FONT_SIZES.HEADING)
  doc.setTextColor(COLORS.PRIMARY[0], COLORS.PRIMARY[1], COLORS.PRIMARY[2])
  doc.text("1. 目標設定", MARGIN.LEFT, yPos)
  yPos += 10

  // 目標データの取得
  const goal = data.mentoring?.goal || "目標が設定されていません"
  const deadline = data.mentoring?.deadline || "期限が設定されていません"

  // 目標内容
  doc.setFontSize(FONT_SIZES.SUBHEADING)
  doc.setTextColor(COLORS.SECONDARY[0], COLORS.SECONDARY[1], COLORS.SECONDARY[2])
  doc.text("達成したい目標:", MARGIN.LEFT, yPos)
  yPos += 7

  // 目標テキスト（長文対応）
  doc.setFontSize(FONT_SIZES.NORMAL)
  const goalLines = doc.splitTextToSize(goal, CONTENT_WIDTH)
  doc.text(goalLines, MARGIN.LEFT, yPos)
  yPos += goalLines.length * 7 + 5

  // 期限
  doc.setFontSize(FONT_SIZES.SUBHEADING)
  doc.text("目標達成期限:", MARGIN.LEFT, yPos)
  yPos += 7

  doc.setFontSize(FONT_SIZES.NORMAL)
  doc.text(deadline, MARGIN.LEFT, yPos)
  yPos += 15

  return yPos
}

/**
 * 行動計画セクションを追加
 */
function addActionPlanSection(doc: jsPDF, data: WorksheetData, startY: number): number {
  let yPos = startY

  // セクションタイトル
  doc.setFontSize(FONT_SIZES.HEADING)
  doc.setTextColor(COLORS.PRIMARY[0], COLORS.PRIMARY[1], COLORS.PRIMARY[2])
  doc.text("2. 行動計画", MARGIN.LEFT, yPos)
  yPos += 10

  // 行動計画データの取得
  const actions = data.mentoring?.actions || []

  if (actions.length === 0) {
    doc.setFontSize(FONT_SIZES.NORMAL)
    doc.setTextColor(COLORS.SECONDARY[0], COLORS.SECONDARY[1], COLORS.SECONDARY[2])
    doc.text("行動計画が設定されていません", MARGIN.LEFT, yPos)
    return yPos + 10
  }

  // 各行動計画を追加
  actions.forEach((action, index) => {
    // 改ページ判定
    if (yPos > 250) {
      doc.addPage()
      yPos = MARGIN.TOP
    }

    doc.setFontSize(FONT_SIZES.SUBHEADING)
    doc.setTextColor(COLORS.ACCENT[0], COLORS.ACCENT[1], COLORS.ACCENT[2])
    doc.text(`行動 ${index + 1}:`, MARGIN.LEFT, yPos)
    yPos += 7

    doc.setFontSize(FONT_SIZES.NORMAL)
    doc.setTextColor(COLORS.SECONDARY[0], COLORS.SECONDARY[1], COLORS.SECONDARY[2])

    // 行動内容（長文対応）
    const actionText = action.text || "行動内容なし"
    const actionLines = doc.splitTextToSize(actionText, CONTENT_WIDTH)
    doc.text(actionLines, MARGIN.LEFT, yPos)
    yPos += actionLines.length * 7

    // 期限
    const deadline = action.deadline || "期限なし"
    doc.text(`期限: ${deadline}`, MARGIN.LEFT, yPos)
    yPos += 10
  })

  return yPos + 5
}

/**
 * 予祝セクションを追加
 */
function addYoshukuSection(doc: jsPDF, data: WorksheetData, startY: number): number {
  let yPos = startY

  // セクションタイトル
  doc.setFontSize(FONT_SIZES.HEADING)
  doc.setTextColor(COLORS.PRIMARY[0], COLORS.PRIMARY[1], COLORS.PRIMARY[2])
  doc.text("3. 予祝", MARGIN.LEFT, yPos)
  yPos += 10

  // 予祝データの取得
  const yoshuku = data.mentoring?.yoshuku || "予祝が設定されていません"

  // 予祝内容
  doc.setFontSize(FONT_SIZES.SUBHEADING)
  doc.setTextColor(COLORS.SECONDARY[0], COLORS.SECONDARY[1], COLORS.SECONDARY[2])
  doc.text("目標達成後のイメージ:", MARGIN.LEFT, yPos)
  yPos += 7

  // 予祝テキスト（長文対応）
  doc.setFontSize(FONT_SIZES.NORMAL)
  const yoshukuLines = doc.splitTextToSize(yoshuku, CONTENT_WIDTH)
  doc.text(yoshukuLines, MARGIN.LEFT, yPos)
  yPos += yoshukuLines.length * 7 + 10

  // 予祝の効果説明
  doc.setFontSize(FONT_SIZES.SMALL)
  doc.setTextColor(COLORS.PRIMARY[0], COLORS.PRIMARY[1], COLORS.PRIMARY[2])
  const yoshukuInfo = "予祝とは、まだ実現していない未来の出来事を、あたかもすでに実現したかのように祝うことです。"
  const yoshukuInfo2 = "目標達成後の姿を具体的にイメージすることで、モチベーションの維持と目標達成の確率が高まります。"

  const infoLines1 = doc.splitTextToSize(yoshukuInfo, CONTENT_WIDTH)
  const infoLines2 = doc.splitTextToSize(yoshukuInfo2, CONTENT_WIDTH)

  doc.text(infoLines1, MARGIN.LEFT, yPos)
  yPos += infoLines1.length * 5
  doc.text(infoLines2, MARGIN.LEFT, yPos)
  yPos += infoLines2.length * 5 + 5

  return yPos
}

/**
 * フッターを追加
 */
function addFooter(doc: jsPDF): void {
  const pageCount = doc.getNumberOfPages()

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)

    // ページ番号
    doc.setFontSize(FONT_SIZES.SMALL)
    doc.setTextColor(COLORS.SECONDARY[0], COLORS.SECONDARY[1], COLORS.SECONDARY[2])
    doc.text(`${i} / ${pageCount}`, PAGE_WIDTH / 2, 285, { align: "center" })

    // フッターテキスト
    doc.text("Any Time Mentor - 予祝ロードマップ", PAGE_WIDTH / 2, 290, { align: "center" })
  }
}

/**
 * PDFをダウンロードする
 */
export function downloadPDF(doc: jsPDF, filename: string): void {
  try {
    doc.save(filename)
    console.log(`PDFダウンロード完了: ${filename}`)
  } catch (error) {
    console.error("PDFダウンロードエラー:", error)
    throw error
  }
}

