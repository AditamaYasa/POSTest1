import { type NextRequest, NextResponse } from "next/server"

// Dalam production, simpan di database
let ownerPassword = "pemilik123"

export async function POST(request: NextRequest) {
  try {
    const { newPassword } = await request.json()

    if (!newPassword) {
      return NextResponse.json({ message: "Password diperlukan" }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ message: "Password minimal 6 karakter" }, { status: 400 })
    }

    // Update password
    ownerPassword = newPassword

    return NextResponse.json({ message: "Password berhasil direset" }, { status: 200 })
  } catch (error) {
    console.error("[v0] Reset password error:", error)
    return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 })
  }
}
