'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

interface Resource {
  id: string;
  title: string;
  fileUrl: string;
  createdAt: string;
}

export default function StudentResourcesPage() {
  const params = useParams();
  const courseId = params.id as string;
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResources();
  }, [courseId]);

  async function fetchResources() {
    try {
      const res = await api.get(`/api/resources/course/${courseId}`);
      setResources(res.data.resources);
    } catch (err) {
      console.error('Failed to fetch resources:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading resources...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link href={`/my-courses/${courseId}`} className="text-blue-600 hover:underline text-sm">
        ← Back to Course
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-6">📁 Course Resources</h1>

      {resources.length === 0 ? (
        <div className="text-center py-16 card">
          <p className="text-lg mb-2">📭</p>
          <p className="text-secondary">No resources available yet.</p>
          <p className="text-tertiary text-sm mt-1">Check back later or contact your instructor.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {resources.map((resource) => (
            <a
              key={resource.id}
              href={`${process.env.NEXT_PUBLIC_API_URL}${resource.fileUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow block"
            >
              <div className="text-2xl">
                {resource.fileUrl.match(/\.(pdf)$/i) ? '📄' :
                 resource.fileUrl.match(/\.(doc|docx)$/i) ? '📝' :
                 resource.fileUrl.match(/\.(ppt|pptx)$/i) ? '📊' :
                 resource.fileUrl.match(/\.(xls|xlsx)$/i) ? '📈' :
                 resource.fileUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? '🖼️' :
                 resource.fileUrl.match(/\.(mp4|webm)$/i) ? '🎥' : '📎'}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-primary">{resource.title}</h3>
                <p className="text-tertiary text-sm">
                  Uploaded {new Date(resource.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span className="text-blue-600 text-sm hover:underline">Download →</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}