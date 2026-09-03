'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import FileUpload from '@/components/FileUpload';

export default function CourseSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [imageUrl, setImageUrl] = useState('');
  const [imageTab, setImageTab] = useState<'upload' | 'url'>('upload');
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  async function fetchCourse() {
    try {
      const res = await api.get(`/api/courses/${courseId}`);
      const course = res.data.course;
      setTitle(course.title);
      setDescription(course.description);
      setPrice(Number(course.price));
      setImageUrl(course.imageUrl || '');
      setPublished(course.published);
    } catch (err) {
      console.error('Failed to fetch course:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await api.put(`/api/courses/${courseId}`, {
        title,
        description,
        price,
        imageUrl: imageUrl || null,
        published,
      });
      setSuccess('Course updated successfully!');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update course');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this course? This cannot be undone.')) return;
    try {
      await api.delete(`/api/courses/${courseId}`);
      router.push('/instructor/courses');
    } catch (err: any) {
      setError('Failed to delete course');
    }
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link href="/instructor/courses" className="text-sm hover:underline" style={{ color: 'var(--teal)' }}>
        ← My Courses
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-8" style={{ color: 'var(--text)' }}>Course Settings</h1>

      {error && (
        <div className="mb-4 p-3 rounded text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: 'var(--red)' }}>
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 rounded text-sm" style={{ backgroundColor: 'rgba(16,185,129,0.1)', color: 'var(--green)' }}>
          {success}
        </div>
      )}

      <div className="card p-6 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--muted)' }}>Course Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} className="w-full" />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--muted)' }}>Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={5} className="w-full" />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--muted)' }}>Price (USD)</label>
          <input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} className="w-full" min="0" step="0.01" />
        </div>

        {/* Course Image */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--muted)' }}>Course Image</label>

          {/* Tab Switcher */}
          <div className="flex border-b mb-3" style={{ borderColor: 'var(--border)' }}>
            <button
              type="button"
              onClick={() => setImageTab('upload')}
              className="px-4 py-2 text-sm font-medium border-b-2 transition-colors"
              style={
                imageTab === 'upload'
                  ? { borderColor: 'var(--teal)', color: 'var(--teal)' }
                  : { borderColor: 'transparent', color: 'var(--muted)' }
              }
            >
              📁 Upload from Computer
            </button>
            <button
              type="button"
              onClick={() => setImageTab('url')}
              className="px-4 py-2 text-sm font-medium border-b-2 transition-colors"
              style={
                imageTab === 'url'
                  ? { borderColor: 'var(--teal)', color: 'var(--teal)' }
                  : { borderColor: 'transparent', color: 'var(--muted)' }
              }
            >
              🔗 Paste Image URL
            </button>
          </div>

          {/* Active Tab Content */}
          {imageTab === 'upload' ? (
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--surface)' }}>
              <FileUpload onUpload={(url) => setImageUrl(url)} accept="image/*" label="Choose Image File" />
              {imageUrl && (
                <span className="ml-3 text-sm" style={{ color: 'var(--green)' }}>✅ Image uploaded</span>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--surface)' }}>
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full"
                placeholder="https://example.com/course-image.jpg"
              />
            </div>
          )}

          {/* Preview */}
          {imageUrl && (
            <div className="mt-3">
              <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>Preview:</p>
              <img
                src={imageUrl.startsWith('/api/uploads/') ? `${process.env.NEXT_PUBLIC_API_URL}${imageUrl}` : imageUrl}
                alt="Course preview"
                className="h-32 w-auto rounded-lg object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  const parent = (e.target as HTMLImageElement).parentElement;
                  if (parent) {
                    parent.innerHTML = '<p class="text-sm" style="color: var(--red)">Unable to load image preview</p>';
                  }
                }}
              />
            </div>
          )}
        </div>

        {/* Publish Toggle */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Status:</span>
          <button
            type="button"
            onClick={() => setPublished(!published)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={published ? { backgroundColor: 'var(--green)', color: '#fff' } : { backgroundColor: 'var(--surface)', color: 'var(--muted)' }}
          >
            {published ? '📗 Published' : '📝 Draft'}
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button onClick={() => router.back()} className="btn-secondary">Cancel</button>
          <button onClick={handleDelete} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: 'var(--red)' }}>
            🗑️ Delete Course
          </button>
        </div>
      </div>
    </div>
  );
}