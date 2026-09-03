'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import RichTextEditor from '@/components/RichTextEditor';

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

export default function ManageSubjectContentPage() {
  const params = useParams();
  const schoolId = params.schoolId as string;
  const classId = params.classId as string;
  const subjectId = params.subjectId as string;

  const [topics, setTopics] = useState<Topic[]>([]);
  const [subjectName, setSubjectName] = useState('');
  const [loading, setLoading] = useState(true);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editVideoUrl, setEditVideoUrl] = useState('');

  useEffect(() => {
    fetchData();
  }, [subjectId]);

  async function fetchData() {
    try {
      const res = await api.get(`/api/school/subjects/${subjectId}/topics`);
      setTopics(res.data.topics);
      setSubjectName(res.data.subjectName || '');
    } catch (err) {
      console.error('Failed:', err);
    } finally {
      setLoading(false);
    }
  }

  async function addTopic() {
    if (!newTopicTitle.trim()) return;
    try {
      await api.post('/api/school/topics', { title: newTopicTitle.trim(), subjectId });
      setNewTopicTitle('');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to add topic');
    }
  }

  async function deleteTopic(id: string) {
    if (!confirm('Delete this topic and all its lessons?')) return;
    try {
      await api.delete(`/api/school/topics/${id}`);
      fetchData();
    } catch (err) {
      alert('Failed to delete topic');
    }
  }

  async function addLesson() {
    if (!newLessonTitle.trim() || !selectedTopic) {
      return alert('Please enter a lesson title and select a topic');
    }
    try {
      await api.post('/api/school/lessons', {
        title: newLessonTitle.trim(),
        topicId: selectedTopic,
      });
      setNewLessonTitle('');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to add lesson');
    }
  }

  async function deleteLesson(id: string) {
    if (!confirm('Delete this lesson?')) return;
    try {
      await api.delete(`/api/school/lessons/${id}`);
      fetchData();
    } catch (err) {
      alert('Failed to delete lesson');
    }
  }

  function openEditor(lesson: Lesson) {
    setEditingLesson(lesson);
    setEditTitle(lesson.title);
    setEditContent(lesson.content || '');
    setEditVideoUrl(lesson.videoUrl || '');
  }

  async function saveLesson() {
    if (!editingLesson) return;
    try {
      await api.put(`/api/school/lessons/${editingLesson.id}`, {
        title: editTitle,
        content: editContent,
        videoUrl: editVideoUrl || null,
      });
      setEditingLesson(null);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save lesson');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/admin/schools/${schoolId}/classes`} className="text-blue-600 hover:underline text-sm">
          ← Classes
        </Link>
        <h1 className="text-2xl font-bold">📚 {subjectName}</h1>
        <div className="ml-auto flex gap-2">
          <Link
            href={`/admin/schools/${schoolId}/classes/${classId}/subjects/${subjectId}/exams`}
            className="px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-50"
          >
            📋 Exams
          </Link>
          <Link
            href={`/instructor/courses/${subjectId}/assignments?type=school&schoolId=${schoolId}&classId=${classId}`}
            className="px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-50"
          >
            📝 Assignments
          </Link>
          <Link
            href={`/instructor/courses/${subjectId}/live-classes?type=school&schoolId=${schoolId}&classId=${classId}`}
            className="px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-50"
          >
            🎥 Live Classes
          </Link>
        </div>
      </div>

      {/* Add Topic */}
      <div className="card p-4 mb-4">
        <h3 className="font-semibold mb-2">➕ Add Topic</h3>
        <div className="flex gap-2">
          <input
            value={newTopicTitle}
            onChange={e => setNewTopicTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTopic()}
            className="flex-1 px-3 py-2 border rounded"
            placeholder="e.g., Algebra Basics, Cell Structure, Forces & Motion"
          />
          <button onClick={addTopic} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium">
            Add Topic
          </button>
        </div>
      </div>

      {/* Add Lesson */}
      <div className="card p-4 mb-6">
        <h3 className="font-semibold mb-2">📖 Add Lesson</h3>
        <div className="flex gap-2">
          <select
            value={selectedTopic}
            onChange={e => setSelectedTopic(e.target.value)}
            className="px-3 py-2 border rounded text-sm"
          >
            <option value="">Select topic</option>
            {topics.map(t => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
          <input
            value={newLessonTitle}
            onChange={e => setNewLessonTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addLesson()}
            className="flex-1 px-3 py-2 border rounded text-sm"
            placeholder="Lesson title"
          />
          <button onClick={addLesson} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium">
            Add Lesson
          </button>
        </div>
      </div>

      {/* Topics & Lessons List */}
      {topics.length === 0 ? (
        <div className="text-center py-16 card">
          <p className="text-lg text-gray-500">No topics yet.</p>
          <p className="text-sm text-gray-400 mt-1">Add your first topic above to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {topics.map((topic, topicIndex) => (
            <div key={topic.id} className="card overflow-hidden">
              {/* Topic Header */}
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 flex justify-between items-center border-b">
                <h3 className="font-semibold">
                  Topic {topicIndex + 1}: {topic.title}
                </h3>
                <button
                  onClick={() => deleteTopic(topic.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  🗑️ Delete Topic
                </button>
              </div>

              {/* Lessons */}
              <div className="p-4">
                {topic.lessons.length === 0 ? (
                  <p className="text-gray-400 text-sm py-2">No lessons in this topic yet.</p>
                ) : (
                  <div className="space-y-1">
                    {topic.lessons.map((lesson, lessonIndex) => (
                      <div
                        key={lesson.id}
                        className="flex justify-between items-center py-2 px-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 text-sm">{lessonIndex + 1}.</span>
                          <span className="text-sm font-medium">{lesson.title}</span>
                          {lesson.videoUrl && (
                            <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">🎥 Video</span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditor(lesson)}
                            className="text-blue-600 text-sm hover:underline"
                          >
                            ✏️ Edit
                          </button>
                          <Link
                            href={`/instructor/courses/${subjectId}/quiz/${lesson.id}`}
                            className="text-orange-500 text-sm hover:underline"
                          >
                            📝 Quiz
                          </Link>
                          <button
                            onClick={() => deleteLesson(lesson.id)}
                            className="text-red-500 text-sm hover:underline"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Lesson Modal */}
      {editingLesson && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <h3 className="text-lg font-bold mb-4">Edit Lesson</h3>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-1">Lesson Title</label>
                <input
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Lesson title"
                />
              </div>

              {/* Video URL */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  🎥 Video URL (YouTube, Vimeo, or direct link)
                </label>
                <input
                  value={editVideoUrl}
                  onChange={e => setEditVideoUrl(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium mb-1">Lesson Content</label>
                <RichTextEditor
                  value={editContent}
                  onChange={setEditContent}
                  placeholder="Write your lesson content here..."
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-6 pt-4 border-t">
              <button
                onClick={() => setEditingLesson(null)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveLesson}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}