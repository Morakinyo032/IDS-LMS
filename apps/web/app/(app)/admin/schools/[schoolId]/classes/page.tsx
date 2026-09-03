'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

export default function ManageClassesPage() {
  const params = useParams();
  const schoolId = params.schoolId as string;
  const [school, setSchool] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [className, setClassName] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [selectedClass, setSelectedClass] = useState('');

  useEffect(() => { fetchSchool(); }, [schoolId]);

  async function fetchSchool() {
    try {
      const res = await api.get(`/api/school/${schoolId}`);
      setSchool(res.data.school);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function addClass() {
    if (!className.trim()) return alert('Class name required');
    await api.post('/api/school/classes', { name: className, schoolId });
    setClassName('');
    fetchSchool();
  }

  async function deleteClass(id: string) {
    if (!confirm('Delete class and all subjects?')) return;
    await api.delete(`/api/school/classes/${id}`);
    fetchSchool();
  }

  async function addSubject() {
    if (!subjectName.trim() || !selectedClass) return alert('Subject name and class required');
    await api.post('/api/school/subjects', { name: subjectName, code: subjectCode, classId: selectedClass });
    setSubjectName('');
    setSubjectCode('');
    fetchSchool();
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!school) return <div className="p-8 text-center text-red-500">School not found</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link href="/admin/schools" className="text-blue-600 hover:underline text-sm">← Schools</Link>
      <h1 className="text-2xl font-bold mt-2 mb-6">{school.name} — Classes</h1>

      {/* Add Class */}
      <div className="card p-4 mb-6">
        <h3 className="font-semibold mb-2">Add New Class</h3>
        <div className="flex gap-2">
          <input
            value={className}
            onChange={e => setClassName(e.target.value)}
            className="flex-1 px-3 py-2 border rounded"
            placeholder="e.g., JSS 1, Year 7, Grade 10"
          />
          <button onClick={addClass} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Add</button>
        </div>
      </div>

      {/* Add Subject */}
      <div className="card p-4 mb-6">
        <h3 className="font-semibold mb-2">Add Subject to Class</h3>
        <div className="flex gap-2">
          <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="px-3 py-2 border rounded">
            <option value="">Select class</option>
            {school.classes?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input value={subjectName} onChange={e => setSubjectName(e.target.value)} className="flex-1 px-3 py-2 border rounded" placeholder="Subject name" />
          <input value={subjectCode} onChange={e => setSubjectCode(e.target.value)} className="w-24 px-3 py-2 border rounded" placeholder="Code" />
          <button onClick={addSubject} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Add</button>
        </div>
      </div>

      {/* Classes List */}
      {!school.classes || school.classes.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No classes yet. Add one above.</p>
      ) : (
        school.classes.map((cls: any) => (
          <div key={cls.id} className="card p-4 mb-3">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-lg">{cls.name}</h3>
              <button onClick={() => deleteClass(cls.id)} className="text-red-500 text-sm">🗑️ Delete</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {cls.subjects?.length > 0 ? (
                cls.subjects.map((subj: any) => (
                  <Link
                    key={subj.id}
                    href={`/admin/schools/${schoolId}/classes/${cls.id}/subjects/${subj.id}`}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm hover:bg-blue-100"
                  >
                    📚 {subj.name}
                  </Link>
                ))
              ) : (
                <span className="text-sm text-gray-400">No subjects yet</span>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}