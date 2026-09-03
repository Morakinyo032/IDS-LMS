'use client';

import { useState } from 'react';
import api from '@/lib/api';

interface FileUploadProps {
  onUpload: (url: string) => void;
  accept?: string;
  label?: string;
}

export default function FileUpload({ onUpload, accept = '*', label = 'Upload File' }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const base64 = event.target?.result as string;
        const res = await api.post('/api/upload', {
          file: base64,
          filename: file.name,
        });
        onUpload(res.data.url);
      } catch (err: any) {
        console.error('Upload error:', err);
        alert('Upload failed: ' + (err.response?.data?.error || 'Unknown error'));
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <label className="inline-flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer text-sm transition-colors">
      {uploading ? '⏳ Uploading...' : `📎 ${label}`}
      <input
        type="file"
        onChange={handleFile}
        accept={accept}
        className="hidden"
        disabled={uploading}
      />
    </label>
  );
}