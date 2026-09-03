'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

interface LiveClass {
  id: string;
  title: string;
  description: string;
  meetLink: string | null;
  scheduledAt: string;
  duration: number;
  isActive: boolean;
}

export default function LiveClassesPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const courseId = params.id as string;
  const type = searchParams.get('type');
  const schoolId = searchParams.get('schoolId');
  const classId = searchParams.get('classId');

  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState<LiveClass | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [meetLink, setMeetLink] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [duration, setDuration] = useState(60);

  const backLink = type === 'school' && schoolId && classId
    ? `/admin/schools/${schoolId}/classes/${classId}/subjects/${courseId}`
    : `/instructor/courses/${courseId}/edit`;

  const backLabel = type === 'school' ? '← Subject Content' : '← Course Editor';

  useEffect(() => { fetchLiveClasses(); }, [courseId]);

  async function fetchLiveClasses() {
    try {
      const res = await api.get(`/api/liveclass/course/${courseId}`);
      setLiveClasses(res.data.liveClasses);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  function openCreate() {
    setEditingClass(null);
    setTitle('');
    setDescription('');
    setMeetLink('');
    setScheduledAt('');
    setDuration(60);
    setShowForm(true);
  }

  function openEdit(lc: LiveClass) {
    setEditingClass(lc);
    setTitle(lc.title);
    setDescription(lc.description || '');
    setMeetLink(lc.meetLink || '');
    setScheduledAt(new Date(lc.scheduledAt).toISOString().slice(0, 16));
    setDuration(lc.duration);
    setShowForm(true);
  }

  async function handleSubmit() {
    if (!title || !scheduledAt) return alert('Title and date are required');
    if (meetLink && !meetLink.includes('meet.google.com')) {
      return alert('Please enter a valid Google Meet link (meet.google.com/...)');
    }
    try {
      if (editingClass) {
        await api.put(`/api/liveclass/${editingClass.id}`, { title, description, meetLink, scheduledAt, duration });
      } else {
        await api.post('/api/liveclass', { title, description, meetLink, courseId, scheduledAt, duration });
      }
      setShowForm(false);
      setEditingClass(null);
      fetchLiveClasses();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save');
    }
  }

  async function deleteClass(id: string) {
    if (!confirm('Delete this live class?')) return;
    await api.delete(`/api/liveclass/${id}`);
    fetchLiveClasses();
  }

  async function toggleActive(id: string, isActive: boolean) {
    try {
      if (isActive) {
        await api.put(`/api/liveclass/${id}/end`);
      } else {
        await api.put(`/api/liveclass/${id}/start`);
      }
      fetchLiveClasses();
    } catch (err) { alert('Failed'); }
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  const now = new Date();
  const live = liveClasses.filter(c => c.isActive);
  const upcoming = liveClasses.filter(c => new Date(c.scheduledAt) > now && !c.isActive);
  const past = liveClasses.filter(c => new Date(c.scheduledAt) < now && !c.isActive);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link href={backLink} className="text-sm hover:underline" style={{ color: 'var(--teal)' }}>{backLabel}</Link>
      <div className="flex justify-between items-center mt-1 mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>🎥 Live Classes</h1>
        <button onClick={openCreate} className="btn-primary text-sm">+ Schedule Class</button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text)' }}>
              {editingClass ? 'Edit Live Class' : 'Schedule Live Class'}
            </h2>
            <div className="space-y-3">
              <input value={title} onChange={e => setTitle(e.target.value)} className="w-full" placeholder="Class title" />
              <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full" rows={2} placeholder="Description (optional)" />
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--muted)' }}>Google Meet Link</label>
                <input value={meetLink} onChange={e => setMeetLink(e.target.value)} className="w-full" placeholder="https://meet.google.com/abc-defg-hij" />
                <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>Paste your Google Meet link here. Students will join via this link.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1" style={{ color: 'var(--muted)' }}>Date & Time</label>
                  <input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} className="w-full" />
                </div>
                <div>
                  <label className="block text-sm mb-1" style={{ color: 'var(--muted)' }}>Duration (min)</label>
                  <input type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} className="w-full" min="15" max="240" />
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-4 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
              <button onClick={() => { setShowForm(false); setEditingClass(null); }} className="btn-secondary">Cancel</button>
              <button onClick={handleSubmit} className="btn-primary">{editingClass ? 'Update' : 'Schedule'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Live Now */}
      {live.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--red)' }}>🔴 Live Now</h2>
          {live.map(c => (
            <div key={c.id} className="card p-4 mb-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold" style={{ color: 'var(--text)' }}>{c.title}</h3>
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>Started • {c.duration} min</p>
                </div>
                <div className="flex gap-2">
                  {c.meetLink && (
                    <a href={c.meetLink} target="_blank" className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: 'var(--red)' }}>Join Meet</a>
                  )}
                  <button onClick={() => toggleActive(c.id, true)} className="btn-secondary text-sm">End</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upcoming */}
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--teal)' }}>📅 Upcoming</h2>
        {upcoming.length === 0 ? (
          <p style={{ color: 'var(--muted)' }}>No upcoming classes.</p>
        ) : (
          upcoming.map(c => (
            <div key={c.id} className="card p-4 mb-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold" style={{ color: 'var(--text)' }}>{c.title}</h3>
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>{new Date(c.scheduledAt).toLocaleString()} • {c.duration} min</p>
                  {c.meetLink && <p className="text-xs mt-1" style={{ color: 'var(--teal)' }}>🔗 {c.meetLink}</p>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(c)} className="btn-secondary text-xs">✏️</button>
                  <button onClick={() => deleteClass(c.id)} className="btn-secondary text-xs">🗑️</button>
                  <button onClick={() => toggleActive(c.id, false)} className="btn-primary text-xs">▶️ Start</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Past */}
      {past.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--muted)' }}>📼 Past Classes</h2>
          {past.map(c => (
            <div key={c.id} className="card p-4 mb-2 flex justify-between items-center">
              <div>
                <h3 className="font-semibold" style={{ color: 'var(--text)' }}>{c.title}</h3>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>{new Date(c.scheduledAt).toLocaleString()}</p>
              </div>
              <button onClick={() => deleteClass(c.id)} className="text-sm" style={{ color: 'var(--red)' }}>🗑️</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}