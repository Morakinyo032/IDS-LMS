'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

interface PendingInstructor {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export default function InstructorApprovalsPage() {
  const [instructors, setInstructors] = useState<PendingInstructor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchPending(); }, []);

  async function fetchPending() {
    try {
      const res = await api.get('/api/admin/pending-instructors');
      setInstructors(res.data.instructors);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function approve(id: string) {
    if (!confirm('Approve this instructor?')) return;
    await api.put(`/api/admin/instructors/${id}/approve`);
    fetchPending();
  }

  async function reject(id: string) {
    if (!confirm('Reject and delete this application?')) return;
    await api.delete(`/api/admin/instructors/${id}/reject`);
    fetchPending();
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link href="/admin/schools" className="text-sm hover:underline" style={{ color: 'var(--teal)' }}>
        ← Admin Dashboard
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-6" style={{ color: 'var(--text)' }}>
        👨‍🏫 Instructor Applications
      </h1>

      {instructors.length === 0 ? (
        <div className="card p-8 text-center">
          <p style={{ color: 'var(--muted)' }}>No pending applications.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {instructors.map(i => (
            <div key={i.id} className="card p-4 flex justify-between items-center">
              <div>
                <h3 className="font-semibold" style={{ color: 'var(--text)' }}>{i.name}</h3>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>{i.email}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                  Applied: {new Date(i.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => approve(i.id)} className="px-3 py-1 rounded text-sm text-white" style={{ backgroundColor: 'var(--green)' }}>
                  ✓ Approve
                </button>
                <button onClick={() => reject(i.id)} className="px-3 py-1 rounded text-sm text-white" style={{ backgroundColor: 'var(--red)' }}>
                  ✕ Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}