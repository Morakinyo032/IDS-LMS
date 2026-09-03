import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/ThemeProvider';
import { brand } from '@/lib/brand';
import './globals.css';

export const metadata: Metadata = {
  title: `Intent Scholastic — Learning Management System`,
  description: 'Where Knowledge Sparks Transformation — Empowering individuals through education, training, and development.',
  icons: {
    icon: '/school-logo.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}