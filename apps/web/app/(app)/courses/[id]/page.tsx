'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Module {
  id: string;
  title: string;
  order: number;
  lessons: { id: string; title: string; order: number }[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  instructor: { id: string; name: string };
  modules: Module[];
  _count: { enrollments: number };
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    fetchCourse();
  }, [params.id]);

  useEffect(() => {
    if (isLoggedIn && course) {
      checkEnrollment();
    }
  }, [isLoggedIn, course]);

  async function fetchCourse() {
    try {
      const res = await axios.get(`/api/courses/${params.id}`, {
        baseURL: process.env.NEXT_PUBLIC_API_URL,
      });
      setCourse(res.data.course);
    } catch (err) {
      console.error('Failed to fetch course:', err);
    } finally {
      setLoading(false);
    }
  }

  async function checkEnrollment() {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/enrollments/check/${params.id}`, {
        baseURL: process.env.NEXT_PUBLIC_API_URL,
        headers: { Authorization: `Bearer ${token}` },
      });
      setEnrolled(res.data.enrolled);
    } catch (err) {
      // Not enrolled
    }
  }

  async function handleEnroll() {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    setEnrolling(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/enrollments', 
        { courseId: params.id },
        {
          baseURL: process.env.NEXT_PUBLIC_API_URL,
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setEnrolled(true);
      // Refresh course to update enrollment count
      fetchCourse();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to enroll');
    } finally {
      setEnrolling(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-500">Course not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/courses" className="text-blue-600 hover:underline mb-4 inline-block">
        ← Back to Courses
      </Link>

      <div className="bg-white rounded-lg shadow-sm border p-8 mt-4">
        <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
        <p className="text-gray-500 mb-4">By {course.instructor.name}</p>
        <p className="text-gray-700 mb-6 text-lg">{course.description}</p>

        <div className="flex items-center gap-4 mb-8">
          <span className="text-2xl font-bold text-blue-600">
            {Number(course.price) === 0 ? 'Free' : `$${Number(course.price)}`}
          </span>
          <span className="text-gray-400">
            {course._count.enrollments} student{course._count.enrollments !== 1 ? 's' : ''} enrolled
          </span>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {enrolled ? (
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-600 font-medium">
                <span>✅</span>
                <span>You are enrolled in this course</span>
                </div>
                <div className="flex gap-3">
                <Link
                    href={`/my-courses/${course.id}`}
                    className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 text-lg"
                >
                    Start Learning →
                </Link>
                {/* 👇 ADD THIS 👇 */}
                <Link
                    href={`/courses/${course.id}/forum`}
                    className="inline-block px-6 py-3 border rounded-lg hover:bg-gray-50 text-lg"
                >
                    💬 Discussion Forum
                </Link>
                {/* 👆 ADD THIS 👆 */}
                </div>
            </div>
            ) : (
            <div className="space-y-3">
                <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg disabled:opacity-50"
                >
                {enrolling ? 'Enrolling...' : isLoggedIn ? 'Enroll Now' : 'Login to Enroll'}
                </button>
                {/* 👇 ADD THIS 👇 */}
                <Link
                href={`/courses/${course.id}/forum`}
                className="inline-block px-6 py-3 border rounded-lg hover:bg-gray-50 text-lg ml-3"
                >
                💬 Forum
                </Link>
                {/* 👆 ADD THIS 👆 */}
            </div>
            )}
      </div>

      {/* Course Content */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Course Content</h2>
        <p className="text-gray-500 mb-4">
          {course.modules.length} module{course.modules.length !== 1 ? 's' : ''} • 
          {' '}{course.modules.reduce((acc, m) => acc + m.lessons.length, 0)} lessons
        </p>
        {course.modules.length === 0 ? (
          <p className="text-gray-500 italic">No content yet.</p>
        ) : (
          <div className="space-y-4">
            {course.modules.map((module) => (
              <div key={module.id} className="border rounded-lg">
                <div className="bg-gray-50 px-6 py-4 font-semibold">
                  Module {module.order}: {module.title}
                </div>
                <div className="px-6 py-2">
                  {module.lessons.map((lesson) => (
                    <div key={lesson.id} className="py-2 text-gray-600 flex items-center gap-2">
                      <span>📖</span>
                      <span>{lesson.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}