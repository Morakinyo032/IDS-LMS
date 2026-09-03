'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';
import SchoolLogo from '@/components/SchoolLogo';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    checkUser();
    window.addEventListener('storage', checkUser);
    return () => window.removeEventListener('storage', checkUser);
  }, []);

  function checkUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try { setUser(JSON.parse(userStr)); } catch { setUser(null); }
    } else {
      setUser(null);
    }
  }

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/';
  }

  if (!mounted) {
    return (
      <nav className="border-b sticky top-0 z-40 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 py-3">
          <SchoolLogo size="sm" />
        </div>
      </nav>
    );
  }

  const isInstructor = user && ['INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN'].includes(user.role);
  const isAdmin = user && ['ADMIN', 'SUPER_ADMIN'].includes(user.role);

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link href="/">
          <SchoolLogo size="sm" />
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-5">
          <Link href="/courses" className="text-gray-600 dark:text-gray-300 hover:text-green-700 text-sm transition-colors">
            Courses
          </Link>
          <Link href="/school" className="text-gray-600 dark:text-gray-300 hover:text-green-700 text-sm transition-colors">
            School
          </Link>

          {user ? (
            <>
              <Link href="/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-green-700 text-sm transition-colors">
                Dashboard
              </Link>
              <Link href="/school-dashboard" className="text-gray-600 dark:text-gray-300 hover:text-green-700 text-sm transition-colors">
                🎒 My School
              </Link>
              <Link href="/my-courses" className="text-gray-600 dark:text-gray-300 hover:text-green-700 text-sm transition-colors">
                My Learning
              </Link>

              {isInstructor && (
                <Link href="/instructor/courses" className="text-gray-600 dark:text-gray-300 hover:text-green-700 text-sm transition-colors">
                  Teach
                </Link>
              )}

              {isAdmin && (
                <Link href="/admin/schools" className="text-gray-600 dark:text-gray-300 hover:text-green-700 text-sm transition-colors">
                  🏫 Admin
                </Link>
              )}

              <Link href="/certificates" className="text-gray-600 dark:text-gray-300 hover:text-green-700 text-sm transition-colors">
                Certificates
              </Link>

              <div className="flex items-center gap-3 border-l border-gray-200 dark:border-gray-600 pl-4 ml-2">
                <span className="text-sm text-gray-700 dark:text-gray-200 font-medium">
                  {user.name}
                </span>
                <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-400 transition-colors">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-gray-600 dark:text-gray-300 hover:text-green-700 text-sm transition-colors">
                Login
              </Link>
              <Link href="/register" className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 text-sm transition-colors">
                Sign Up
              </Link>
            </div>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-lg"
            title={theme === 'light' ? 'Dark mode' : 'Light mode'}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </div>
    </nav>
  );
}