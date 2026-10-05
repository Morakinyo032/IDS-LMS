'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

export default function ManageSchoolsPage() {
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => { fetchSchools(); }, []);

  async function fetchSchools() {
    try {
      const res = await api.get('/api/school');
      setSchools(res.data.schools);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function createSchool() {
    if (!name.trim()) return alert('School name is required');
    try {
      await api.post('/api/school', { name, description });
      setName('');
      setDescription('');
      setShowForm(false);
      fetchSchools();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create school');
    }
  }

  async function deleteSchool(id: string) {
    if (!confirm('Delete this school and all its classes?')) return;
    await api.delete(`/api/school/${id}`);
    fetchSchools();
  }

  if (loading) return <div className="p-8 text-center text-xl">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">🏫 Manage Schools</h1>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          + New School
        </button>
      </div>

      {showForm && (
        <div className="card p-6 mb-6">
          <h2 className="font-semibold mb-3">Create School</h2>
          <div className="space-y-3">
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              placeholder="School name (e.g., Lagos Academy)"
            />
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              rows={2}
              placeholder="Description (optional)"
            />
            <button onClick={createSchool} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
              Create School
            </button>
          </div>
        </div>
      )}

      {schools.length === 0 ? (
        <div className="text-center py-16 card">
          <p className="text-lg text-gray-500">No schools created yet.</p>
          <p className="text-sm text-gray-400 mt-1">Click "+ New School" to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {schools.map(school => (
            <div className="card p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg truncate" style={{ color: 'var(--text)' }}>{school.name}</h3>
                {school.description && (
                  <p className="text-sm mt-1 line-clamp-2" style={{ color: 'var(--muted)' }}>{school.description}</p>
                )}
                <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                  {school._count?.classes || 0} classes
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/admin/schools/${school.id}/classes`}
                  className="px-3 py-1.5 border rounded-lg text-sm whitespace-nowrap"
                  style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                >
                  Manage Classes
                </Link>
                <button
                  onClick={() => deleteSchool(school.id)}
                  className="px-3 py-1.5 rounded-lg text-sm"
                  style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: 'var(--red)' }}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}