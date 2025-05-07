import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Providers from "@/components/providers";
import { DashboardHeader } from "@/components/dashboard-header";
import { getUserFromToken } from "@/lib/auth";

const inter = Inter({ subsets: ["latin"] })



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
      <body className={inter.className} suppressHydrationWarning={true}>
        <Providers>
          <DashboardHeader user={user} />
          {children}
        </Providers>
      </body>
    </html>
  )
}