import './globals.css'

export const metadata = { title: 'Calculadora TH Private' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <body>{children}</body>
    </html>
  )
}