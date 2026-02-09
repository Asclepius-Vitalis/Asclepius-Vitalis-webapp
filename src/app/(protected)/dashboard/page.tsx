'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { appointmentStorage, patientStorage, consultationStorage } from '@/lib/storage';
import { Button, Badge, Card } from '@/components/ui';
import { formatDate, formatTime, getToday } from '@/lib/utils';
import type { Appointment, Patient } from '@/types';
import styles from './dashboard.module.css';

type TabType = 'queue' | 'finished' | 'cancelled';

export default function DashboardPage() {
    const { doctor } = useAuth();
    const [activeTab, setActiveTab] = useState<TabType>('queue');
    const [selectedDate, setSelectedDate] = useState(getToday());

    const appointments = useMemo(() => {
        if (!doctor) return [];
        return appointmentStorage.getByDate(doctor.id, selectedDate);
    }, [doctor, selectedDate]);

    const patients = useMemo(() => {
        return patientStorage.getAll();
    }, []);

    const getPatient = (patientId: string): Patient | undefined => {
        return patients.find(p => p.id === patientId);
    };

    const filteredAppointments = useMemo(() => {
        return appointments.filter(apt => {
            if (activeTab === 'queue') return apt.status === 'scheduled';
            if (activeTab === 'finished') return apt.status === 'completed';
            if (activeTab === 'cancelled') return apt.status === 'cancelled' || apt.status === 'no-show';
            return true;
        });
    }, [appointments, activeTab]);

    const stats = useMemo(() => {
        if (!doctor) return { todayCount: 0, patientCount: 0, pendingFollowUps: 0 };

        const todayAppointments = appointmentStorage.getByDate(doctor.id, getToday());
        const allPatients = patientStorage.getAll();
        const pendingFollowUps = consultationStorage.getPendingFollowUps(doctor.id);

        return {
            todayCount: todayAppointments.filter(a => a.status === 'scheduled').length,
            patientCount: allPatients.length,
            pendingFollowUps: pendingFollowUps.length,
        };
    }, [doctor]);

    const navigateDate = (direction: 'prev' | 'next') => {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() + (direction === 'prev' ? -1 : 1));
        setSelectedDate(date.toISOString().split('T')[0]);
    };

    return (
        <div className={styles.page}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.welcome}>
                        <h1>Welcome Dr. {doctor?.name?.split(' ')[0] || 'Doctor'}!</h1>
                        <p>Your Appointments</p>
                    </div>
                    <div className={styles.headerActions}>
                        <Link href="/appointments/new">
                            <Button variant="outline">+ Add New Appointment</Button>
                        </Link>
                        <Link href="/consultations/new">
                            <Button variant="secondary">Start Walk-in Consultation</Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className={styles.stats}>
                <Card className={styles.statCard}>
                    <div className={styles.statIcon}>📅</div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{stats.todayCount}</span>
                        <span className={styles.statLabel}>Today&apos;s Queue</span>
                    </div>
                </Card>
                <Card className={styles.statCard}>
                    <div className={styles.statIcon}>👥</div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{stats.patientCount}</span>
                        <span className={styles.statLabel}>Total Patients</span>
                    </div>
                </Card>
                <Card className={styles.statCard}>
                    <div className={styles.statIcon}>🔔</div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{stats.pendingFollowUps}</span>
                        <span className={styles.statLabel}>Pending Follow-ups</span>
                    </div>
                </Card>
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'queue' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('queue')}
                >
                    <span className={styles.tabIcon}>⏳</span>
                    Queue ({appointments.filter(a => a.status === 'scheduled').length})
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'finished' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('finished')}
                >
                    <span className={styles.tabIcon}>✓</span>
                    Finished ({appointments.filter(a => a.status === 'completed').length})
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'cancelled' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('cancelled')}
                >
                    <span className={styles.tabIcon}>✕</span>
                    Cancelled ({appointments.filter(a => a.status === 'cancelled' || a.status === 'no-show').length})
                </button>
            </div>

            {/* Date Navigation */}
            <div className={styles.dateNav}>
                <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Search patient by name and mobile number"
                />
                <div className={styles.dateSelector}>
                    <button className={styles.dateBtn} onClick={() => navigateDate('prev')}>‹</button>
                    <span className={styles.dateDisplay}>
                        📅 {formatDate(selectedDate)}
                    </span>
                    <button className={styles.dateBtn} onClick={() => navigateDate('next')}>›</button>
                    <button
                        className={styles.todayBtn}
                        onClick={() => setSelectedDate(getToday())}
                    >
                        Today
                    </button>
                </div>
            </div>

            {/* Appointments Table */}
            <Card padding="none" className={styles.tableCard}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>NAME</th>
                            <th>CONTACT</th>
                            <th>VISIT TYPE</th>
                            <th>SLOT</th>
                            <th>ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAppointments.length === 0 ? (
                            <tr>
                                <td colSpan={6} className={styles.empty}>
                                    <div className={styles.emptyContent}>
                                        <div className={styles.emptyIcon}>🪑</div>
                                        <p>There are no patients in your queue right now!</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredAppointments.map((apt, index) => {
                                const patient = getPatient(apt.patientId);
                                return (
                                    <tr key={apt.id}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <div className={styles.patientName}>
                                                <strong>{patient?.name || 'Unknown'}</strong>
                                                <span>{patient?.gender}, {patient?.dateOfBirth ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear() : '-'}y</span>
                                            </div>
                                        </td>
                                        <td>{patient?.phone || '-'}</td>
                                        <td>
                                            <Badge variant={apt.type === 'walkin' ? 'warning' : 'purple'}>
                                                {apt.type === 'walkin' ? 'Walk-in' : 'Scheduled'}
                                            </Badge>
                                        </td>
                                        <td>{formatTime(apt.time)}</td>
                                        <td>
                                            <Link href={`/consultations/new?appointmentId=${apt.id}`}>
                                                <Button size="sm" variant="primary">Consult</Button>
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </Card>
        </div>
    );
}
