import { Header } from '@/components/header';
import Providers from '@/components/providers';
import { getUserFromToken } from '@/lib/auth';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { cookies } from 'next/headers';
import { JSX } from 'react';
import './globals.css';

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
