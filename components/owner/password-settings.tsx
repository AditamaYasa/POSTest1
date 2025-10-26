"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react"
import { StoreSettings } from "./store-settings"

export function PasswordSettings() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [securityQuestion, setSecurityQuestion] = useState("")
  const [securityAnswer, setSecurityAnswer] = useState("")
  const [showPasswords, setShowPasswords] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (newPassword !== confirmPassword) {
      setError("Password baru tidak cocok")
      return
    }

    if (newPassword.length < 6) {
      setError("Password minimal 6 karakter")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/owner/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Password berhasil diubah")
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
        setTimeout(() => setSuccess(""), 3000)
      } else {
        setError(data.message || "Gagal mengubah password")
      }
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.")
      console.error("[v0] Change password error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateSecurityQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!securityQuestion.trim() || !securityAnswer.trim()) {
      setError("Pertanyaan dan jawaban keamanan tidak boleh kosong")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/owner/update-security-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: securityQuestion,
          answer: securityAnswer,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Pertanyaan keamanan berhasil diperbarui")
        setSecurityQuestion("")
        setSecurityAnswer("")
        setDialogOpen(false)
        setTimeout(() => setSuccess(""), 3000)
      } else {
        setError(data.message || "Gagal memperbarui pertanyaan keamanan")
      }
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.")
      console.error("[v0] Update security question error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <StoreSettings />

      {/* Change Password Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Ubah Password
          </CardTitle>
          <CardDescription>Perbarui password pemilik Anda secara berkala untuk keamanan maksimal</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
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
              <label htmlFor="currentPassword" className="text-sm font-medium">
                Password Saat Ini
              </label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPasswords ? "text" : "password"}
                  placeholder="Masukkan password saat ini"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={loading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={loading}
                >
                  {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium">
                Password Baru
              </label>
              <Input
                id="newPassword"
                type={showPasswords ? "text" : "password"}
                placeholder="Minimal 6 karakter"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Konfirmasi Password Baru
              </label>
              <Input
                id="confirmPassword"
                type={showPasswords ? "text" : "password"}
                placeholder="Ulangi password baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <Button type="submit" disabled={loading || !currentPassword || !newPassword || !confirmPassword}>
              {loading ? "Mengubah..." : "Ubah Password"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Security Question Card */}
      <Card>
        <CardHeader>
          <CardTitle>Pertanyaan Keamanan</CardTitle>
          <CardDescription>Atur pertanyaan keamanan untuk reset password jika lupa</CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Atur Pertanyaan Keamanan</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Atur Pertanyaan Keamanan</DialogTitle>
                <DialogDescription>
                  Pertanyaan ini akan digunakan untuk verifikasi jika Anda lupa password
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleUpdateSecurityQuestion} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <label htmlFor="question" className="text-sm font-medium">
                    Pertanyaan Keamanan
                  </label>
                  <Input
                    id="question"
                    placeholder="Contoh: Nama hewan peliharaan pertama Anda?"
                    value={securityQuestion}
                    onChange={(e) => setSecurityQuestion(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="answer" className="text-sm font-medium">
                    Jawaban
                  </label>
                  <Input
                    id="answer"
                    placeholder="Masukkan jawaban Anda"
                    value={securityAnswer}
                    onChange={(e) => setSecurityAnswer(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={loading}>
                    Batal
                  </Button>
                  <Button type="submit" disabled={loading || !securityQuestion || !securityAnswer}>
                    {loading ? "Menyimpan..." : "Simpan"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  )
}
