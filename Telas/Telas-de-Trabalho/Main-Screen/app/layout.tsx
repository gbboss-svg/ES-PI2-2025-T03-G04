import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Sidebar } from "@/components/sidebar"
import { ThemeProvider } from "@/components/theme-provider"
import { AppProvider } from "@/lib/store"
import { ToastProvider } from "@/components/ui/toast"
import { Suspense } from "react"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: "NotaDez - Sistema de Gestão de Notas",
  description: "Sistema de gerenciamento de notas e disciplinas para professores",
  generator: "v0.app",
  icons: {
    icon: "/logo-favicon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <AppProvider>
            <ToastProvider>
              <Suspense fallback={<div className="flex items-center justify-center h-screen">Carregando...</div>}>
                <Sidebar />
                <main className="transition-all duration-300 ease-in-out">{children}</main>
              </Suspense>
              <Analytics />
            </ToastProvider>
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
