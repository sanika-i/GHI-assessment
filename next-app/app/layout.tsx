import type { Metadata } from 'next'
import './global.css'

export const metadata: Metadata = { title: 'File Manager' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          {children}
        </div>
      </body>
    </html>
  )
}