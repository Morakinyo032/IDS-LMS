'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string | null;
  maxPoints: number;
  _count: { submissions: number };
}

export default function AssignmentsPage() {
  const params = useParams();
  const courseId = params.id as string;
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [maxPoints, setMaxPoints] = useState(100);
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    fetchAssignments();
  }, [courseId]);

  async function fetchAssignments() {
    try {
      const res = await api.get(`/api/assignments/course/${courseId}`);
      setAssignments(res.data.assignments);
    } catch (err) {
      console.error('Failed to fetch:', err);
    } finally {
      setLoading(false);
    }
  }

  async function createAssignment() {
    try {
      await api.post('/api/assignments', {
        title,
        description,
        maxPoints,
        dueDate: dueDate || null,
        courseId,
      });
      setTitle('');
      setDescription('');
      setMaxPoints(100);
      setDueDate('');
      setShowForm(false);
      fetchAssignments();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create');
    }
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link href="/instructor/courses" className="text-blue-600 hover:underline text-sm">
            ← My Courses
          </Link>
          <h1 className="text-2xl font-bold mt-1">Assignments</h1>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/instructor/courses/${courseId}/assignments/gradebook`}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            📊 Grade Book
          </Link>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + New Assignment
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white border rounded-lg p-6 mb-6">
          <h2 className="font-semibold mb-4">Create Assignment</h2>
          <div className="space-y-3">
            <input value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="Assignment title" />
            <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 border rounded" rows={3} placeholder="Description" />
            <div className="flex gap-4">
              <div>
                <label className="text-sm text-gray-500">Max Points</label>
                <input type="number" value={maxPoints} onChange={e => setMaxPoints(Number(e.target.value))} className="w-24 px-3 py-2 border rounded" />
              </div>
              <div>
                <label className="text-sm text-gray-500">Due Date</label>
                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="px-3 py-2 border rounded" />
              </div>
            </div>
            <button onClick={createAssignment} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
              Create
            </button>
          </div>
        </div>
      )}

      {/* Assignment List */}
      {assignments.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No assignments yet.</p>
      ) : (
        <div className="space-y-3">
          {assignments.map(a => (
            <div key={a.id} className="bg-white border rounded-lg p-4 flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{a.title}</h3>
                <p className="text-sm text-gray-500">{a._count.submissions} submissions</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400">{a.maxPoints} pts</span>
                {a.dueDate && <span className="text-sm text-gray-400">Due: {new Date(a.dueDate).toLocaleDateString()}</span>}
                <Link
                  href={`/instructor/courses/${courseId}/assignments/${a.id}`}
                  className="px-3 py-1 border rounded text-sm hover:bg-gray-50"
                >
                  View Submissions
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}