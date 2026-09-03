'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';

interface Option {
  text: string;
  isCorrect: boolean;
}

interface Question {
  text: string;
  type: string;
  points: number;
  options: Option[];
}

export default function QuizBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [passingScore, setPassingScore] = useState(70);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [saving, setSaving] = useState(false);

  function addQuestion() {
    setQuestions([...questions, {
      text: '',
      type: 'MULTIPLE_CHOICE',
      points: 1,
      options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ],
    }]);
  }

  function updateQuestion(index: number, field: string, value: any) {
    const updated = [...questions];
    (updated[index] as any)[field] = value;

    if (field === 'type') {
        if (value === 'TRUE_FALSE') {
        updated[index].options = [
            { text: 'True', isCorrect: false },
            { text: 'False', isCorrect: false },
        ];
        } else if (value === 'SHORT_ANSWER') {
        updated[index].options = [
            { text: '', isCorrect: true },
        ];
        } else if (value === 'MULTIPLE_CHOICE') {
        updated[index].options = [
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
        ];
        }
    }

  setQuestions(updated);
}

  function updateOption(qIndex: number, oIndex: number, field: string, value: any) {
    const updated = [...questions];
    (updated[qIndex].options[oIndex] as any)[field] = value;
    setQuestions(updated);
  }

  function removeQuestion(index: number) {
    setQuestions(questions.filter((_, i) => i !== index));
  }

  async function saveQuiz() {
    setSaving(true);
    try {
      await api.post('/api/quizzes', {
        lessonId: params.lessonId,
        title,
        passingScore,
        questions,
      });
      router.push(`/instructor/courses/${params.id}/edit`);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save quiz');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link href={`/instructor/courses/${params.id}/edit`} className="text-blue-600 hover:underline">
        ← Back to Editor
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-8">Quiz Builder</h1>

      <div className="bg-white border rounded-lg p-6 mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Quiz Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="e.g., Chapter 1 Quiz" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Passing Score (%)</label>
          <input type="number" value={passingScore} onChange={e => setPassingScore(Number(e.target.value))} className="w-32 px-3 py-2 border rounded" min="0" max="100" />
        </div>
      </div>

      {questions.map((q, qi) => (
        <div key={qi} className="bg-white border rounded-lg p-6 mb-4">
          <div className="flex justify-between mb-3">
            <h3 className="font-semibold">Question {qi + 1}</h3>
            <button onClick={() => removeQuestion(qi)} className="text-red-500 text-sm">Remove</button>
          </div>
          
          <div className="space-y-3">
            <input value={q.text} onChange={e => updateQuestion(qi, 'text', e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="Question text" />
            
            <div className="flex gap-4">
              <select value={q.type} onChange={e => updateQuestion(qi, 'type', e.target.value)} className="px-3 py-2 border rounded">
                <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                <option value="TRUE_FALSE">True/False</option>
                <option value="SHORT_ANSWER">Short Answer</option>
              </select>
              <input type="number" value={q.points} onChange={e => updateQuestion(qi, 'points', Number(e.target.value))} className="w-20 px-3 py-2 border rounded" placeholder="Points" min="1" />
            </div>

            {q.options.map((opt, oi) => (
                <div key={oi} className="flex items-center gap-2">
                    {q.type === 'SHORT_ANSWER' ? (
                    <div className="flex-1">
                        <label className="text-xs text-gray-500">Correct Answer:</label>
                        <input 
                        value={opt.text} 
                        onChange={e => updateOption(qi, oi, 'text', e.target.value)} 
                        className="w-full px-3 py-2 border rounded" 
                        placeholder="Correct answer" 
                        />
                    </div>
                    ) : (
                    <>
                        <input
                        type="radio"
                        name={`correct-${qi}`}
                        checked={opt.isCorrect}
                        onChange={() => {
                            const updated = [...questions];
                            updated[qi].options = updated[qi].options.map((o, i) => ({ ...o, isCorrect: i === oi }));
                            setQuestions(updated);
                        }}
                        />
                        <input 
                        value={opt.text} 
                        onChange={e => updateOption(qi, oi, 'text', e.target.value)} 
                        className="flex-1 px-3 py-2 border rounded" 
                        placeholder={q.type === 'TRUE_FALSE' ? opt.text || `Option ${oi + 1}` : `Option ${oi + 1}`}
                        disabled={q.type === 'TRUE_FALSE'}
                        />
                    </>
                    )}
                </div>
                ))}
          </div>
        </div>
      ))}

      <div className="flex gap-3">
        <button onClick={addQuestion} className="px-4 py-2 border rounded hover:bg-gray-50">+ Add Question</button>
        <button onClick={saveQuiz} disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Quiz'}
        </button>
      </div>
    </div>
  );
}