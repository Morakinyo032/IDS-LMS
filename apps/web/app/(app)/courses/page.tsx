'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl?: string | null; 
  instructor: { id: string; name: string };
  _count: { enrollments: number };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function CourseCatalogPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUserRole(JSON.parse(userStr).role);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [search, priceFilter, sortBy, page]);

  async function fetchCourses() {
    setLoading(true);
    setError('');
    try {
      const params: any = { page, limit: 9 };
      if (search) params.search = search;
      if (priceFilter) params.price = priceFilter;
      if (sortBy) params.sort = sortBy;

      const res = await api.get('/api/courses', { params });
      setCourses(res.data.courses);
      setPagination(res.data.pagination);
    } catch (err) {
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchCourses();
  }

  const isInstructor = userRole && ['INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN'].includes(userRole);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Course Catalog</h1>
        {isInstructor && (
          <Link
            href="/instructor/courses/create"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Course
          </Link>
        )}
      </div>

      {/* Search & Filters */}
      <div className="bg-white border rounded-lg p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-1 text-gray-600">Search</label>
            <div className="flex gap-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 px-4 py-2 border rounded-lg"
                placeholder="Search courses..."
              />
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                🔍
              </button>
            </div>
          </form>

          {/* Price Filter */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">Price</label>
            <select
              value={priceFilter}
              onChange={(e) => { setPriceFilter(e.target.value); setPage(1); }}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="">All Prices</option>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="popular">Most Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      {pagination && (
        <p className="text-gray-500 mb-4">
          Showing {courses.length} of {pagination.total} course{pagination.total !== 1 ? 's' : ''}
        </p>
      )}

      {/* Course Grid */}
      {loading ? (
        <div className="text-center py-16 text-xl text-gray-500">Loading courses...</div>
      ) : error ? (
        <div className="text-center py-16 text-xl text-red-500">{error}</div>
      ) : courses.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg mb-4">No courses found.</p>
          {search && (
            <button onClick={() => setSearch('')} className="text-blue-600 hover:underline">
              Clear search
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Link
                    key={course.id}
                    href={`/courses/${course.id}`}
                    className="block group"
                    >
                    <div className="card overflow-hidden hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02]">
                        <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden">
                        {course.imageUrl ? (
                          <img 
                            src={`${process.env.NEXT_PUBLIC_API_URL}${course.imageUrl}`}
                            alt={course.title} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <span className="text-5xl font-bold opacity-20" style={{ color: 'var(--teal)' }}>
                            {course.title.charAt(0).toUpperCase()}
                          </span>
                        )}
                        </div>
                        <div className="p-5">
                        <h2 className="text-lg font-semibold mb-1 text-primary group-hover:text-blue-600 transition-colors">
                            {course.title}
                        </h2>
                        <p className="text-tertiary text-sm mb-3 line-clamp-2">
                            {course.description}
                        </p>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-tertiary">By {course.instructor.name}</span>
                            <span className="font-bold text-blue-600">
                            {Number(course.price) === 0 ? 'Free' : `$${Number(course.price)}`}
                            </span>
                        </div>
                        <div className="mt-2 text-xs text-tertiary">
                            {course._count.enrollments} student{course._count.enrollments !== 1 ? 's' : ''}
                        </div>
                        </div>
                    </div>
                </Link>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                ← Prev
              </button>
              
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-10 h-10 rounded-lg ${
                    page === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'border hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
              
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === pagination.totalPages}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}