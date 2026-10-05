'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { brand } from '@/lib/brand';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [role, setRole] = useState<'STUDENT' | 'INSTRUCTOR'>('STUDENT');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    try {
      setError('');
      setSuccess('');
      
      const res = await axios.post('/auth/register', 
        { ...data, role },
        { baseURL: process.env.NEXT_PUBLIC_API_URL }
      );

      // Instructor pending approval
      if (res.data.pendingApproval) {
        setSuccess(res.data.message);
        return;
      }

      // Student - log in directly
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--navy)' }}>
      <div className="card p-8 shadow-lg max-w-md w-full">
        <div className="text-center mb-8">
          <img 
            src={brand.logoPath} 
            alt={brand.schoolName} 
            className="h-28 w-auto mx-auto mb-4 object-contain"
          />
          <h1 className="text-3xl font-bold" style={{ color: 'var(--teal)' }}>
            Create Account
          </h1>
          <p className="mt-2" style={{ color: 'var(--muted)' }}>
            Start your learning journey
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: 'var(--red)' }}>
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 rounded text-sm" style={{ backgroundColor: 'rgba(16,185,129,0.1)', color: 'var(--green)' }}>
            {success}
            <Link href="/login" className="block mt-2 underline font-medium">
              Go to Login →
            </Link>
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--muted)' }}>
                I want to join as
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('STUDENT')}
                  className="p-3 rounded-lg border-2 text-center transition-all"
                  style={{
                    borderColor: role === 'STUDENT' ? 'var(--teal)' : 'var(--border)',
                    backgroundColor: role === 'STUDENT' ? 'var(--sb-active-bg)' : 'transparent',
                    color: role === 'STUDENT' ? 'var(--teal)' : 'var(--muted)',
                  }}
                >
                  <div className="text-2xl mb-1">🎓</div>
                  <div className="text-sm font-medium">Student</div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('INSTRUCTOR')}
                  className="p-3 rounded-lg border-2 text-center transition-all"
                  style={{
                    borderColor: role === 'INSTRUCTOR' ? 'var(--teal)' : 'var(--border)',
                    backgroundColor: role === 'INSTRUCTOR' ? 'var(--sb-active-bg)' : 'transparent',
                    color: role === 'INSTRUCTOR' ? 'var(--teal)' : 'var(--muted)',
                  }}
                >
                  <div className="text-2xl mb-1">👨‍🏫</div>
                  <div className="text-sm font-medium">Instructor</div>
                </button>
              </div>
              {role === 'INSTRUCTOR' && (
                <p className="text-xs mt-2 p-2 rounded" style={{ backgroundColor: 'var(--sb-active-bg)', color: 'var(--teal)' }}>
                  ⏳ Instructor accounts require admin approval before activation.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--muted)' }}>Name</label>
              <input {...register('name')} className="w-full" placeholder="John Doe" />
              {errors.name && <p className="text-sm mt-1" style={{ color: 'var(--red)' }}>{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--muted)' }}>Email</label>
              <input {...register('email')} type="email" className="w-full" placeholder="you@example.com" />
              {errors.email && <p className="text-sm mt-1" style={{ color: 'var(--red)' }}>{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--muted)' }}>Password</label>
              <input {...register('password')} type="password" className="w-full" placeholder="Min. 6 characters" />
              {errors.password && <p className="text-sm mt-1" style={{ color: 'var(--red)' }}>{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-2">
              {isSubmitting ? 'Creating account...' : role === 'INSTRUCTOR' ? 'Apply as Instructor' : 'Create Account'}
            </button>
          </form>
        )}

        <p className="text-center text-sm mt-6" style={{ color: 'var(--muted)' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--teal)' }} className="hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}