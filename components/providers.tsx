'use client';

import { ThemeProvider } from 'next-themes';
import { JSX, ReactNode, useEffect, useState } from 'react';

const Providers = ({ children }: { children: ReactNode }): JSX.Element => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const observer = new MutationObserver(() => {
            const isDark = document.documentElement.classList.contains('dark');
            document.cookie = `theme=${isDark ? 'dark' : 'light'}; path=/; max-age=31536000`;
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => observer.disconnect();
    }, []);

    if (!mounted) {
        // eslint-disable-next-line react/jsx-no-useless-fragment
        return <>{children}</>;
    }

    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            {children}
        </ThemeProvider>
    );
};

export default Providers;
