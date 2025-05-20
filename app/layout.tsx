<<<<<<< HEAD
import { Header } from '@/components/header';
import Providers from '@/components/providers';
import { getUserFromToken } from '@/lib/auth';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { cookies } from 'next/headers';
import { JSX } from 'react';
import './globals.css';
=======
import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Poppins } from 'next/font/google'
import Providers from "@/components/providers"
import { Header } from "@/components/header"
import { getUserFromToken } from "@/lib/auth"
import { cookies } from "next/headers"
import { Toaster } from "@/components/ui/sonner"
const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets : ['latin']
})
>>>>>>> main

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
<<<<<<< HEAD
    title: 'BrainBash - Real-Time Quiz App',
    description:
        'Create and participate in interactive quiz games in real-time',
    generator: 'v0.dev',
};
=======
  title: "yuno - real-time quiz app",
  description: "create and participate in interactive quiz games in real-time",
    generator: 'v0.dev'
}
>>>>>>> main

const RootLayout = async ({
    children,
}: {
<<<<<<< HEAD
    children: ReactNode;
}): Promise<JSX.Element> => {
    const user = await getUserFromToken();
    const cookieStore = await cookies(); // Get cookies
    const theme = cookieStore.get('theme')?.value; // Get the theme value
    return (
        <html lang="en" className={theme === 'dark' ? 'dark' : ''}>
            <body className={inter.className} suppressHydrationWarning={true}>
                <Providers>
                    <Header user={user} />
                    {children}
                </Providers>
            </body>
        </html>
    );
};

export default RootLayout;
=======
  children: React.ReactNode
}) {
  const user = await getUserFromToken();
  const cookieStore = await cookies() // Get cookies
  const theme = cookieStore.get("theme")?.value // Get the theme value
  return (
    <html lang="en" className={theme === "dark" ? "dark" : ""}>
      <body className={`${poppins.className} header-scroll-behind-rule`} suppressHydrationWarning={true}>
        <Providers>
          <Header user={user} />
          {children} 
        </Providers>
        <Toaster />
      </body>
    </html>
  )
}
>>>>>>> main
