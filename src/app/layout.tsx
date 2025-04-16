import type { Metadata } from 'next'
import { Inter, Commissioner } from 'next/font/google'
import './globals.css'

// Google fonts
const commissioner = Commissioner({
  subsets: ['latin'],
  variable: '--font-commissioner',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Happy Patient System',
  description: 'Medical center appointment management system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${commissioner.variable} ${inter.variable}`}>
        {children}
      </body>
    </html>
  )
}