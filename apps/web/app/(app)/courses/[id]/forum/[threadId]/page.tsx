'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

interface Reply {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; name: string };
}

interface Thread {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  user: { id: string; name: string };
  replies: Reply[];
}

export default function ThreadPage() {
  const params = useParams();
  const courseId = params.id as string;
  const threadId = params.threadId as string;
  const [thread, setThread] = useState<Thread | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
    fetchThread();
  }, [threadId]);

  async function fetchThread() {
    try {
      const res = await api.get(`/api/forum/thread/${threadId}`);
      setThread(res.data.thread);
    } catch (err) {
      console.error('Failed to fetch:', err);
    } finally {
      setLoading(false);
    }
  }

  async function postReply() {
    try {
      await api.post(`/api/forum/thread/${threadId}/reply`, { content: replyContent });
      setReplyContent('');
      fetchThread();
    } catch (err) {
      alert('Failed to post reply');
    }
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!thread) return <div className="p-8 text-center text-red-500">Thread not found</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link href={`/courses/${courseId}/forum`} className="text-blue-600 hover:underline text-sm">
        ← Forum
      </Link>

      {/* Thread */}
      <div className="bg-white border rounded-lg p-6 mt-3 mb-6">
        <h1 className="text-xl font-bold mb-2">{thread.title}</h1>
        <p className="text-gray-700 mb-3">{thread.content}</p>
        <div className="text-sm text-gray-400">
          Posted by {thread.user.name} • {new Date(thread.createdAt).toLocaleString()}
        </div>
      </div>

      {/* Replies */}
      <h2 className="font-bold mb-3">{thread.replies.length} Replies</h2>
      
      {thread.replies.map(reply => (
        <div key={reply.id} className="bg-white border rounded-lg p-4 mb-2">
          <p className="text-gray-700">{reply.content}</p>
          <div className="text-xs text-gray-400 mt-2">
            {reply.user.name} • {new Date(reply.createdAt).toLocaleString()}
          </div>
        </div>
      ))}

      {/* Reply Form */}
      {isLoggedIn && (
        <div className="bg-white border rounded-lg p-4 mt-4">
          <textarea
            value={replyContent}
            onChange={e => setReplyContent(e.target.value)}
            className="w-full px-3 py-2 border rounded mb-2"
            rows={3}
            placeholder="Write a reply..."
          />
          <button onClick={postReply} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
            Post Reply
          </button>
        </div>
      )}
    </div>
  );
}