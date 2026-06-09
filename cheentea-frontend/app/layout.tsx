import type React from "react"
import type { Metadata } from "next"
import { Playfair_Display, Inter } from "next/font/google"
import { Toaster } from "sonner"
import { CartProvider } from "@/context/cart-context"
import "./globals.css"

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" })
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: "Chantea - Premium Milk Tea Kiosk",
  description: "Order delicious milk tea, fruit tea, and snacks from Chantea",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-background text-foreground`}>
        <CartProvider>
          {children}
        </CartProvider>
        <Toaster
          position="top-center"
          expand={true}
          richColors
          toastOptions={{
            style: {
              fontFamily: 'var(--font-sans)',
            },
            classNames: {
              toast: 'rounded-2xl shadow-xl border-0',
              title: 'font-bold text-base',
              description: 'text-sm opacity-80',
              success: 'bg-matcha text-white',
              error: 'bg-coral text-white',
              info: 'bg-espresso text-cream',
            }
          }}
        />
      </body>
    </html>
  )
}
