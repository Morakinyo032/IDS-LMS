'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface SchoolGuardProps {
  children: React.ReactNode;
  schoolId?: string;
  subjectId?: string;
}

export default function SchoolGuard({ children, schoolId, subjectId }: SchoolGuardProps) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAccess();
  }, []);

  function checkAccess() {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      setAuthorized(false);
      setLoading(false);
      return;
    }

    try {
      const user = JSON.parse(userStr);
      
      // Admins and instructors can access everything
      if (['ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR'].includes(user.role)) {
        setAuthorized(true);
        setLoading(false);
        return;
      }

      // Students can only access if enrolled
      // For now, allow logged-in students to browse
      setAuthorized(true);
    } catch {
      setAuthorized(false);
    }
    
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Checking access...</div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center card p-8 max-w-md">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-xl font-bold mb-2">Login Required</h2>
          <p className="text-gray-500 mb-6">Please log in to access school content.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/login" className="px-6 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800">
              Login
            </Link>
            <Link href="/register" className="px-6 py-2 border rounded-lg hover:bg-gray-50">
              Register
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}