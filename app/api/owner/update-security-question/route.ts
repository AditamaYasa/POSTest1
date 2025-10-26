import { type NextRequest, NextResponse } from "next/server"

// Dalam production, simpan di database
let securityQuestion = "Nama hewan peliharaan pertama Anda?"
let securityAnswer = "kucing"

export async function POST(request: NextRequest) {
  try {
    const { question, answer } = await request.json()

    // Verifikasi token
    const token = request.cookies.get("ownerToken")?.value
    if (!token) {
      return NextResponse.json({ message: "Tidak terautentikasi" }, { status: 401 })
    }

    if (!question || !answer) {
      return NextResponse.json({ message: "Pertanyaan dan jawaban diperlukan" }, { status: 400 })
    }

    // Update security question
    securityQuestion = question
    securityAnswer = answer

    return NextResponse.json({ message: "Pertanyaan keamanan berhasil diperbarui" }, { status: 200 })
  } catch (error) {
    console.error("[v0] Update security question error:", error)
    return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 })
  }
}
