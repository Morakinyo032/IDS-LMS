'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

interface Overview {
  totalCourses: number;
  totalStudents: number;
  publishedCourses: number;
  recentEnrollments: any[];
  courseStats: any[];
}

export default function InstructorAnalyticsPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverview();
  }, []);

  async function fetchOverview() {
    try {
      const res = await api.get('/api/analytics/instructor/overview');
      setOverview(res.data);
    } catch (err) {
      console.error('Failed to fetch overview:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-xl">Loading analytics...</div>;
  }

  if (!overview) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">📊 Instructor Analytics</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border rounded-lg p-6 text-center">
          <div className="text-4xl font-bold text-blue-600">{overview.totalCourses}</div>
          <div className="text-gray-500 mt-2">Total Courses</div>
        </div>
        <div className="bg-white border rounded-lg p-6 text-center">
          <div className="text-4xl font-bold text-green-600">{overview.totalStudents}</div>
          <div className="text-gray-500 mt-2">Total Students</div>
        </div>
        <div className="bg-white border rounded-lg p-6 text-center">
          <div className="text-4xl font-bold text-purple-600">{overview.publishedCourses}</div>
          <div className="text-gray-500 mt-2">Published Courses</div>
        </div>
      </div>

      {/* Course Stats */}
      <div className="bg-white border rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Course Enrollment Stats</h2>
        <div className="space-y-3">
          {overview.courseStats.map((course: any) => (
            <div key={course.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <div>
                <span className="font-medium">{course.title}</span>
                <span className={`ml-2 text-xs px-2 py-0.5 rounded ${course.published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {course.published ? 'Published' : 'Draft'}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-gray-600">{course._count.enrollments} students</span>
                <Link
                  href={`/instructor/analytics/course/${course.id}`}
                  className="text-blue-600 text-sm hover:underline"
                >
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Enrollments */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Recent Enrollments</h2>
        {overview.recentEnrollments.length === 0 ? (
          <p className="text-gray-500">No enrollments yet.</p>
        ) : (
          <div className="space-y-2">
            {overview.recentEnrollments.map((enrollment: any) => (
              <div key={enrollment.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded">
                <div>
                  <span className="font-medium">{enrollment.user.name}</span>
                  <span className="text-gray-400 ml-2 text-sm">{enrollment.user.email}</span>
                </div>
                <div className="text-sm text-gray-500">
                  <span>{enrollment.course.title}</span>
                  <span className="ml-4">
                    {new Date(enrollment.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}