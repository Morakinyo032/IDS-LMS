'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

interface SchoolClass {
  id: string;
  name: string;
  _count: { subjects: number };
}

interface School {
  id: string;
  name: string;
  description: string;
  classes: SchoolClass[];
}

export default function SchoolClassesPage() {
  const params = useParams();
  const schoolId = params.programId as string;
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchool();
  }, [schoolId]);

  async function fetchSchool() {
    try {
      const res = await api.get(`/api/school/${schoolId}`);
      setSchool(res.data.school);
    } catch (err) {
      console.error('Failed:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="p-8 text-center text-xl">Loading...</div>;
  if (!school) return <div className="p-8 text-center text-red-500">School not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/school" className="text-blue-600 hover:underline text-sm">← Schools</Link>
      <h1 className="text-3xl font-bold mt-2 mb-2">{school.name}</h1>
      <p className="text-gray-500 mb-8">{school.description || 'Select a class to view subjects'}</p>

      {school.classes.length === 0 ? (
        <div className="text-center py-16 card">
          <p className="text-gray-500">No classes available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {school.classes.map((cls) => (
            <Link
              key={cls.id}
              href={`/school/${schoolId}/${cls.id}`}
              className="card p-6 hover:shadow-lg transition-shadow text-center block"
            >
              <div className="text-4xl mb-3">📚</div>
              <h3 className="text-xl font-bold">{cls.name}</h3>
              <p className="text-gray-500 text-sm mt-1">{cls._count?.subjects || 0} subjects</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}