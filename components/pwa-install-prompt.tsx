"use client"

import { useEffect, useState } from "react"
import { X, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true)
      return
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowPrompt(true)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowPrompt(false)
      setDeferredPrompt(null)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      setIsInstalled(true)
    }

    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  if (isInstalled || !showPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 bg-indigo-600 text-white rounded-lg shadow-lg p-4 flex items-center justify-between gap-4 md:left-auto md:right-4 md:max-w-sm">
      <div className="flex items-center gap-3">
        <Download className="w-5 h-5 flex-shrink-0" />
        <div>
          <p className="font-semibold text-sm">Install POS System</p>
          <p className="text-xs opacity-90">Akses offline & shortcut desktop</p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Button onClick={handleInstall} size="sm" className="bg-white text-indigo-600 hover:bg-gray-100">
          Install
        </Button>
        <button onClick={() => setShowPrompt(false)} className="p-1 hover:bg-indigo-700 rounded transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
