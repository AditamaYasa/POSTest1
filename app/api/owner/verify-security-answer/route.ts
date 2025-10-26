import { type NextRequest, NextResponse } from "next/server"

// Dalam production, simpan di database
const securityAnswer = "kucing"

export async function POST(request: NextRequest) {
  try {
    const { answer } = await request.json()

    if (!answer) {
      return NextResponse.json({ message: "Jawaban diperlukan" }, { status: 400 })
    }

    // Verifikasi jawaban (case-insensitive)
    if (answer.toLowerCase().trim() === securityAnswer.toLowerCase().trim()) {
      return NextResponse.json({ message: "Jawaban benar" }, { status: 200 })
    }

    return NextResponse.json({ message: "Jawaban salah" }, { status: 401 })
  } catch (error) {
    console.error("[v0] Verify security answer error:", error)
    return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 })
  }
}
