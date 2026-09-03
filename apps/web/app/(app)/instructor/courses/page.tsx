'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface Course {
  id: string;
  title: string;
  published: boolean;
  _count: { enrollments: number; modules: number };
}

export default function InstructorCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyCourses();
  }, []);

  async function fetchMyCourses() {
    try {
      const res = await api.get('/api/courses/instructor/mine');
      setCourses(res.data.courses);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    } finally {
      setLoading(false);
    }
  }

  async function togglePublish(courseId: string, currentStatus: boolean) {
    try {
      await api.put(`/api/courses/${courseId}`, {
        published: !currentStatus,
      });
      fetchMyCourses();
    } catch (err) {
      alert('Failed to update course');
    }
  }

  async function deleteCourse(courseId: string) {
    if (!confirm('Are you sure you want to delete this course? This cannot be undone.')) return;
    try {
      await api.delete(`/api/courses/${courseId}`);
      fetchMyCourses();
    } catch (err) {
      alert('Failed to delete course');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-xl">Loading your courses...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Courses</h1>
        <Link
          href="/instructor/courses/create"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create New Course
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border">
          <p className="text-gray-500 text-lg mb-4">You haven't created any courses yet.</p>
          <Link
            href="/instructor/courses/create"
            className="text-blue-600 hover:underline"
          >
            Create your first course →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => (
            <div key={course.id} className="bg-white border rounded-lg p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold mb-1">{course.title}</h3>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span>{course._count.modules} modules</span>
                    <span>{course._count.enrollments} students</span>
                    <span className={course.published ? 'text-green-600' : 'text-yellow-600'}>
                      {course.published ? '📗 Published' : '📝 Draft'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/instructor/courses/${course.id}/settings`} className="btn-secondary text-xs">⚙️ Settings</Link>
                  <Link
                    href={`/instructor/courses/${course.id}/edit`}
                    className="px-3 py-1 border rounded text-sm hover:bg-gray-50"
                  >
                    Edit Content
                  </Link>
                  <button
                    onClick={() => togglePublish(course.id, course.published)}
                    className={`px-3 py-1 rounded text-sm text-white ${
                      course.published
                        ? 'bg-yellow-500 hover:bg-yellow-600'
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {course.published ? 'Unpublish' : 'Publish'}
                  </button>
                  <button
                    onClick={() => deleteCourse(course.id)}
                    className="px-3 py-1 border border-red-300 text-red-500 rounded text-sm hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}