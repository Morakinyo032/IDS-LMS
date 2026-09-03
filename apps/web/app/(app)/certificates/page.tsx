'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

interface Certificate {
  id: string;
  issuedAt: string;
  course: {
    id: string;
    title: string;
  };
}

export default function CertificatesPage() {
  const router = useRouter();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchCertificates();
  }, []);

  async function fetchCertificates() {
    try {
      const res = await api.get('/api/certificates');
      setCertificates(res.data.certificates);
    } catch (err) {
      console.error('Failed to fetch certificates:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading certificates...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">🏆 My Certificates</h1>

      {certificates.length === 0 ? (
        <div className="text-center py-16 bg-white border rounded-lg">
          <p className="text-gray-500 text-lg mb-4">No certificates yet.</p>
          <Link href="/my-courses" className="text-blue-600 hover:underline">
            Complete a course to earn one →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="bg-white border rounded-lg p-6 flex items-center justify-between hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">📜</div>
                <div>
                  <h3 className="text-lg font-semibold">{cert.course.title}</h3>
                  <p className="text-gray-500 text-sm">
                    Issued on {new Date(cert.issuedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                  Completed
                </span>
                <Link
                  href={`/my-courses/${cert.course.id}`}
                  className="text-blue-600 hover:underline text-sm"
                >
                  View Course
                </Link>
                {/* 👇 ADD DOWNLOAD BUTTON 👇 */}
                <button
                    onClick={async () => {
                        try {
                            const token = localStorage.getItem('token');
                            const res = await fetch(
                            `${process.env.NEXT_PUBLIC_API_URL}/api/certificates/${cert.id}/download`,
                            {
                                headers: { Authorization: `Bearer ${token}` },
                            }
                            );

                            if (!res.ok) throw new Error('Download failed');

                            const blob = await res.blob();
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'certificate.pdf';
                            document.body.appendChild(a);
                            a.click();
                            a.remove();
                            window.URL.revokeObjectURL(url);
                        } catch (err) {
                            console.error('Download failed:', err);
                            alert('Failed to download certificate');
                        }
                        }}
                    className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
                    >
                    📥 Download PDF
                </button>
                {/* 👆 END DOWNLOAD BUTTON 👆 */}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}