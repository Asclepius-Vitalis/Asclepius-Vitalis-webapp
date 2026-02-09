'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui';
import styles from './page.module.css';

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <header className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>🏥</span>
          <span className={styles.logoText}>Asclepius Vitalis</span>
        </div>
        <nav className={styles.nav}>
          <Link href="/login">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href="/signup">
            <Button variant="primary">Get Started</Button>
          </Link>
        </nav>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.title}>
              Modern Healthcare
              <br />
              <span className={styles.highlight}>Management System</span>
            </h1>
            <p className={styles.subtitle}>
              Streamline your medical practice with our comprehensive solution for
              patient management, appointments, consultations, and follow-up care.
            </p>
            <div className={styles.cta}>
              <Link href="/signup">
                <Button size="lg">Start Free Trial</Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">Sign In</Button>
              </Link>
            </div>
          </div>
          <div className={styles.heroImage}>
            <div className={styles.heroCard}>
              <div className={styles.heroCardHeader}>
                <span>Today&apos;s Dashboard</span>
              </div>
              <div className={styles.heroStats}>
                <div className={styles.heroStat}>
                  <span className={styles.heroStatValue}>12</span>
                  <span className={styles.heroStatLabel}>Appointments</span>
                </div>
                <div className={styles.heroStat}>
                  <span className={styles.heroStatValue}>156</span>
                  <span className={styles.heroStatLabel}>Patients</span>
                </div>
                <div className={styles.heroStat}>
                  <span className={styles.heroStatValue}>3</span>
                  <span className={styles.heroStatLabel}>Follow-ups</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className={styles.features}>
          <h2 className={styles.sectionTitle}>Everything You Need</h2>
          <div className={styles.featureGrid}>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>📅</div>
              <h3>Appointment Management</h3>
              <p>Schedule and manage appointments with ease. Support for walk-ins and scheduled visits.</p>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>👥</div>
              <h3>Patient Records</h3>
              <p>Comprehensive patient profiles with medical history, allergies, and consultation records.</p>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>📋</div>
              <h3>Digital Consultations</h3>
              <p>Record symptoms, diagnosis, prescriptions, and lab tests in structured digital format.</p>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>💬</div>
              <h3>WhatsApp Integration</h3>
              <p>Send follow-up reminders and appointment notifications via WhatsApp.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>© 2026 Asclepius Vitalis. Frontend MVP - All data stored locally.</p>
      </footer>
    </div>
  );
}
