"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Store } from "lucide-react"

interface StoreData {
  storeName: string
  storeAddress: string
  storePhone: string
}

export function StoreSettings() {
  const [storeName, setStoreName] = useState("")
  const [storeAddress, setStoreAddress] = useState("")
  const [storePhone, setStorePhone] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load store data on mount
  useEffect(() => {
    const loadStoreData = () => {
      try {
        const saved = localStorage.getItem("storeData")
        if (saved) {
          const data: StoreData = JSON.parse(saved)
          setStoreName(data.storeName || "TOKO SERBAGUNA")
          setStoreAddress(data.storeAddress || "Jl. Contoh No. 123, Jakarta")
          setStorePhone(data.storePhone || "(021) 1234-5678")
        } else {
          // Set default values
          setStoreName("TOKO SERBAGUNA")
          setStoreAddress("Jl. Contoh No. 123, Jakarta")
          setStorePhone("(021) 1234-5678")
        }
      } catch (err) {
        console.error("[v0] Error loading store data:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadStoreData()
  }, [])

  const handleSaveStoreData = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!storeName.trim()) {
      setError("Nama toko tidak boleh kosong")
      return
    }

    if (!storeAddress.trim()) {
      setError("Alamat toko tidak boleh kosong")
      return
    }

    if (!storePhone.trim()) {
      setError("Nomor telepon tidak boleh kosong")
      return
    }

    setLoading(true)
    try {
      const storeData: StoreData = {
        storeName: storeName.trim(),
        storeAddress: storeAddress.trim(),
        storePhone: storePhone.trim(),
      }

      // Save to localStorage
      localStorage.setItem("storeData", JSON.stringify(storeData))

      // Dispatch event untuk update receipt component
      window.dispatchEvent(
        new CustomEvent("storeDataUpdated", {
          detail: storeData,
        }),
      )

      setSuccess("Data toko berhasil disimpan")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError("Gagal menyimpan data toko")
      console.error("[v0] Save store data error:", err)
    } finally {
      setLoading(false)
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Memuat data toko...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="w-5 h-5" />
          Informasi Toko
        </CardTitle>
        <CardDescription>Kelola informasi toko yang akan ditampilkan di struk transaksi</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSaveStoreData} className="space-y-4">
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
            <label htmlFor="storeName" className="text-sm font-medium">
              Nama Toko
            </label>
            <Input
              id="storeName"
              placeholder="Masukkan nama toko"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="storeAddress" className="text-sm font-medium">
              Alamat Toko
            </label>
            <Textarea
              id="storeAddress"
              placeholder="Masukkan alamat toko lengkap"
              value={storeAddress}
              onChange={(e) => setStoreAddress(e.target.value)}
              disabled={loading}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="storePhone" className="text-sm font-medium">
              Nomor Telepon
            </label>
            <Input
              id="storePhone"
              placeholder="Masukkan nomor telepon toko"
              value={storePhone}
              onChange={(e) => setStorePhone(e.target.value)}
              disabled={loading}
            />
          </div>

          <Button type="submit" disabled={loading || !storeName || !storeAddress || !storePhone}>
            {loading ? "Menyimpan..." : "Simpan Data Toko"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
