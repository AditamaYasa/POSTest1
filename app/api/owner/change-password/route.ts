import { type NextRequest, NextResponse } from "next/server"

// Dalam production, simpan di database
let ownerPassword = "pemilik123"

export async function POST(request: NextRequest) {
  try {
    const { currentPassword, newPassword } = await request.json()

    // Verifikasi token
    const token = request.cookies.get("ownerToken")?.value
    if (!token) {
      return NextResponse.json({ message: "Tidak terautentikasi" }, { status: 401 })
    }

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ message: "Password diperlukan" }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ message: "Password minimal 6 karakter" }, { status: 400 })
    }

    // Verifikasi password saat ini
    if (currentPassword !== ownerPassword) {
      return NextResponse.json({ message: "Password saat ini salah" }, { status: 401 })
    }

    // Update password
    ownerPassword = newPassword

    return NextResponse.json({ message: "Password berhasil diubah" }, { status: 200 })
  } catch (error) {
    console.error("[v0] Change password error:", error)
    return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 })
  }
}
