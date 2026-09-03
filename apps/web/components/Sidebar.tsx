'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/components/ThemeProvider';
import { brand } from '@/lib/brand';

interface NavItem {
  label: string;
  href: string;
  icon: string;
  showFor?: string[];
}

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [collapsed, setCollapsed] = useState(false);
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

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/');

  const navItems: NavItem[] = [
    { label: 'Browse Courses', href: '/courses', icon: '📚' },
    { label: 'School Programs', href: '/school', icon: '🏫' },
    { label: 'Dashboard', href: '/dashboard', icon: '📊', showFor: ['STUDENT', 'INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN'] },
    { label: 'My School', href: '/school-dashboard', icon: '🎒', showFor: ['STUDENT', 'INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN'] },
    { label: 'My Learning', href: '/my-courses', icon: '📖', showFor: ['STUDENT', 'INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN'] },
    { label: 'Certificates', href: '/certificates', icon: '🏆', showFor: ['STUDENT', 'INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN'] },
    { label: 'Instructor Hub', href: '/instructor/courses', icon: '👨‍🏫', showFor: ['INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN'] },
    { label: 'Analytics', href: '/instructor/analytics', icon: '📈', showFor: ['INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN'] },
    { label: 'School Admin', href: '/admin/schools', icon: '⚙️', showFor: ['ADMIN', 'SUPER_ADMIN'] },
  ];

  const filteredItems = navItems.filter(item => {
    if (!item.showFor) return true;
    return user && item.showFor.includes(user.role);
  });

  // Group items
  const publicItems = filteredItems.filter(i => !i.showFor);
  const learningItems = filteredItems.filter(i => 
    ['Dashboard', 'My School', 'My Learning', 'Certificates'].includes(i.label)
  );
  const teachingItems = filteredItems.filter(i => 
    ['Instructor Hub', 'Analytics'].includes(i.label)
  );
  const adminItems = filteredItems.filter(i => 
    ['School Admin'].includes(i.label)
  );

  if (!mounted) return null;

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="fixed top-4 z-50 p-2 rounded-r-lg bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
        style={{ left: collapsed ? '0px' : '256px' }}
        title={collapsed ? 'Open sidebar' : 'Close sidebar'}
      >
        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {collapsed ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          )}
        </svg>
      </button>

      {/* Sidebar */}
      <aside
        style={{
          backgroundColor: 'var(--sb-bg)',
          borderColor: 'var(--border)',
        }}
        className={`h-full border-r transition-all duration-300 flex flex-col flex-shrink-0
          ${collapsed ? 'w-0 overflow-hidden border-0' : 'w-64'}`}
      >

        {/* Logo */}
        <div className="p-1 border-b border-gray-200 dark:border-gray-700">
          <Link href="/" className="flex items-center gap-0">
            <img 
              src="/school-logo.png" 
              alt={brand.schoolName} 
              className="h-24 w-24 object-contain flex-shrink-0"
            />
            <div className="leading-tight min-w-0">
              <h1 className="text-sm font-bold truncate" style={{ color: 'var(--teal)' }}>
                {brand.schoolName}
              </h1>
              <p className="text-[10px] truncate" style={{ color: 'var(--muted)' }}>
                {brand.tagline}
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-4">
          {/* Public */}
          <Section label="Explore" items={publicItems} isActive={isActive} />

          {user && (
            <>
              {/* Learning */}
              <Section label="Learning" items={learningItems} isActive={isActive} />
              
              {/* Teaching */}
              {teachingItems.length > 0 && (
                <Section label="Teaching" items={teachingItems} isActive={isActive} />
              )}
              
              {/* Admin */}
              {adminItems.length > 0 && (
                <Section label="Administration" items={adminItems} isActive={isActive} />
              )}
            </>
          )}
        </nav>

        {/* Bottom */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-3 space-y-2">
          {user ? (
            <>
              <div className="flex items-center gap-2 px-2">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ color: brand.colors.primary }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{user.name}</p>
                  <p className="text-[10px] text-gray-500">{user.role}</p>
                </div>
              </div>
              <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                🚪 Sign Out
              </button>
            </>
          ) : (
            <div className="space-y-2">
              <Link href="/login" className="block w-full text-center px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                Sign In
              </Link>
              <Link href="/register" className="block w-full text-center px-4 py-2 text-sm text-white rounded-lg" style={{ backgroundColor: brand.colors.primary }}>
                Register
              </Link>
            </div>
          )}
          <button onClick={toggleTheme} className="w-full px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </button>
        </div>
      </aside>
    </>
  );
}

// Section component
function Section({ label, items, isActive }: { label: string; items: NavItem[]; isActive: (href: string) => boolean }) {
  if (items.length === 0) return null;
  
  return (
    <div>
      <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted mb-1">
        {label}
      </p>
      {items.map(item => (
        <Link
          key={item.href}
          href={item.href}
          className={`sidebar-link flex items-center gap-3 px-3 py-2 rounded-lg text-sm mb-0.5 ${
            isActive(item.href) ? 'active' : ''
          }`}
        >
          <span className="text-lg flex-shrink-0">{item.icon}</span>
          <span className="truncate">{item.label}</span>
        </Link>
      ))}
    </div>
  );
}