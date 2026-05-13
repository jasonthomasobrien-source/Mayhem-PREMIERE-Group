import type { Metadata } from 'next'
import { Poppins, Geist } from 'next/font/google'
import '../styles/globals.css'
import { cn } from "@/lib/utils"
import { Navigation } from '@/components/Navigation'

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: 'Mayhem Sprint Tracker',
  description: 'Real-time outreach leaderboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className={`${poppins.variable} font-sans bg-brand-black text-white`}>
        <Navigation />
        {children}
      </body>
    </html>
  )
}
