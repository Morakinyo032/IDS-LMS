'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

interface GradeEntry {
  assignmentId: string;
  assignmentTitle: string;
  maxPoints: number;
  submitted: boolean;
  grade: number | null;
}

interface StudentGrade {
  student: { id: string; name: string; email: string };
  grades: GradeEntry[];
  overallGrade: number;
  totalEarned: number;
  totalPossible: number;
}

export default function GradebookPage() {
  const params = useParams();
  const courseId = params.id as string;
  const [gradebook, setGradebook] = useState<StudentGrade[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGradebook();
  }, [courseId]);

  async function fetchGradebook() {
    try {
      const res = await api.get(`/api/assignments/course/${courseId}/gradebook`);
      setGradebook(res.data.gradebook);
      setAssignments(res.data.assignments);
    } catch (err) {
      console.error('Failed to fetch:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href={`/instructor/courses/${courseId}/assignments`} className="text-blue-600 hover:underline text-sm">
        ← Assignments
      </Link>
      <h1 className="text-2xl font-bold mt-1 mb-6">📊 Grade Book</h1>

      {gradebook.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No students enrolled.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white border rounded-lg">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-4 py-3 font-semibold text-sm">Student</th>
                {assignments.map(a => (
                  <th key={a.id} className="text-center px-4 py-3 font-semibold text-sm">{a.title}<br /><span className="text-gray-400 font-normal">/{a.maxPoints}</span></th>
                ))}
                <th className="text-center px-4 py-3 font-semibold text-sm">Overall</th>
              </tr>
            </thead>
            <tbody>
              {gradebook.map(row => (
                <tr key={row.student.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{row.student.name}</div>
                    <div className="text-xs text-gray-500">{row.student.email}</div>
                  </td>
                  {row.grades.map(g => (
                    <td key={g.assignmentId} className="text-center px-4 py-3">
                      {g.submitted ? (
                        g.grade !== null ? (
                          <span className="font-medium text-green-600">{g.grade}</span>
                        ) : (
                          <span className="text-yellow-500 text-xs">Pending</span>
                        )
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                  ))}
                  <td className="text-center px-4 py-3">
                    <span className={`font-bold ${row.overallGrade >= 70 ? 'text-green-600' : 'text-red-500'}`}>
                      {row.overallGrade}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}