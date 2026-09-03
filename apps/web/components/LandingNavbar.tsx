'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import { brand } from '@/lib/brand';

export default function LandingNavbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, []);

  return (
    <nav
      className="sticky top-0 z-40 border-b backdrop-blur-sm"
      style={{
        backgroundColor: 'var(--sb-bg)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="container mx-auto px-0.5 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-0">
          <img
            src={brand.logoPath}
            alt={brand.schoolName}
            className="h-20 w-auto object-contain"
          />
          <span
            className="font-bold text-lg hidden sm:block"
            style={{ color: 'var(--teal)' }}
          >
            {brand.schoolName}
          </span>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-4">
          <Link
            href="/courses"
            className="text-sm font-medium transition-colors hover:underline"
            style={{ color: 'var(--muted)' }}
          >
            Courses
          </Link>
          <Link
            href="/school"
            className="text-sm font-medium transition-colors hover:underline"
            style={{ color: 'var(--muted)' }}
          >
            School
          </Link>

          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90"
              style={{ backgroundColor: 'var(--teal)', color: '#fff' }}
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium transition-colors hover:underline"
                style={{ color: 'var(--muted)' }}
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90"
                style={{ backgroundColor: 'var(--gold)', color: '#000' }}
              >
                Get Started
              </Link>
            </>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg transition-colors hover:opacity-80"
            style={{ backgroundColor: 'var(--sb-active-bg)' }}
            title={theme === 'light' ? 'Dark mode' : 'Light mode'}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </div>
    </nav>
  );
}