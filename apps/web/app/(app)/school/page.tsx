'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

interface School {
  id: string;
  name: string;
  description: string;
  logo: string | null;
  _count: { classes: number };
}

export default function SchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchools();
  }, []);

  async function fetchSchools() {
    try {
      const res = await api.get('/api/school');
      setSchools(res.data.schools);
    } catch (err) {
      console.error('Failed to fetch schools:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="p-8 text-center text-xl">Loading schools...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">🏫 Schools</h1>
      <p className="text-gray-500 mb-8">Browse available schools and their classes</p>

      {schools.length === 0 ? (
        <div className="text-center py-16 card">
          <p className="text-lg text-gray-500">No schools available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schools.map((school) => (
            <Link
              key={school.id}
              href={`/school/${school.id}`}
              className="card p-6 hover:shadow-lg transition-shadow block"
            >
              <div className="h-32 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg mb-4 flex items-center justify-center text-white text-4xl">
                🏫
              </div>
              <h2 className="text-xl font-bold mb-2">{school.name}</h2>
              <p className="text-gray-500 text-sm mb-3">{school.description || 'No description'}</p>
              <span className="text-sm text-gray-400">
                {school._count?.classes || 0} classes
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}