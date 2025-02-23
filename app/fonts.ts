import { Inter, Roboto } from 'next/font/google'

export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

// Using Roboto for our "helvetica-bold" styles
export const helvetica = Roboto({
  weight: '700', // Only loading the bold weight since that's what we use
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-helvetica',
  style: 'normal',
}) 