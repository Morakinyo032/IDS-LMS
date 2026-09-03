'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import FileUpload from '@/components/FileUpload';

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function CreateCoursePage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageTab, setImageTab] = useState<'upload' | 'url'>('upload');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    try {
      setError('');
      const token = localStorage.getItem('token');
      await axios.post('/api/courses', {
        title: data.title,
        description: data.description,
        price: parseFloat(data.price || '0'),
        imageUrl: imageUrl || null,
      }, {
        baseURL: process.env.NEXT_PUBLIC_API_URL,
        headers: { Authorization: `Bearer ${token}` },
      });
      router.push('/instructor/courses');
    } catch (err: any) {
      const msg = err.response?.data?.error;
      if (Array.isArray(msg)) {
        setError(msg.map((e: any) => e.message).join(', '));
      } else {
        setError(typeof msg === 'string' ? msg : 'Failed to create course');
      }
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-8" style={{ color: 'var(--text)' }}>Create New Course</h1>

      {error && (
        <div className="mb-6 p-3 rounded text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: 'var(--red)', border: '1px solid rgba(239,68,68,0.3)' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--muted)' }}>Course Title</label>
          <input {...register('title')} className="w-full" placeholder="e.g., Introduction to Data Science" />
          {errors.title && <p className="text-sm mt-1" style={{ color: 'var(--red)' }}>{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--muted)' }}>Description</label>
          <textarea {...register('description')} rows={5} className="w-full" placeholder="Describe what students will learn..." />
          {errors.description && <p className="text-sm mt-1" style={{ color: 'var(--red)' }}>{errors.description.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--muted)' }}>Price (USD)</label>
          <input {...register('price')} type="number" step="0.01" min="0" className="w-full" placeholder="0 for free course" />
        </div>

        {/* Course Image */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--muted)' }}>Course Image</label>
          
          {/* Tabs */}
          

          {/* Upload Tab */}
          {imageTab === 'upload' && (
            <div className="flex items-center gap-3">
              <FileUpload onUpload={(url) => setImageUrl(url)} accept="image/*" label="Upload Image" />
              {imageUrl && <span className="text-sm" style={{ color: 'var(--green)' }}>✅ Image uploaded</span>}
            </div>
          )}

          {/* URL Tab */}
          {imageTab === 'url' && (
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full"
              placeholder="https://example.com/image.jpg"
            />
          )}

          {/* Preview */}
          {imageUrl && (
            <img
              src={imageUrl.startsWith('http') ? imageUrl : `${process.env.NEXT_PUBLIC_API_URL}${imageUrl}`}
              alt="Preview"
              className="mt-3 h-32 w-auto rounded-lg object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
        </div>

        <div className="flex gap-4 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? 'Creating...' : 'Create Course'}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}