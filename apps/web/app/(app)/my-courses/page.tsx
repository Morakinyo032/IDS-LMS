'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

interface Enrollment {
  id: string;
  progress: number;
  createdAt: string;
  course: {
    id: string;
    title: string;
    description: string;
    instructor: {
      id: string;
      name: string;
    };
    _count: {
      modules: number;
    };
  };
}

export default function MyCoursesPage() {
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchMyCourses();
  }, []);

  async function fetchMyCourses() {
    try {
      const res = await api.get('/api/enrollments/my-courses');
      setEnrollments(res.data.enrollments);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-500">Loading your courses...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Courses</h1>

      {enrollments.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg mb-4">You haven't enrolled in any courses yet.</p>
          <Link
            href="/courses"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map((enrollment) => (
            <div key={enrollment.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-40 bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                <span className="text-white text-4xl">📚</span>
              </div>
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-1">{enrollment.course.title}</h2>
                <p className="text-gray-500 text-sm mb-3">
                  By {enrollment.course.instructor.name}
                </p>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">{Math.round(enrollment.progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${enrollment.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">
                    {enrollment.course._count.modules} modules
                  </span>
                  <Link
                    href={`/my-courses/${enrollment.course.id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Continue
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}