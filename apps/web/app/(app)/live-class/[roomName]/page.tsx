'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createDailyRoom, getDailyRoomUrl } from '@/lib/daily';

declare global {
  interface Window {
    DailyIframe: any;
  }
}

export default function LiveClassPage() {
  const params = useParams();
  const router = useRouter();
  const roomName = params.roomName as string;
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [participantCount, setParticipantCount] = useState(0);
  const callFrameRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserName(user.name || 'Student');
      setUserRole(user.role);
    } else {
      router.push('/login');
    }
  }, []);

  useEffect(() => {
    if (!userName) return;

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@daily-co/daily-js';
    script.onload = () => {
      initializeRoom();
    };
    document.body.appendChild(script);

    return () => {
      if (callFrameRef.current) {
        callFrameRef.current.destroy();
      }
      document.body.removeChild(script);
    };
  }, [userName]);

  async function initializeRoom() {
    try {
      setLoading(true);
      setError('');

      // Create room via API
      await createDailyRoom(roomName);

      if (!window.DailyIframe || !containerRef.current) return;

      const callFrame = window.DailyIframe.createFrame(containerRef.current, {
        url: getDailyRoomUrl(roomName),
        userName: userName,
        showLeaveButton: true,
        showFullscreenButton: true,
        iframeStyle: {
          width: '100%',
          height: '100%',
          border: 'none',
        },
        userData: {
          role: userRole,
        },
      });

      // Track participants
      callFrame.on('participant-joined', (event: any) => {
        setParticipantCount((prev) => prev + 1);
      });

      callFrame.on('participant-left', (event: any) => {
        setParticipantCount((prev) => Math.max(0, prev - 1));
      });

      callFrame.on('left-meeting', () => {
        router.back();
      });

      await callFrame.join();
      callFrameRef.current = callFrame;
      setLoading(false);
    } catch (err: any) {
      console.error('Failed to initialize room:', err);
      setError(err.message || 'Failed to load video. Please check your connection.');
      setLoading(false);
    }
  }

  const handleLeave = useCallback(() => {
    if (callFrameRef.current) {
      callFrameRef.current.leave();
      callFrameRef.current.destroy();
    }
    router.back();
  }, [router]);

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 text-white px-6 py-3 flex justify-between items-center border-b border-gray-700">
        <div className="flex items-center gap-4">
          <h1 className="font-semibold text-lg">🎥 Live Class</h1>
          {!loading && (
            <span className="flex items-center gap-1 text-sm">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              LIVE
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          {participantCount > 0 && (
            <span className="text-sm text-gray-300">
              👥 {participantCount} participant{participantCount !== 1 ? 's' : ''}
            </span>
          )}
          <span className="text-sm text-gray-400">{userName}</span>
          <button
            onClick={handleLeave}
            className="px-4 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium transition-colors"
          >
            Leave
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative">
        {/* Loading State */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-lg">Joining live class...</p>
              <p className="text-sm text-gray-400 mt-1">Setting up video connection</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
            <div className="text-white text-center max-w-md">
              <div className="text-4xl mb-4">😕</div>
              <p className="text-red-400 text-lg mb-2">Connection Error</p>
              <p className="text-gray-400 mb-6">{error}</p>
              <button
                onClick={() => router.back()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Go Back
              </button>
            </div>
          </div>
        )}

        {/* Video Container */}
        <div ref={containerRef} className="w-full h-full" />
      </div>
    </div>
  );
}