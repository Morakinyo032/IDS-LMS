'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

interface Submission {
  id: string;
  content: string;
  fileUrl: string | null;
  grade: number | null;
  feedback: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string };
}

interface Assignment {
  id: string;
  title: string;
  maxPoints: number;
  submissions: Submission[];
}

export default function AssignmentSubmissionsPage() {
  const params = useParams();
  const courseId = params.id as string;
  const assignmentId = params.assignmentId as string;
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState<{ submissionId: string; grade: number; feedback: string } | null>(null);

  useEffect(() => {
    fetchAssignment();
  }, [assignmentId]);

  async function fetchAssignment() {
    try {
      const res = await api.get(`/api/assignments/${assignmentId}`);
      setAssignment(res.data.assignment);
    } catch (err) {
      console.error('Failed to fetch:', err);
    } finally {
      setLoading(false);
    }
  }

  async function submitGrade() {
    if (!grading) return;
    try {
      await api.put(`/api/assignments/submissions/${grading.submissionId}/grade`, {
        grade: grading.grade,
        feedback: grading.feedback,
      });
      setGrading(null);
      fetchAssignment();
    } catch (err) {
      alert('Failed to grade');
    }
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!assignment) return <div className="p-8 text-center text-red-500">Assignment not found</div>;

  const graded = assignment.submissions.filter(s => s.grade !== null).length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link href={`/instructor/courses/${courseId}/assignments`} className="text-blue-600 hover:underline text-sm">
        ← Assignments
      </Link>
      <div className="flex justify-between items-center mt-1 mb-6">
        <h1 className="text-2xl font-bold">{assignment.title}</h1>
        <span className="text-gray-500">{graded}/{assignment.submissions.length} graded</span>
      </div>

      {assignment.submissions.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No submissions yet.</p>
      ) : (
        <div className="space-y-3">
          {assignment.submissions.map(submission => (
            <div key={submission.id} className="bg-white border rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold">{submission.user.name}</h3>
                  <p className="text-sm text-gray-500">{submission.user.email}</p>
                  <p className="text-xs text-gray-400 mt-1">Submitted: {new Date(submission.createdAt).toLocaleDateString()}</p>
                </div>
                {submission.grade !== null ? (
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">{submission.grade}</div>
                    <div className="text-xs text-gray-500">/ {assignment.maxPoints}</div>
                  </div>
                ) : (
                  <button
                    onClick={() => setGrading({ submissionId: submission.id, grade: 0, feedback: '' })}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    Grade
                  </button>
                )}
              </div>
              <div className="bg-gray-50 rounded p-3 text-sm whitespace-pre-wrap">{submission.content}</div>
              {submission.fileUrl && (
                <a href={submission.fileUrl} target="_blank" className="text-blue-600 text-sm hover:underline mt-2 inline-block">
                  📎 View Attachment
                </a>
              )}
              {submission.feedback && (
                <div className="mt-2 p-3 bg-yellow-50 rounded text-sm">
                  <strong>Feedback:</strong> {submission.feedback}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Grade Modal */}
      {grading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Grade Submission</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm">Score (max {assignment.maxPoints})</label>
                <input
                  type="number"
                  value={grading.grade}
                  onChange={e => setGrading({ ...grading, grade: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded"
                  min="0"
                  max={assignment.maxPoints}
                />
              </div>
              <div>
                <label className="text-sm">Feedback</label>
                <textarea
                  value={grading.feedback}
                  onChange={e => setGrading({ ...grading, feedback: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  rows={3}
                  placeholder="Great work! ..."
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <button onClick={() => setGrading(null)} className="px-4 py-2 border rounded">Cancel</button>
              <button onClick={submitGrade} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save Grade</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}