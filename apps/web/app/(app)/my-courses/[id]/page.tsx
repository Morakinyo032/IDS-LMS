'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import VideoPlayer from '@/components/VideoPlayer';

interface Lesson {
  id: string;
  title: string;
  content: string;
  videoUrl?: string | null;
  order: number;
}

interface Module {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  instructor: { id: string; name: string };
  modules: Module[];
}

export default function LearnCoursePage() {
  const params = useParams();
  const courseId = params.id as string;
  
  const [course, setCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [progress, setProgress] = useState(0);
  const [totalLessons, setTotalLessons] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [certificate, setCertificate] = useState<any>(null);
  const [generatingCert, setGeneratingCert] = useState(false);
  const [quizzes, setQuizzes] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchCourseAndProgress();
  }, [courseId]);

  async function fetchCourseAndProgress() {
    try {
      const [courseRes, progressRes, certRes] = await Promise.all([
        api.get(`/api/courses/${courseId}`),
        api.get(`/api/progress/course/${courseId}`),
        api.get(`/api/certificates/${courseId}`),
      ]);

      setCourse(courseRes.data.course);
      setCompletedLessons(progressRes.data.completedLessons);
      setProgress(progressRes.data.progress);
      setTotalLessons(progressRes.data.totalLessons);

      if (certRes.data.certificate) {
        setCertificate(certRes.data.certificate);
      }

      // Check which lessons have quizzes
      const quizMap: Record<string, string> = {};
      const allLessons = courseRes.data.course.modules.flatMap(
        (m: Module) => m.lessons
      );

      for (const lesson of allLessons) {
        try {
          const quizRes = await api.get(`/api/quizzes/${lesson.id}`);
          if (quizRes.data.quiz) {
            quizMap[lesson.id] = quizRes.data.quiz.id;
          }
        } catch {
          // No quiz for this lesson
        }
      }
      setQuizzes(quizMap);

      const firstIncomplete = allLessons.find(
        (l: Lesson) => !progressRes.data.completedLessons.includes(l.id)
      );
      setActiveLesson(firstIncomplete || allLessons[0] || null);
    } catch (err) {
      console.error('Failed to fetch course:', err);
    } finally {
      setLoading(false);
    }
  }

  async function toggleComplete(lessonId: string) {
    const isCompleted = completedLessons.includes(lessonId);

    try {
      if (isCompleted) {
        await api.delete(`/api/progress/${lessonId}`);
        setCompletedLessons(completedLessons.filter((id) => id !== lessonId));
      } else {
        await api.post(`/api/progress/${lessonId}`);
        setCompletedLessons([...completedLessons, lessonId]);
      }

      const progressRes = await api.get(`/api/progress/course/${courseId}`);
      setProgress(progressRes.data.progress);

      if (progressRes.data.progress === 100 && !certificate) {
        setShowCelebration(true);
      }
    } catch (err) {
      console.error('Failed to toggle progress:', err);
    }
  }

  async function generateCertificate() {
    setGeneratingCert(true);
    try {
        const res = await api.post(`/api/certificates/${courseId}`);
        setCertificate(res.data.certificate);
        setShowCelebration(false);
    } catch (err: any) {
        console.error('Failed to generate certificate:', err);
        alert(err.response?.data?.error || 'Failed to generate certificate');
    } finally {
        setGeneratingCert(false);
    }
}

  function findNextLesson() {
    if (!course || !activeLesson) return null;
    const allLessons = course.modules.flatMap((m) => m.lessons);
    const currentIndex = allLessons.findIndex((l) => l.id === activeLesson.id);
    if (currentIndex < allLessons.length - 1) {
      return allLessons[currentIndex + 1];
    }
    return null;
  }

  function goToNextLesson() {
    const next = findNextLesson();
    if (next) {
      setActiveLesson(next);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading course...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-500">Course not found</div>
      </div>
    );
  }

  const isLessonCompleted = activeLesson
    ? completedLessons.includes(activeLesson.id)
    : false;
  const nextLesson = findNextLesson();
  const isFullyComplete = progress === 100;

  return (
    <div className="flex h-screen">
      {/* Celebration Modal */}
      {showCelebration && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold mb-2">Congratulations!</h2>
            <p className="text-gray-600 mb-2">You've completed</p>
            <p className="text-xl font-semibold text-blue-600 mb-6">{course.title}</p>
            <p className="text-gray-500 mb-6">
              You've finished all {totalLessons} lessons. Claim your certificate!
            </p>
            <div className="space-y-3">
              <button
                onClick={generateCertificate}
                disabled={generatingCert}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
              >
                {generatingCert ? 'Generating...' : '🏆 Get Your Certificate'}
              </button>
              <button
                onClick={() => setShowCelebration(false)}
                className="w-full px-6 py-3 border rounded-lg hover:bg-gray-50"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Banner */}
      {certificate && (
        <div className="fixed top-16 left-0 right-0 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 text-center py-2 z-30">
          <span className="font-medium">
            🏆 Certificate Earned on{' '}
            {new Date(certificate.issuedAt).toLocaleDateString()}!
          </span>
          <Link href="/certificates" className="ml-4 underline font-bold">
            View Certificates →
          </Link>
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-80' : 'w-0'
        } bg-gray-50 border-r overflow-y-auto transition-all ${
          certificate ? 'mt-10' : ''
        }`}
      >
        {sidebarOpen && (
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="font-bold text-lg">{course.title}</h2>
                <div className="mt-1">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>
                      {completedLessons.length}/{totalLessons} lessons
                    </span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        isFullyComplete ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {course.modules.map((module) => (
              <div key={module.id} className="mb-3">
                <h3 className="font-semibold text-sm text-gray-500 mb-1 px-2">
                  {module.title}
                </h3>
                {module.lessons.map((lesson) => {
                  const completed = completedLessons.includes(lesson.id);
                  const hasQuiz = quizzes[lesson.id];
                  return (
                    <div key={lesson.id} className="mb-1">
                      <button
                        onClick={() => setActiveLesson(lesson)}
                        className={`w-full text-left px-3 py-2 rounded text-sm flex items-center gap-2 ${
                          activeLesson?.id === lesson.id
                            ? 'bg-blue-100 text-blue-700 font-medium'
                            : 'hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        <span>{completed ? '✅' : '📖'}</span>
                        <span className="flex-1">{lesson.title}</span>
                        {hasQuiz && (
                          <span className="text-xs text-orange-500 font-medium">
                            📝 Quiz
                          </span>
                        )}
                        {completed && (
                          <span className="text-xs text-green-600">Done</span>
                        )}
                      </button>
                      {hasQuiz && (
                        <Link
                          href={`/my-courses/${courseId}/quiz/${lesson.id}`}
                          className="block text-xs text-blue-500 hover:underline pl-8 py-1"
                        >
                          Take Quiz →
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className={`flex-1 overflow-y-auto ${certificate ? 'mt-10' : ''}`}>
        <div className="bg-white border-b px-6 py-3 flex justify-between items-center">
            <div className="flex items-center gap-4">
                {!sidebarOpen && (
                <button onClick={() => setSidebarOpen(true)} className="text-gray-600 hover:text-gray-800">
                    ☰ Menu
                </button>
                )}
                <Link href="/my-courses" className="text-blue-600 hover:underline text-sm">
                ← My Courses
                </Link>
                {/* 👇 ADD THIS LINE 👇 */}
                <Link
                href={`/my-courses/${courseId}/live-classes`}
                className="text-sm text-gray-600 hover:text-blue-600"
                >
                🎥 Live Classes
                </Link>
                <Link
                    href={`/my-courses/${courseId}/resources`}
                    className="text-sm text-gray-600 hover:text-blue-600"
                    >
                    📁 Resources
                </Link>

                <Link
                    href={`/courses/${courseId}/forum`}
                    className="text-sm text-gray-600 hover:text-blue-600"
                    >
                💬 Forum
                </Link>
            </div>
            <span className="text-sm text-gray-500">
                {isFullyComplete ? '🎉 Completed!' : `${Math.round(progress)}% complete`}
            </span>
            </div>

        <div className="max-w-3xl mx-auto px-8 py-8">
          {activeLesson ? (
            <div>
              <h1 className="text-3xl font-bold mb-6">{activeLesson.title}</h1>

              {/* Video Player */}
              {activeLesson.videoUrl && (
                <VideoPlayer
                  url={activeLesson.videoUrl}
                  title={activeLesson.title}
                />
              )}

              {/* Text Content */}
              <div className="prose max-w-none mb-8">
                {activeLesson.content && activeLesson.content.trim() ? (
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-lg">
                    {activeLesson.content}
                  </div>
                ) : (
                  <p className="text-gray-400 italic">
                    No text content for this lesson yet.
                  </p>
                )}
              </div>

              {/* Quiz Button */}
              {quizzes[activeLesson.id] && (
                <div className="mb-6">
                  <Link
                    href={`/my-courses/${courseId}/quiz/${activeLesson.id}`}
                    className="inline-block px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium"
                  >
                    📝 Take Quiz
                  </Link>
                </div>
              )}

              {/* Progress Actions */}
              <div className="border-t pt-6 flex justify-between items-center">
                <button
                  onClick={() => toggleComplete(activeLesson.id)}
                  className={`px-6 py-3 rounded-lg font-medium ${
                    isLessonCompleted
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {isLessonCompleted
                    ? '↩ Mark as Incomplete'
                    : '✅ Mark as Complete'}
                </button>

                {isLessonCompleted && nextLesson && (
                  <button
                    onClick={goToNextLesson}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Next Lesson →
                  </button>
                )}

                {isFullyComplete && !certificate && (
                  <button
                    onClick={generateCertificate}
                    className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-medium"
                  >
                    🏆 Get Certificate
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">
                Select a lesson from the sidebar to start learning.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}