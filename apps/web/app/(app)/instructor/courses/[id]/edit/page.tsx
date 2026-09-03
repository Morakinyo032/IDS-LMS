'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import RichTextEditor from '@/components/RichTextEditor';
import FileUpload from '@/components/FileUpload';

interface Lesson {
  id: string;
  title: string;
  content: string;
  videoUrl?: string | null;
  order: number;
}

interface Module {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export default function EditCoursePage() {
  const params = useParams();
  const courseId = params.id as string;

  const [courseTitle, setCourseTitle] = useState('');
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editVideoUrl, setEditVideoUrl] = useState('');

  useEffect(() => {
    loadData();
  }, [courseId]);

  const [resources, setResources] = useState<any[]>([]);

    async function loadData() {
        try {
            const [courseRes, modulesRes, resourcesRes] = await Promise.all([
            api.get(`/api/courses/${courseId}`),
            api.get('/api/modules', { params: { courseId } }),
            api.get(`/api/resources/course/${courseId}`),
            ]);
            setCourseTitle(courseRes.data.course.title);
            setModules(modulesRes.data.modules);
            setResources(resourcesRes.data.resources);
        } catch (err) {
            console.error('Failed to load:', err);
        } finally {
            setLoading(false);
        }
    }

  async function addModule() {
    if (!newModuleTitle.trim()) return;
    try {
      await api.post('/api/modules', {
        title: newModuleTitle.trim(),
        courseId,
      });
      setNewModuleTitle('');
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed');
    }
  }

  async function deleteModule(moduleId: string) {
    if (!confirm('Delete module and all lessons?')) return;
    try {
      await api.delete(`/api/modules/${moduleId}`);
      loadData();
    } catch (err) {
      alert('Failed to delete');
    }
  }

  async function addLesson() {
    if (!newLessonTitle.trim() || !selectedModule) return;
    try {
      await api.post('/api/modules/lessons', {
        title: newLessonTitle.trim(),
        moduleId: selectedModule,
      });
      setNewLessonTitle('');
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed');
    }
  }

  async function deleteLesson(lessonId: string) {
    if (!confirm('Delete this lesson?')) return;
    try {
      await api.delete(`/api/modules/lessons/${lessonId}`);
      loadData();
    } catch (err) {
      alert('Failed to delete');
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
      await api.put(`/api/modules/lessons/${editingLesson.id}`, {
        title: editTitle,
        content: editContent,
        videoUrl: editVideoUrl || null,
      });
      setEditingLesson(null);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save');
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-xl">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/instructor/courses" className="text-blue-600 hover:underline text-sm">
          ← My Courses
        </Link>
        <h1 className="text-2xl font-bold">{courseTitle}</h1>
        <div className="ml-auto flex gap-2">
        <Link
            href={`/courses/${courseId}/forum`}
            className="px-3 py-1.5 border rounded-lg hover:bg-gray-50 text-sm"
        >
            💬 Forum
        </Link>
          <Link
            href={`/instructor/courses/${courseId}/assignments`}
            className="px-3 py-1.5 border rounded-lg hover:bg-gray-50 text-sm"
          >
            📝 Assignments
          </Link>
          <Link
            href={`/instructor/courses/${courseId}/live-classes`}
            className="px-3 py-1.5 border rounded-lg hover:bg-gray-50 text-sm"
          >
            🎥 Live Classes
          </Link>
        </div>
      </div>

      {/* Add Module */}
      <div className="bg-white border rounded-lg p-4 mb-6">
        <h2 className="font-semibold mb-3">Add Module</h2>
        <div className="flex gap-2">
          <input
            value={newModuleTitle}
            onChange={(e) => setNewModuleTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addModule()}
            className="flex-1 px-3 py-2 border rounded"
            placeholder="Module title"
          />
          <button onClick={addModule} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Add
          </button>
        </div>
      </div>

      {/* Add Lesson */}
      <div className="bg-white border rounded-lg p-4 mb-6">
        <h2 className="font-semibold mb-3">Add Lesson</h2>
        <div className="flex gap-2">
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="px-3 py-2 border rounded"
          >
            <option value="">Select module</option>
            {modules.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
          <input
            value={newLessonTitle}
            onChange={(e) => setNewLessonTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addLesson()}
            className="flex-1 px-3 py-2 border rounded"
            placeholder="Lesson title"
          />
          <button onClick={addLesson} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            Add
          </button>
        </div>
      </div>

      {/* Resources Section */}
        <div className="bg-white border rounded-lg p-4 mb-6">
        <h2 className="font-semibold mb-3">📁 Course Resources</h2>
        <div className="flex gap-2">
            <input
            id="resource-title"
            className="flex-1 px-3 py-2 border rounded text-sm"
            placeholder="Resource title (e.g., Lecture Slides)"
            />
            <FileUpload
            onUpload={(url: string) => {
                const titleInput = document.getElementById('resource-title') as HTMLInputElement;
                const title = titleInput.value;
                if (!title) return alert('Please enter a resource title');
                api.post('/api/resources', { title, fileUrl: url, courseId })
                .then(() => {
                    titleInput.value = '';
                    loadData();
                })
                .catch((err) => alert('Failed to save: ' + (err.response?.data?.error || 'Error')));
            }}
            label="Upload"
            />
        </div>
        
        {/* Resource List */}
        {resources.length > 0 && (
            <div className="space-y-1 mt-3 border-t pt-3">
            {resources.map((r: any) => (
                <div key={r.id} className="flex justify-between items-center py-1">
                <a href={r.fileUrl} target="_blank" className="text-blue-600 text-sm hover:underline">
                    📎 {r.title}
                </a>
                <button
                    onClick={async () => {
                    if (!confirm('Delete this resource?')) return;
                    await api.delete(`/api/resources/${r.id}`);
                    loadData();
                    }}
                    className="text-red-400 text-xs hover:text-red-600"
                >
                    🗑️
                </button>
                </div>
            ))}
            </div>
        )}
        </div>

      {/* Modules & Lessons */}
      {modules.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No modules yet. Add one above.</p>
      ) : (
        modules.map((module) => (
          <div key={module.id} className="bg-white border rounded-lg mb-4 overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
              <h3 className="font-semibold">
                Module {module.order}: {module.title}
              </h3>
              <button
                onClick={() => deleteModule(module.id)}
                className="text-red-500 text-sm hover:underline"
              >
                Delete
              </button>
            </div>
            <div className="px-4 py-2">
              {module.lessons.length === 0 ? (
                <p className="text-gray-400 text-sm py-2">No lessons</p>
              ) : (
                module.lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="flex justify-between items-center py-2 border-b last:border-0"
                  >
                    <div>
                      <span className="mr-2">📖</span>
                      {lesson.title}
                      {lesson.videoUrl && (
                        <span className="ml-2 text-xs text-blue-500">🎥</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditor(lesson)}
                        className="text-blue-600 text-sm hover:underline"
                      >
                        Edit
                      </button>
                      <Link
                        href={`/instructor/courses/${courseId}/quiz/${lesson.id}`}
                        className="text-orange-500 text-sm hover:underline"
                      >
                        Quiz
                      </Link>
                      <button
                        onClick={() => deleteLesson(lesson.id)}
                        className="text-red-500 text-sm hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))
      )}

      {/* Edit Modal */}
      {editingLesson && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Edit Lesson</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  🎥 Video URL (optional)
                </label>
                <input
                  value={editVideoUrl}
                  onChange={(e) => setEditVideoUrl(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                <p className="text-xs text-gray-400 mt-1">
                  Supports YouTube, Vimeo, or direct .mp4 URLs
                </p>
              </div>
                <div>
                <label className="block text-sm font-medium mb-2">Content</label>
                <RichTextEditor
                    value={editContent}
                    onChange={(value) => setEditContent(value)}
                    placeholder="Write your lesson content..."
                />
                </div>
            </div>

            <div className="flex gap-2 justify-end mt-4 pt-3 border-t">
              <button
                onClick={() => setEditingLesson(null)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={saveLesson}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}