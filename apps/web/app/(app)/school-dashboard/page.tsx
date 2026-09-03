'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface SchoolEnrollment {
  id: string;
  progress: number;
  subject: {
    id: string;
    name: string;
    code: string | null;
    class: {
      id: string;
      name: string;
      school: {
        id: string;
        name: string;
      };
    };
  };
}

export default function SchoolDashboardPage() {
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<SchoolEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }

    const userStr = localStorage.getItem('user');
    if (userStr) setUserName(JSON.parse(userStr).name);

    fetchData();
  }, []);

  async function fetchData() {
    try {
      const res = await api.get('/api/school/my-subjects');
      setEnrollments(res.data.enrollments || []);
    } catch (err) {
      console.error('Failed:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // Group by school
  const grouped: Record<string, SchoolEnrollment[]> = {};
  enrollments.forEach(e => {
    const schoolName = e.subject.class.school.name;
    if (!grouped[schoolName]) grouped[schoolName] = [];
    grouped[schoolName].push(e);
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">🎒 My School Dashboard</h1>
      <p className="text-gray-500 mb-8">Welcome back, {userName}!</p>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{enrollments.length}</div>
          <div className="text-sm text-gray-500">Enrolled Subjects</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {enrollments.filter(e => e.progress >= 50).length}
          </div>
          <div className="text-sm text-gray-500">In Progress</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {Object.keys(grouped).length}
          </div>
          <div className="text-sm text-gray-500">Schools</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / (enrollments.length || 1))}%
          </div>
          <div className="text-sm text-gray-500">Avg Progress</div>
        </div>
      </div>

      {enrollments.length === 0 ? (
        <div className="text-center py-16 card">
          <p className="text-lg text-gray-500 mb-4">You're not enrolled in any schools yet.</p>
          <Link href="/school" className="text-blue-600 hover:underline">Browse Schools →</Link>
        </div>
      ) : (
        Object.entries(grouped).map(([schoolName, subjects]) => (
          <div key={schoolName} className="mb-8">
            <h2 className="text-xl font-bold mb-4">🏫 {schoolName}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map(enrollment => (
                <Link
                  key={enrollment.id}
                  href={`/school/${enrollment.subject.class.school.id}/${enrollment.subject.class.id}/${enrollment.subject.id}`}
                  className="card p-5 hover:shadow-lg transition-shadow block"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{enrollment.subject.name}</h3>
                      <p className="text-sm text-gray-500">{enrollment.subject.class.name}</p>
                    </div>
                    <span className="text-2xl">
                      {enrollment.subject.name.includes('Math') ? '🔢' :
                       enrollment.subject.name.includes('English') ? '📖' :
                       enrollment.subject.name.includes('Physics') ? '⚡' :
                       enrollment.subject.name.includes('Chemistry') ? '🧪' : '📚'}
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{Math.round(enrollment.progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${enrollment.progress}%` }}
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}