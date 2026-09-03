'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

interface Subject {
  id: string;
  name: string;
  code: string | null;
  _count: { topics: number };
}

export default function SubjectsPage() {
  const params = useParams();
  const schoolId = params.programId as string;
  const classId = params.classId as string;
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [className, setClassName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [classId]);

  async function fetchData() {
    try {
            {!localStorage.getItem('token') && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6 flex justify-between items-center">
          <p className="text-sm text-yellow-700">
            🔒 Log in to access full lessons and learning materials
          </p>
          <Link href="/login" className="px-4 py-1 bg-green-700 text-white rounded text-sm hover:bg-green-800">
            Login
          </Link>
        </div>
      )}
      // Get subjects for this class
      const subjectsRes = await api.get(`/api/school/classes/${classId}/subjects`);
      setSubjects(subjectsRes.data.subjects);

      // Get class name from the school
      const schoolRes = await api.get(`/api/school/${schoolId}`);
      const cls = schoolRes.data.school.classes.find((c: any) => c.id === classId);
      if (cls) setClassName(cls.name);
    } catch (err) {
      console.error('Failed:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="p-8 text-center text-xl">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href={`/school/${schoolId}`} className="text-blue-600 hover:underline text-sm">← Classes</Link>
      <h1 className="text-3xl font-bold mt-2 mb-2">{className} Subjects</h1>
      <p className="text-gray-500 mb-8">{subjects.length} subjects available</p>

      {subjects.length === 0 ? (
        <div className="text-center py-16 card">
          <p className="text-gray-500">No subjects available for this class yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {subjects.map(subject => (
            <Link
              key={subject.id}
              href={`/school/${schoolId}/${classId}/${subject.id}`}
              className="card p-6 hover:shadow-lg transition-shadow block"
            >
              <div className="text-3xl mb-3">
                {subject.name.includes('Math') ? '🔢' :
                 subject.name.includes('English') ? '📖' :
                 subject.name.includes('Physics') ? '⚡' :
                 subject.name.includes('Chemistry') ? '🧪' :
                 subject.name.includes('Biology') ? '🧬' :
                 subject.name.includes('Science') ? '🔬' : '📚'}
              </div>
              <h3 className="font-bold text-lg">{subject.name}</h3>
              {subject.code && <p className="text-sm text-gray-500">{subject.code}</p>}
              <p className="text-sm text-gray-400 mt-2">{subject._count?.topics || 0} topics</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}