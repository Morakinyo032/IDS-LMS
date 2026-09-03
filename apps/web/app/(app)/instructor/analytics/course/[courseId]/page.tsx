'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

interface QuizAttempt {
  id: string;
  score: number;
  passed: boolean;
  createdAt: string;
  quiz: { title: string; passingScore: number };
}

interface Student {
  userId: string;
  name: string;
  email: string;
  enrolledAt: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  quizAttempts: QuizAttempt[];
}

export default function CourseAnalyticsPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const [students, setStudents] = useState<Student[]>([]);
  const [totalLessons, setTotalLessons] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    fetchStudents();
  }, [courseId]);

  async function fetchStudents() {
    try {
      const res = await api.get(`/api/analytics/course/${courseId}/students`);
      setStudents(res.data.students);
      setTotalLessons(res.data.totalLessons);
    } catch (err) {
      console.error('Failed to fetch students:', err);
    } finally {
      setLoading(false);
    }
  }

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="p-8 text-center text-xl">Loading student data...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/instructor/analytics" className="text-blue-600 hover:underline mb-4 inline-block">
        ← Analytics Dashboard
      </Link>
      <h1 className="text-2xl font-bold mb-6">Student Progress</h1>

      {/* Search */}
      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full max-w-md px-4 py-2 border rounded-lg mb-6"
        placeholder="Search students by name or email..."
      />

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold">{students.length}</div>
          <div className="text-sm text-gray-500">Total Students</div>
        </div>
        <div className="bg-white border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {students.filter(s => s.progress === 100).length}
          </div>
          <div className="text-sm text-gray-500">Completed</div>
        </div>
        <div className="bg-white border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {students.filter(s => s.progress > 0 && s.progress < 100).length}
          </div>
          <div className="text-sm text-gray-500">In Progress</div>
        </div>
        <div className="bg-white border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-400">
            {students.filter(s => s.progress === 0).length}
          </div>
          <div className="text-sm text-gray-500">Not Started</div>
        </div>
      </div>

      {/* Student List */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="grid grid-cols-4 gap-4 px-6 py-3 bg-gray-50 font-semibold text-sm">
          <div>Student</div>
          <div>Progress</div>
          <div>Quizzes</div>
          <div>Enrolled</div>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">No students found.</div>
        ) : (
          filteredStudents.map((student) => (
            <div
              key={student.userId}
              className="grid grid-cols-4 gap-4 px-6 py-4 border-t hover:bg-gray-50 cursor-pointer"
              onClick={() => setSelectedStudent(student)}
            >
              <div>
                <div className="font-medium">{student.name}</div>
                <div className="text-sm text-gray-500">{student.email}</div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${student.progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                      style={{ width: `${student.progress}%` }}
                    />
                  </div>
                  <span className="text-sm">{Math.round(student.progress)}%</span>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {student.completedLessons}/{student.totalLessons} lessons
                </div>
              </div>
              <div className="text-sm">
                {student.quizAttempts.length > 0 ? (
                  <span>
                    {student.quizAttempts.filter(q => q.passed).length}/{student.quizAttempts.length} passed
                  </span>
                ) : (
                  <span className="text-gray-400">No attempts</span>
                )}
              </div>
              <div className="text-sm text-gray-500">
                {new Date(student.enrolledAt).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold">{selectedStudent.name}</h3>
                <p className="text-gray-500">{selectedStudent.email}</p>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">Progress</label>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-500 h-3 rounded-full"
                      style={{ width: `${selectedStudent.progress}%` }}
                    />
                  </div>
                  <span className="font-bold">{Math.round(selectedStudent.progress)}%</span>
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  {selectedStudent.completedLessons} of {selectedStudent.totalLessons} lessons completed
                </p>
              </div>

              <div>
                <label className="text-sm text-gray-500">Quiz Results</label>
                {selectedStudent.quizAttempts.length === 0 ? (
                  <p className="text-gray-400 mt-1">No quiz attempts yet.</p>
                ) : (
                  <div className="space-y-2 mt-1">
                    {selectedStudent.quizAttempts.map((attempt) => (
                      <div key={attempt.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm">{attempt.quiz.title}</span>
                        <div className="text-sm">
                          <span className={`font-bold ${attempt.passed ? 'text-green-600' : 'text-red-500'}`}>
                            {attempt.score}%
                          </span>
                          <span className="text-gray-400 ml-2">
                            ({attempt.passed ? 'Passed' : 'Failed'})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm text-gray-500">Enrolled</label>
                <p className="mt-1">{new Date(selectedStudent.enrolledAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}