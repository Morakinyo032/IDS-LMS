'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

interface Thread {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  user: { id: string; name: string };
  _count: { replies: number };
}

export default function ForumPage() {
  const params = useParams();
  const courseId = params.id as string;
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
    fetchThreads();
  }, [courseId]);

  async function fetchThreads() {
    try {
      const res = await api.get(`/api/forum/course/${courseId}`);
      setThreads(res.data.threads);
    } catch (err) {
      console.error('Failed to fetch:', err);
    } finally {
      setLoading(false);
    }
  }

  async function createThread() {
    try {
      await api.post(`/api/forum/course/${courseId}`, { title, content });
      setTitle('');
      setContent('');
      setShowForm(false);
      fetchThreads();
    } catch (err) {
      alert('Failed to create thread');
    }
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link href={`/courses/${courseId}`} className="text-blue-600 hover:underline text-sm">
        ← Course
      </Link>
      <div className="flex justify-between items-center mt-1 mb-6">
        <h1 className="text-2xl font-bold">💬 Discussion Forum</h1>
        {isLoggedIn && (
          <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
            + New Thread
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white border rounded-lg p-4 mb-6">
          <input value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 border rounded mb-2" placeholder="Thread title" />
          <textarea value={content} onChange={e => setContent(e.target.value)} className="w-full px-3 py-2 border rounded mb-2" rows={3} placeholder="What's on your mind?" />
          <button onClick={createThread} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm">Post</button>
        </div>
      )}

      {threads.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No discussions yet. Start one!</p>
      ) : (
        <div className="space-y-2">
          {threads.map(thread => (
            <Link key={thread.id} href={`/courses/${courseId}/forum/${thread.id}`} className="block bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
              <h3 className="font-semibold">{thread.title}</h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{thread.content}</p>
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>By {thread.user.name}</span>
                <span>{thread._count.replies} replies • {new Date(thread.createdAt).toLocaleDateString()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}