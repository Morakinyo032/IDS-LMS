'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface CourseProgress {
  id: string;
  courseId: string;
  progress: number;
  course: {
    id: string;
    title: string;
    instructor: { name: string };
  };
}

interface Stats {
  enrolledCourses: number;
  completedCourses: number;
  certificates: number;
  totalProgress: number;
}

export default function StudentDashboardPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<CourseProgress[]>([]);
  const [stats, setStats] = useState<Stats>({
    enrolledCourses: 0,
    completedCourses: 0,
    certificates: 0,
    totalProgress: 0,
  });
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token) {
      router.push('/login');
      return;
    }
    
    if (userStr) {
      setUserName(JSON.parse(userStr).name);
    }
    
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      const [enrollRes, certRes] = await Promise.all([
        api.get('/api/enrollments/my-courses'),
        api.get('/api/certificates'),
      ]);

      const enrollments = enrollRes.data.enrollments;
      const certificates = certRes.data.certificates;

      setCourses(enrollments);
      setStats({
        enrolledCourses: enrollments.length,
        completedCourses: enrollments.filter((e: any) => e.progress === 100).length,
        certificates: certificates.length,
        totalProgress: enrollments.length > 0
          ? Math.round(enrollments.reduce((sum: number, e: any) => sum + e.progress, 0) / enrollments.length)
          : 0,
      });
    } catch (err) {
      console.error('Failed to fetch dashboard:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading dashboard...</div>
      </div>
    );
  }

  const inProgressCourses = courses.filter(c => c.progress < 100);
  const completedCourses = courses.filter(c => c.progress === 100);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome back, {userName}! 👋</h1>
        <p className="text-gray-500 mt-2">Here's your learning overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-blue-600">{stats.enrolledCourses}</div>
          <div className="text-sm text-gray-500 mt-1">Enrolled Courses</div>
        </div>
        <div className="bg-white border rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-green-600">{stats.completedCourses}</div>
          <div className="text-sm text-gray-500 mt-1">Completed</div>
        </div>
        <div className="bg-white border rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-yellow-600">{stats.certificates}</div>
          <div className="text-sm text-gray-500 mt-1">Certificates</div>
        </div>
        <div className="bg-white border rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-purple-600">{stats.totalProgress}%</div>
          <div className="text-sm text-gray-500 mt-1">Overall Progress</div>
        </div>
      </div>

      {/* In Progress Courses */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">📚 Continue Learning</h2>
        {inProgressCourses.length === 0 ? (
          <div className="bg-white border rounded-lg p-8 text-center text-gray-500">
            <p className="mb-4">You're not currently learning any course.</p>
            <Link href="/courses" className="text-blue-600 hover:underline">
              Browse courses →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inProgressCourses.map((enrollment) => (
              <div key={enrollment.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="font-semibold mb-2">{enrollment.course.title}</h3>
                <p className="text-sm text-gray-500 mb-3">By {enrollment.course.instructor.name}</p>
                
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{Math.round(enrollment.progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${enrollment.progress}%` }}
                    />
                  </div>
                </div>

                <Link
                  href={`/my-courses/${enrollment.course.id}`}
                  className="inline-block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  Continue Learning
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Courses */}
      {completedCourses.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">✅ Completed Courses</h2>
          <div className="space-y-2">
            {completedCourses.map((enrollment) => (
              <div key={enrollment.id} className="bg-white border rounded-lg p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{enrollment.course.title}</h3>
                  <p className="text-sm text-gray-500">By {enrollment.course.instructor.name}</p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/my-courses/${enrollment.course.id}`}
                    className="px-3 py-1 border rounded text-sm hover:bg-gray-50"
                  >
                    Review
                  </Link>
                  <Link
                    href="/certificates"
                    className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
                  >
                    🏆 Certificate
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div>
        <h2 className="text-xl font-bold mb-4">🔗 Quick Links</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link href="/courses" className="bg-white border rounded-lg p-4 text-center hover:shadow-md transition-shadow">
            <div className="text-2xl mb-1">📚</div>
            <div className="text-sm font-medium">Browse Courses</div>
          </Link>
          <Link href="/my-courses" className="bg-white border rounded-lg p-4 text-center hover:shadow-md transition-shadow">
            <div className="text-2xl mb-1">📖</div>
            <div className="text-sm font-medium">My Learning</div>
          </Link>
          <Link href="/certificates" className="bg-white border rounded-lg p-4 text-center hover:shadow-md transition-shadow">
            <div className="text-2xl mb-1">🏆</div>
            <div className="text-sm font-medium">Certificates</div>
          </Link>
          <Link href="/courses" className="bg-white border rounded-lg p-4 text-center hover:shadow-md transition-shadow">
            <div className="text-2xl mb-1">🔍</div>
            <div className="text-sm font-medium">Discover</div>
          </Link>
        </div>
      </div>
    </div>
  );
}