import type React from 'react';
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Providers from '@/components/providers';
import { Header } from '@/components/header';
import { getUserFromToken } from '@/lib/auth';
import { JSX } from 'react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'BrainBash - Real-Time Quiz App',
    description:
        'Create and participate in interactive quiz games in real-time',
    generator: 'v0.dev',
};

const RootLayout = async ({
    children,
}: {
    children: React.ReactNode;
}): Promise<JSX.Element> => {
    const user = await getUserFromToken();
    return (
        <html lang="en">
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
