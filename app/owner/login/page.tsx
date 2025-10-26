"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock, ArrowLeft, Eye, EyeOff } from "lucide-react"
import Link from "next/link"

export default function OwnerLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/owner/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (response.ok) {
        // Simpan token di localStorage
        localStorage.setItem("ownerToken", data.token)
        router.push("/owner")
      } else {
        setError(data.message || "Password salah")
      }
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.")
      console.error("[v0] Login error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-3 md:p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-primary/10 rounded-2xl mx-auto">
            <Lock className="w-7 h-7 md:w-8 md:h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Akses Pemilik</h1>
            <p className="text-sm md:text-base text-muted-foreground text-pretty px-2">
              Masukkan password untuk mengakses dashboard pemilik
            </p>
          </div>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Verifikasi Password</CardTitle>
            <CardDescription>Hanya pemilik yang dapat mengakses halaman ini</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan password pemilik"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading || !password}>
                {loading ? "Memverifikasi..." : "Masuk"}
              </Button>
            </form>

            {/* Forgot Password Link */}
            <div className="mt-4 text-center">
              <Link href="/owner/forgot-password" className="text-sm text-primary hover:underline">
                Lupa password?
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="flex justify-center">
          <Button variant="ghost" onClick={() => router.push("/")} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Button>
        </div>
      </div>
    </div>
  )
}
