'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { brand } from '@/lib/brand';
import LandingNavbar from '@/components/LandingNavbar';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--navy)' }}>
      <LandingNavbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden" style={{ backgroundColor: 'var(--deep)' }}>
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, var(--teal) 0%, transparent 50%), 
                              radial-gradient(circle at 80% 50%, var(--gold) 0%, transparent 50%)`
          }} />
        </div>

        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <img
              src={brand.logoPath}
              alt={brand.schoolName}
              style={{ height: '140px', width: 'auto' }}
              className="object-contain mx-auto mb-6 drop-shadow-lg"
            />
            <h1 className="text-4xl md:text-6xl font-bold mb-3" style={{ color: 'var(--teal)' }}>
              {brand.schoolName}
            </h1>
            <p className="text-xl md:text-2xl font-light uppercase tracking-widest mb-4" style={{ color: 'var(--text)' }}>
              {brand.tagline}
            </p>
            <div className="w-24 h-1 mx-auto rounded-full mb-8" style={{ backgroundColor: 'var(--gold)' }} />
            <p className="text-lg mb-10 max-w-xl mx-auto leading-relaxed" style={{ color: 'var(--muted)' }}>
              {brand.description}
            </p>

            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/register"
                className="px-8 py-4 rounded-full text-lg font-semibold shadow-xl transition-all hover:scale-105"
                style={{ backgroundColor: 'var(--gold)', color: '#000' }}
              >
                Enroll Now
              </Link>
              <Link
                href="/courses"
                className="px-8 py-4 rounded-full text-lg font-semibold transition-all hover:scale-105"
                style={{ backgroundColor: 'var(--sb-active-bg)', color: 'var(--teal-light)', border: '1px solid var(--teal)' }}
              >
                View Programs
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {brand.stats.map((stat, i) => (
                <div key={i}>
                  <div className="text-3xl font-bold" style={{ color: 'var(--teal-light)' }}>{stat.value}</div>
                  <div className="text-sm mt-1" style={{ color: 'var(--muted)' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-16" style={{ background: `linear-gradient(to top, var(--navy), transparent)` }} />
      </section>

      {/* Why Choose IDS */}
      <section className="py-20" style={{ backgroundColor: 'var(--navy)' }}>
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16" style={{ color: 'var(--text)' }}>
            Why Choose <span style={{ color: 'var(--teal)' }}>IDS</span>?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {brand.whyChoose.map((item, i) => (
              <div key={i} className="card p-6 hover:shadow-lg transition-all">
                <div className="flex items-start gap-4">
                  <div className="text-2xl flex-shrink-0" style={{ color: 'var(--green)' }}>✓</div>
                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: 'var(--text)' }}>{item.title}</h3>
                    <p style={{ color: 'var(--muted)' }} className="text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20" style={{ backgroundColor: 'var(--deep)' }}>
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16" style={{ color: 'var(--text)' }}>
            Our Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {brand.services.map((service, i) => (
              <div key={i} className="card p-8 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text)' }}>{service.title}</h3>
                <p style={{ color: 'var(--muted)' }} className="text-sm leading-relaxed">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20" style={{ backgroundColor: 'var(--navy)' }}>
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: 'var(--teal)' }}>
            Enrollment Now Open!
          </h2>
          <p className="text-xl mb-10" style={{ color: 'var(--muted)' }}>
            Join students from around the world learning from home with qualified tutors.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            {!isLoggedIn ? (
              <Link
                href="/register"
                className="px-8 py-4 rounded-full text-lg font-semibold transition-all hover:scale-105"
                style={{ backgroundColor: 'var(--gold)', color: '#000' }}
              >
                Start Your Journey
              </Link>
            ) : (
              <Link
                href="/dashboard"
                className="px-8 py-4 rounded-full text-lg font-semibold transition-all hover:scale-105"
                style={{ backgroundColor: 'var(--teal)', color: '#fff' }}
              >
                Go to Dashboard
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20" style={{ backgroundColor: 'var(--deep)' }}>
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: 'var(--teal)' }}>
              About {brand.schoolName}
            </h2>
            <div className="w-16 h-1 mx-auto mb-8 rounded-full" style={{ backgroundColor: 'var(--gold)' }} />
            <p className="text-lg leading-relaxed mb-6" style={{ color: 'var(--text)' }}>
              {brand.about}
            </p>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-20" style={{ backgroundColor: 'var(--navy)' }}>
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-10" style={{ color: 'var(--text)' }}>Contact Us</h2>
          <div className="space-y-4 max-w-lg mx-auto">
            <p style={{ color: 'var(--muted)' }}>📧 {brand.contact.email}</p>
            <p style={{ color: 'var(--muted)' }}>📞 {brand.contact.phone}</p>
            <p style={{ color: 'var(--muted)' }}>💬 WhatsApp: {brand.contact.whatsapp}</p>
            <p style={{ color: 'var(--muted)' }}>📍 {brand.contact.address}</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12" style={{ backgroundColor: 'var(--sb-bg)' }}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <img src={brand.logoPath} alt={brand.schoolName} style={{ height: '40px', width: 'auto' }} className="mb-3" />
              <p className="text-sm" style={{ color: 'var(--muted)' }}>{brand.schoolName} (IDS)</p>
              <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>A Subsidiary of Intent Scholastic & Innovations Ltd.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3" style={{ color: 'var(--text)' }}>Quick Links</h4>
              <div className="space-y-2 text-sm">
                <Link href="/courses" className="block" style={{ color: 'var(--muted)' }}>Programs</Link>
                <Link href="/register" className="block" style={{ color: 'var(--muted)' }}>Enroll Now</Link>
                <Link href="/login" className="block" style={{ color: 'var(--muted)' }}>Student Login</Link>
                <Link href="/school" className="block" style={{ color: 'var(--muted)' }}>School Programs</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3" style={{ color: 'var(--text)' }}>Contact</h4>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>{brand.contact.phone}</p>
              <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>{brand.contact.email}</p>
              <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>{brand.contact.address}</p>
            </div>
          </div>
          <div className="border-t mt-10 pt-6 text-center text-xs" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
            {brand.footer}
          </div>
        </div>
      </footer>
    </div>
  );
}