import { type NextRequest, NextResponse } from "next/server"

// Default password - dalam production, simpan di database dengan hash
const DEFAULT_PASSWORD = "pemilik123"

// Simple token generation (dalam production, gunakan JWT)
function generateToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json({ message: "Password diperlukan" }, { status: 400 })
    }

    // Verifikasi password
    if (password === DEFAULT_PASSWORD) {
      const token = generateToken()
      // Dalam production, simpan token di database dengan expiry time
      const response = NextResponse.json({ token, message: "Login berhasil" }, { status: 200 })
      response.cookies.set("ownerToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60, // 24 jam
      })
      return response
    }

    return NextResponse.json({ message: "Password salah" }, { status: 401 })
  } catch (error) {
    console.error("[v0] Verify password error:", error)
    return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 })
  }
}
