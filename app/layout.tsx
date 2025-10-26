import type React from "react"
import type { Metadata } from "next"
import { Suspense } from "react"
import "./globals.css"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"

export const metadata: Metadata = {
  title: "POS System - Kasir & Owner",
  description: "Sistem Point of Sale untuk Kasir dan Pemilik Toko",
  generator: "v0.app",
  manifest: "/manifest.json",
  themeColor: "#6366f1",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "POS System",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" className="light">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function getThemePreference() {
                  if (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) {
                    return localStorage.getItem('theme');
                  }
                  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                }
                const theme = getThemePreference();
                document.documentElement.classList.remove('light', 'dark');
                document.documentElement.classList.add(theme);
              })();
            `,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function () {
                  navigator.serviceWorker.register('/sw.js')
                    .catch(function (err) { console.log('[v0] SW registration failed:', err); });
                });
              }
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <Suspense fallback={null}>{children}</Suspense>
        <PWAInstallPrompt />
      </body>
    </html>
  )
}
