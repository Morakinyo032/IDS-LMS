'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string | null;
  maxPoints: number;
}

interface Submission {
  id: string;
  content: string;
  grade: number | null;
  feedback: string | null;
  createdAt: string;
}

export default function StudentAssignmentsPage() {
  const params = useParams();
  const courseId = params.id as string;
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, Submission>>({});
  const [loading, setLoading] = useState(true);
  const [activeAssignment, setActiveAssignment] = useState<string | null>(null);
  const [content, setContent] = useState('');

  useEffect(() => {
    fetchData();
  }, [courseId]);

  async function fetchData() {
    try {
      const res = await api.get(`/api/assignments/course/${courseId}`);
      setAssignments(res.data.assignments);

      // Fetch submissions for each assignment
      const subMap: Record<string, Submission> = {};
      for (const a of res.data.assignments) {
        try {
          const subRes = await api.get(`/api/assignments/${a.id}/my-submission`);
          if (subRes.data.submission) {
            subMap[a.id] = subRes.data.submission;
          }
        } catch {}
      }
      setSubmissions(subMap);
    } catch (err) {
      console.error('Failed to fetch:', err);
    } finally {
      setLoading(false);
    }
  }

  async function submitAssignment() {
    if (!activeAssignment) return;
    try {
      await api.post(`/api/assignments/${activeAssignment}/submit`, { content });
      setActiveAssignment(null);
      setContent('');
      fetchData();
    } catch (err) {
      alert('Failed to submit');
    }
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link href={`/my-courses/${courseId}`} className="text-blue-600 hover:underline text-sm">
        ← Course
      </Link>
      <h1 className="text-2xl font-bold mt-1 mb-6">Assignments</h1>

      {assignments.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No assignments yet.</p>
      ) : (
        <div className="space-y-3">
          {assignments.map(a => {
            const sub = submissions[a.id];
            return (
              <div key={a.id} className="bg-white border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{a.title}</h3>
                    <p className="text-sm text-gray-500">{a.description}</p>
                  </div>
                  <span className="text-sm text-gray-400">{a.maxPoints} pts</span>
                </div>
                {a.dueDate && (
                  <p className="text-xs text-gray-400 mt-1">Due: {new Date(a.dueDate).toLocaleDateString()}</p>
                )}
                
                {sub ? (
                  <div className="mt-3 p-3 bg-gray-50 rounded">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Submitted: {new Date(sub.createdAt).toLocaleDateString()}</span>
                      {sub.grade !== null ? (
                        <span className="font-bold text-green-600">{sub.grade}/{a.maxPoints}</span>
                      ) : (
                        <span className="text-yellow-500 text-sm">Pending review</span>
                      )}
                    </div>
                    {sub.feedback && <p className="text-sm mt-2"><strong>Feedback:</strong> {sub.feedback}</p>}
                  </div>
                ) : (
                  <button
                    onClick={() => { setActiveAssignment(a.id); setContent(''); }}
                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    Submit Assignment
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Submit Modal */}
      {activeAssignment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-bold mb-4">Submit Assignment</h3>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full px-3 py-2 border rounded mb-4"
              rows={6}
              placeholder="Write your answer..."
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setActiveAssignment(null)} className="px-4 py-2 border rounded">Cancel</button>
              <button onClick={submitAssignment} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}