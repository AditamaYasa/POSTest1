"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { HelpCircle, ArrowLeft, CheckCircle } from "lucide-react"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<"question" | "answer" | "reset">("question")
  const [answer, setAnswer] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [securityQuestion, setSecurityQuestion] = useState("")

  const handleGetQuestion = async () => {
    setLoading(true)
    setError("")
    try {
      const response = await fetch("/api/owner/get-security-question")
      const data = await response.json()

      if (response.ok) {
        setSecurityQuestion(data.question)
        setStep("answer")
      } else {
        setError(data.message || "Gagal mengambil pertanyaan keamanan")
      }
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.")
      console.error("[v0] Get question error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyAnswer = async () => {
    setLoading(true)
    setError("")
    try {
      const response = await fetch("/api/owner/verify-security-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer }),
      })

      const data = await response.json()

      if (response.ok) {
        setStep("reset")
      } else {
        setError(data.message || "Jawaban salah")
      }
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.")
      console.error("[v0] Verify answer error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (newPassword !== confirmPassword) {
      setError("Password tidak cocok")
      return
    }

    if (newPassword.length < 6) {
      setError("Password minimal 6 karakter")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/owner/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Password berhasil direset. Silakan login kembali.")
        setTimeout(() => router.push("/owner/login"), 2000)
      } else {
        setError(data.message || "Gagal mereset password")
      }
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.")
      console.error("[v0] Reset password error:", err)
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
            <HelpCircle className="w-7 h-7 md:w-8 md:h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Lupa Password?</h1>
            <p className="text-sm md:text-base text-muted-foreground text-pretty px-2">
              Kami akan membantu Anda mereset password pemilik
            </p>
          </div>
        </div>

        {/* Content */}
        <Card>
          {step === "question" && (
            <>
              <CardHeader>
                <CardTitle className="text-lg">Mulai Proses Reset</CardTitle>
                <CardDescription>Klik tombol di bawah untuk memulai</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleGetQuestion} disabled={loading} className="w-full">
                  {loading ? "Memuat..." : "Dapatkan Pertanyaan Keamanan"}
                </Button>
              </CardContent>
            </>
          )}

          {step === "answer" && (
            <>
              <CardHeader>
                <CardTitle className="text-lg">Jawab Pertanyaan Keamanan</CardTitle>
                <CardDescription>Jawab dengan benar untuk melanjutkan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">Pertanyaan</label>
                  <p className="text-sm bg-muted p-3 rounded-md">{securityQuestion}</p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="answer" className="text-sm font-medium">
                    Jawaban
                  </label>
                  <Input
                    id="answer"
                    placeholder="Masukkan jawaban Anda"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <Button onClick={handleVerifyAnswer} disabled={loading || !answer} className="w-full">
                  {loading ? "Memverifikasi..." : "Verifikasi Jawaban"}
                </Button>
              </CardContent>
            </>
          )}

          {step === "reset" && (
            <>
              <CardHeader>
                <CardTitle className="text-lg">Reset Password Baru</CardTitle>
                <CardDescription>Buat password baru yang kuat</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleResetPassword} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert className="border-success bg-success/10">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <AlertDescription className="text-success">{success}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <label htmlFor="newPassword" className="text-sm font-medium">
                      Password Baru
                    </label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="Minimal 6 karakter"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-medium">
                      Konfirmasi Password
                    </label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Ulangi password baru"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading}
                    />
                  </div>

                  <Button type="submit" disabled={loading || !newPassword || !confirmPassword} className="w-full">
                    {loading ? "Mereset..." : "Reset Password"}
                  </Button>
                </form>
              </CardContent>
            </>
          )}
        </Card>

        {/* Back Button */}
        <div className="flex justify-center">
          <Button variant="ghost" onClick={() => router.push("/owner/login")} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Login
          </Button>
        </div>
      </div>
    </div>
  )
}
