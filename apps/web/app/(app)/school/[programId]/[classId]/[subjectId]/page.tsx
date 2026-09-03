'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import SchoolGuard from '@/components/SchoolGuard';

interface Lesson {
  id: string;
  title: string;
  content: string;
  videoUrl: string | null;
  order: number;
}

interface Topic {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export default function LearnSubjectPage() {
  const params = useParams();
  const programId = params.programId as string;
  const classId = params.classId as string;
  const subjectId = params.subjectId as string;
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subjectName, setSubjectName] = useState('');
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    fetchTopics();
  }, [subjectId]);

  async function fetchTopics() {
  try {
    const res = await api.get(`/api/school/subjects/${subjectId}/topics`);
    setTopics(res.data.topics);
    const firstLesson = res.data.topics[0]?.lessons[0];
    if (firstLesson) setActiveLesson(firstLesson);
  } catch (err) {
    console.error('Failed:', err);
  } finally {
    setLoading(false);
  }
}

  if (loading) return <div className="p-8 text-center text-xl">Loading...</div>;

  return (
    <SchoolGuard>
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} bg-gray-50 dark:bg-gray-800 border-r overflow-y-auto transition-all`}>
        {sidebarOpen && (
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold">Topics</h2>
              <button onClick={() => setSidebarOpen(false)} className="text-gray-400">✕</button>
            </div>
            {topics.map(topic => (
              <div key={topic.id} className="mb-3">
                <h3 className="font-semibold text-sm text-gray-500 mb-1 px-2">
                  {topic.title}
                </h3>
                {topic.lessons.map(lesson => (
                  <button
                    key={lesson.id}
                    onClick={() => setActiveLesson(lesson)}
                    className={`w-full text-left px-3 py-2 rounded text-sm mb-1 flex items-center gap-2 ${
                      activeLesson?.id === lesson.id
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <span>📖</span>
                    {lesson.title}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="bg-white dark:bg-gray-900 border-b px-6 py-3 flex items-center gap-4">
          {!sidebarOpen && (
            <button onClick={() => setSidebarOpen(true)}>☰</button>
          )}
          <Link href={`/school/${programId}/${classId}`} className="text-blue-600 text-sm">← Subjects</Link>
          <span className="text-gray-500 text-sm">{subjectName}</span>
        </div>

        <div className="max-w-3xl mx-auto px-8 py-8">
          {activeLesson ? (
            <div>
              <h1 className="text-3xl font-bold mb-6">{activeLesson.title}</h1>
              {activeLesson.videoUrl && (
                <div className="aspect-video mb-6 rounded-lg overflow-hidden bg-black">
                  <iframe src={activeLesson.videoUrl.replace('watch?v=', 'embed/')} className="w-full h-full" allowFullScreen />
                </div>
              )}
              <div className="prose max-w-none dark:text-gray-200">
                {activeLesson.content ? (
                  <div className="whitespace-pre-wrap leading-relaxed">{activeLesson.content}</div>
                ) : (
                  <p className="text-gray-400 italic">No content yet.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-gray-500">Select a lesson to start learning.</div>
          )}
        </div>
      </div>
    </div>
    </SchoolGuard>
  );
}