'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

interface Exam {
  id: string;
  title: string;
  examType: string;
  term: string;
  timeLimit: number | null;
  totalMarks: number | null;
  passingScore: number;
  startDate: string | null;
  endDate: string | null;
  schoolLesson: { id: string; title: string } | null;
  _count: { attempts: number; questions: number };
}

export default function ExamsPage() {
  const params = useParams();
  const schoolId = params.schoolId as string;
  const classId = params.classId as string;
  const subjectId = params.subjectId as string;

  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [examType, setExamType] = useState('TEST');
  const [term, setTerm] = useState('FIRST_TERM');
  const [timeLimit, setTimeLimit] = useState(30);
  const [totalMarks, setTotalMarks] = useState(100);
  const [passingScore, setPassingScore] = useState(50);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => { fetchExams(); }, [subjectId]);

  async function fetchExams() {
    try {
      const res = await api.get(`/api/quizzes/subject/${subjectId}/exams`);
      setExams(res.data.exams);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function createExam() {
    if (!title) return alert('Title is required');
    try {
      await api.post('/api/quizzes', {
        title,
        examType,
        term,
        timeLimit,
        totalMarks,
        passingScore,
        startDate: startDate || null,
        endDate: endDate || null,
        schoolLessonId: null,
        questions: [],
      });
      setShowForm(false);
      fetchExams();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create exam');
    }
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  const grouped = {
    TEST: exams.filter(e => e.examType === 'TEST'),
    CA: exams.filter(e => e.examType === 'CA'),
    MIDTERM: exams.filter(e => e.examType === 'MIDTERM'),
    FINAL: exams.filter(e => e.examType === 'FINAL'),
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/admin/schools/${schoolId}/classes/${classId}/subjects/${subjectId}`} className="text-blue-600 hover:underline text-sm">
          ← Subject Content
        </Link>
        <h1 className="text-2xl font-bold">📋 Exams & Tests</h1>
        <button onClick={() => setShowForm(!showForm)} className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
          + New Exam
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="card p-6 mb-6">
          <h2 className="font-semibold mb-4">Create Exam / Test</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm mb-1">Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="e.g., First Term Mathematics Exam" />
            </div>
            <div>
              <label className="block text-sm mb-1">Type</label>
              <select value={examType} onChange={e => setExamType(e.target.value)} className="w-full px-3 py-2 border rounded">
                <option value="TEST">Test</option>
                <option value="CA">Continuous Assessment</option>
                <option value="MIDTERM">Mid-Term Exam</option>
                <option value="FINAL">Final Exam</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Term</label>
              <select value={term} onChange={e => setTerm(e.target.value)} className="w-full px-3 py-2 border rounded">
                <option value="FIRST_TERM">First Term</option>
                <option value="SECOND_TERM">Second Term</option>
                <option value="THIRD_TERM">Third Term</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Time Limit (min)</label>
              <input type="number" value={timeLimit} onChange={e => setTimeLimit(Number(e.target.value))} className="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm mb-1">Total Marks</label>
              <input type="number" value={totalMarks} onChange={e => setTotalMarks(Number(e.target.value))} className="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm mb-1">Passing Score (%)</label>
              <input type="number" value={passingScore} onChange={e => setPassingScore(Number(e.target.value))} className="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm mb-1">Start Date</label>
              <input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm mb-1">End Date</label>
              <input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-3 py-2 border rounded" />
            </div>
          </div>
          <button onClick={createExam} className="mt-4 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700">Create</button>
        </div>
      )}

      {/* Exams List by Type */}
      {Object.entries(grouped).map(([type, typeExams]) => {
        if (typeExams.length === 0) return null;
        const labels: Record<string, string> = { TEST: '📝 Tests', CA: '📄 Continuous Assessment', MIDTERM: '📋 Mid-Term Exams', FINAL: '🏆 Final Exams' };
        return (
          <div key={type} className="mb-6">
            <h2 className="text-lg font-bold mb-3">{labels[type] || type}</h2>
            <div className="space-y-2">
              {typeExams.map(exam => (
                <div key={exam.id} className="card p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{exam.title}</h3>
                    <div className="flex gap-3 text-sm text-gray-500 mt-1">
                      <span>⏱ {exam.timeLimit} min</span>
                      <span>📊 {exam.totalMarks} marks</span>
                      <span>✅ Pass: {exam.passingScore}%</span>
                      <span className="capitalize">{exam.term?.replace('_', ' ')}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/instructor/courses/${subjectId}/quiz/${exam.id}?type=exam`} className="px-3 py-1 border rounded text-sm hover:bg-gray-50">
                      ✏️ Add Questions
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {exams.length === 0 && !showForm && (
        <div className="text-center py-16 card">
          <p className="text-gray-500">No exams or tests yet.</p>
        </div>
      )}
    </div>
  );
}