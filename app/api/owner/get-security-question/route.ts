import { type NextRequest, NextResponse } from "next/server"

// Dalam production, simpan di database
const securityQuestion = "Nama hewan peliharaan pertama Anda?"
const securityAnswer = "kucing"

export async function GET(request: NextRequest) {
  try {
    if (!securityQuestion) {
      return NextResponse.json({ message: "Pertanyaan keamanan belum diatur" }, { status: 404 })
    }

    return NextResponse.json({ question: securityQuestion }, { status: 200 })
  } catch (error) {
    console.error("[v0] Get security question error:", error)
    return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 })
  }
}
