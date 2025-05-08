import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Poppins } from 'next/font/google'
import Providers from "@/components/providers";
import { Header } from "@/components/header";
import { getUserFromToken } from "@/lib/auth";

//const inter = Inter({ subsets: ["latin"] })
const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets : ['latin']
})


export const metadata: Metadata = {
  title: "BrainBash - Real-Time Quiz App",
  description: "Create and participate in interactive quiz games in real-time",
    generator: 'v0.dev'
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUserFromToken();
  return (
    <html lang="en">
      <body className={poppins.className} suppressHydrationWarning={true}>
        <Providers>
          <Header user={user} />
          {children}
        </Providers>
      </body>
    </html>
  )
}