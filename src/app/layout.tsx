import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AppProvider } from '@/contexts/AppContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DayPlanner Pro - Planifiez vos journées de manière interactive',
  description: 'Une application moderne et motivante pour organiser et optimiser votre productivité quotidienne',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.className} bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen`}>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  )
}