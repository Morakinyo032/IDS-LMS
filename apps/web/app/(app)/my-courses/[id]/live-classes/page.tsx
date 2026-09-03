'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

interface LiveClass {
  id: string;
  title: string;
  description: string;
  roomName: string;
  scheduledAt: string;
  duration: number;
  isActive: boolean;
}

export default function StudentLiveClassesPage() {
  const params = useParams();
  const courseId = params.id as string;
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, [courseId]);

  async function fetchClasses() {
    try {
      const res = await api.get(`/api/liveclass/course/${courseId}`);
      setLiveClasses(res.data.liveClasses);
    } catch (err) {
      console.error('Failed to fetch:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  const now = new Date();
  const live = liveClasses.filter(c => c.isActive);
  const upcoming = liveClasses.filter(c => new Date(c.scheduledAt) > now && !c.isActive);

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link href={`/my-courses/${courseId}`} className="text-blue-600 hover:underline text-sm">
        ← Course
      </Link>
      <h1 className="text-2xl font-bold mt-1 mb-6">🎥 Live Classes</h1>

      {/* Live Now */}
      {live.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-3 text-red-500">🔴 Live Now - Join!</h2>
          {live.map(c => (
            <div key={c.id} className="bg-red-50 border-2 border-red-300 rounded-lg p-6 mb-3">
              <h3 className="text-xl font-bold mb-2">{c.title}</h3>
              <p className="text-gray-600 mb-4">{c.description}</p>
              <Link
                href={`/live-class/${c.roomName}`}
                className="inline-block px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium"
              >
                Join Live Class →
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Upcoming */}
      <div>
        <h2 className="text-lg font-bold mb-3 text-blue-600">📅 Upcoming Classes</h2>
        {upcoming.length === 0 ? (
          <p className="text-gray-500">No upcoming classes scheduled.</p>
        ) : (
          upcoming.map(c => (
            <div key={c.id} className="bg-white border rounded-lg p-4 mb-2">
              <h3 className="font-semibold">{c.title}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(c.scheduledAt).toLocaleString()} • {c.duration} minutes
              </p>
              {c.description && <p className="text-sm text-gray-600 mt-2">{c.description}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}