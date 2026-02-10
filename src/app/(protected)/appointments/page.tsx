'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { appointmentStorage, patientStorage } from '@/lib/storage';
import { formatDate, formatTime, getToday } from '@/lib/utils';
import type { Appointment, Patient, AppointmentStatus } from '@/types';
import styles from './appointments.module.css';

type FilterStatus = 'all' | 'scheduled' | 'completed' | 'cancelled' | 'no-show';

export default function AppointmentsPage() {
    const { doctor } = useAuth();
    const router = useRouter();
    const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
    const [dateFilter, setDateFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Initial load
    useEffect(() => {
        if (doctor) {
            setAppointments(appointmentStorage.getByDoctor(doctor.id));
            setPatients(patientStorage.getByDoctor(doctor.id));
        }
    }, [doctor, refreshTrigger]);

    const getPatient = (patientId: string): Patient | undefined => {
        return patients.find(p => p.id === patientId);
    };

    const handleStatusChange = (id: string, newStatus: AppointmentStatus) => {
        if (confirm(`Are you sure you want to mark this appointment as ${newStatus}?`)) {
            appointmentStorage.update(id, { status: newStatus });
            setRefreshTrigger(prev => prev + 1);
        }
    };

    const filteredAppointments = useMemo(() => {
        let result = [...appointments];

        if (statusFilter !== 'all') {
            result = result.filter(a => a.status === statusFilter);
        }

        if (dateFilter) {
            result = result.filter(a => a.date === dateFilter);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(a => {
                const patient = getPatient(a.patientId);
                return patient?.name.toLowerCase().includes(query) ||
                    patient?.phone.includes(query);
            });
        }

        result.sort((a, b) => {
            const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
            if (dateCompare !== 0) return dateCompare;
            return b.time.localeCompare(a.time);
        });

        return result;
    }, [appointments, statusFilter, dateFilter, searchQuery, patients]);

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'scheduled': return styles.badgeScheduled;
            case 'completed': return styles.badgeCompleted;
            case 'cancelled': return styles.badgeCancelled;
            case 'no-show': return styles.badgeNoShow;
            default: return '';
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div className={styles.title}>
                    <h1>Appointments</h1>
                    <span>{appointments.length} total • {filteredAppointments.length} showing</span>
                </div>
                <button
                    className={styles.newButton}
                    onClick={() => router.push('/appointments/new')}
                >
                    + New Appointment
                </button>
            </div>

            <div className={styles.filters}>
                <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Search by patient name or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <input
                    type="date"
                    className={styles.dateInput}
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    placeholder="Filter by date"
                />
                <select
                    className={styles.filterSelect}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
                >
                    <option value="all">All Status</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="no-show">No Show</option>
                </select>
                {(dateFilter || searchQuery || statusFilter !== 'all') && (
                    <button
                        style={{ background: 'none', border: 'none', color: 'var(--primary-600)', cursor: 'pointer', fontSize: '0.875rem' }}
                        onClick={() => {
                            setDateFilter('');
                            setSearchQuery('');
                            setStatusFilter('all');
                        }}
                    >
                        Clear Filters
                    </button>
                )}
            </div>

            <div className={styles.list}>
                {filteredAppointments.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>📅</div>
                        <h3>{appointments.length === 0 ? 'No appointments yet' : 'No appointments found'}</h3>
                        <p>{appointments.length === 0
                            ? 'Create your first appointment to get started.'
                            : 'Try adjusting your search or filters.'}</p>
                    </div>
                ) : (
                    filteredAppointments.map(apt => {
                        const patient = getPatient(apt.patientId);
                        return (
                            <div key={apt.id} className={styles.card}>
                                <div className={styles.patientInfo}>
                                    <div className={styles.patientName}>
                                        {patient?.name || 'Unknown Patient'}
                                        <span className={`${styles.badge} ${getStatusBadgeClass(apt.status)}`} style={{ marginLeft: '10px', fontSize: '0.7em' }}>
                                            {apt.status}
                                        </span>
                                    </div>
                                    <div className={styles.appointmentMeta}>
                                        <span>{formatDate(apt.date)}</span>
                                        <span>{formatTime(apt.time)}</span>
                                        <span>{patient?.phone || '-'}</span>
                                        <span className={`${styles.typeBadge} ${apt.type === 'walkin' ? styles.typeWalkin : styles.typeScheduled}`}>
                                            {apt.type === 'walkin' ? 'Walk-in' : 'Scheduled'}
                                        </span>
                                    </div>
                                </div>
                                <div className={styles.actions}>
                                    {apt.status === 'scheduled' && (
                                        <>
                                            <div className={styles.statusActions}>
                                                <button
                                                    className={`${styles.statusBtn} ${styles.complete}`}
                                                    onClick={() => handleStatusChange(apt.id, 'completed')}
                                                    title="Mark Completed"
                                                >
                                                    ✓
                                                </button>
                                                <button
                                                    className={`${styles.statusBtn} ${styles.cancel}`}
                                                    onClick={() => handleStatusChange(apt.id, 'cancelled')}
                                                    title="Cancel Appointment"
                                                >
                                                    ✕
                                                </button>
                                                <button
                                                    className={`${styles.statusBtn}`}
                                                    onClick={() => handleStatusChange(apt.id, 'no-show')}
                                                    title="Mark No-Show"
                                                >
                                                    ?
                                                </button>
                                            </div>
                                            <button
                                                className={styles.consultBtn}
                                                onClick={() => router.push(`/consultations/new?appointmentId=${apt.id}`)}
                                            >
                                                Start Consultation
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
