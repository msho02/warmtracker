import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'WarmTracker',
  description: 'Plataforma de aquecimento de contas',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
