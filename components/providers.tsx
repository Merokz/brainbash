'use client';

import { useTheme } from 'next-themes';
import { ThemeProvider } from 'next-themes';
import { useState, useEffect } from 'react';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains("dark");
      document.cookie = `theme=${isDark ? "dark" : "light"}; path=/; max-age=31536000`;
    });
  
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  
    return () => observer.disconnect();
  }, []);
  

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </ThemeProvider>
  );
}