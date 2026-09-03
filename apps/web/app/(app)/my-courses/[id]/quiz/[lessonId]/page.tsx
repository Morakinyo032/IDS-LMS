'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';

interface Option {
  id: string;
  text: string;
}

interface Question {
  id: string;
  text: string;
  type: string;
  points: number;
  options: Option[];
}

interface Quiz {
  id: string;
  title: string;
  passingScore: number;
  questions: Question[];
}

export default function TakeQuizPage() {
  const params = useParams();
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    fetchQuiz();
  }, [params.lessonId]);

  async function fetchQuiz() {
    try {
      const res = await api.get(`/api/quizzes/${params.lessonId}`);
      setQuiz(res.data.quiz);
    } catch (err) {
      console.error('Failed to fetch quiz:', err);
    } finally {
      setLoading(false);
    }
  }

  async function submitQuiz() {
    try {
      const answersArray = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer,
      }));

      const res = await api.post(`/api/quizzes/${quiz!.id}/submit`, { answers: answersArray });
      setResult(res.data);
      setSubmitted(true);
    } catch (err) {
      alert('Failed to submit quiz');
    }
  }

  if (loading) return <div className="p-8 text-center">Loading quiz...</div>;
  if (!quiz) return <div className="p-8 text-center">No quiz found for this lesson.</div>;

  if (submitted && result) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-lg text-center">
        <div className="bg-white border rounded-lg p-8">
          <div className="text-6xl mb-4">{result.passed ? '🎉' : '😔'}</div>
          <h1 className="text-2xl font-bold mb-2">{result.passed ? 'Congratulations!' : 'Keep Trying!'}</h1>
          <p className="text-lg mb-2">Your Score: <span className="font-bold text-2xl">{result.score}%</span></p>
          <p className="text-gray-500 mb-2">Passing: {quiz.passingScore}%</p>
          <p className="text-gray-500 mb-4">{result.earnedPoints}/{result.totalPoints} points</p>
          <Link href={`/my-courses/${params.id}`} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 inline-block">
            Back to Course
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-2">{quiz.title}</h1>
      <p className="text-gray-500 mb-6">Passing score: {quiz.passingScore}%</p>

      {quiz.questions.map((q, qi) => (
        <div key={q.id} className="bg-white border rounded-lg p-6 mb-4">
          <h3 className="font-semibold mb-3">{qi + 1}. {q.text} <span className="text-gray-400 text-sm">({q.points} pt{q.points > 1 ? 's' : ''})</span></h3>
          
          {q.type === 'SHORT_ANSWER' ? (
            <input
              value={answers[q.id] || ''}
              onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              placeholder="Your answer"
            />
          ) : (
            <div className="space-y-2">
              {q.options.map(opt => (
                <label key={opt.id} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded">
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    value={opt.id}
                    checked={answers[q.id] === opt.id}
                    onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })}
                  />
                  {opt.text}
                </label>
              ))}
            </div>
          )}
        </div>
      ))}

      <button onClick={submitQuiz} className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 text-lg w-full">
        Submit Quiz
      </button>
    </div>
  );
}