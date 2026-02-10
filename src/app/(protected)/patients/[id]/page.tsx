'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { patientStorage, appointmentStorage, consultationStorage } from '@/lib/storage';
import { formatDate, calculateAge } from '@/lib/utils';
import type { Patient, Appointment, Consultation } from '@/types';
import styles from './patient-detail.module.css';

export default function PatientDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { doctor } = useAuth();
    const [patient, setPatient] = useState<Patient | null>(null);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [consultations, setConsultations] = useState<Consultation[]>([]);
    const [activeTab, setActiveTab] = useState<'overview' | 'appointments' | 'consultations'>('overview');

    useEffect(() => {
        if (id && doctor) {
            const foundPatient = patientStorage.getById(id);
            if (foundPatient) {
                setPatient(foundPatient);
                const patientAppointments = appointmentStorage.getByPatient(id)
                    .filter(a => a.doctorId === doctor.id)
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                setAppointments(patientAppointments);
                const patientConsultations = consultationStorage.getByPatient(id)
                    .filter(c => c.doctorId === doctor.id)
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                setConsultations(patientConsultations);
            }
        }
    }, [id, doctor]);

    if (!patient) {
        return (
            <div className={styles.container}>
                <div className={styles.notFound}>
                    <h2>Patient not found</h2>
                    <p>The patient you&apos;re looking for doesn&apos;t exist or has been removed.</p>
                    <button className={styles.backBtn} onClick={() => router.push('/patients')}>
                        ← Back to Patients
                    </button>
                </div>
            </div>
        );
    }

    const statusColor = (status: string) => {
        switch (status) {
            case 'completed': return styles.statusCompleted;
            case 'scheduled': return styles.statusScheduled;
            case 'cancelled': return styles.statusCancelled;
            case 'no-show': return styles.statusNoShow;
            default: return '';
        }
    };

    return (
        <div className={styles.container}>
            <button className={styles.backBtn} onClick={() => router.push('/patients')}>
                ← Back to Patients
            </button>

            {/* Patient Header Card */}
            <div className={styles.profileCard}>
                <div className={styles.profileHeader}>
                    <div className={styles.avatar}>
                        {patient.name.charAt(0).toUpperCase()}
                    </div>
                    <div className={styles.profileInfo}>
                        <h1 className={styles.patientName}>{patient.name}</h1>
                        <div className={styles.profileMeta}>
                            <span>{patient.gender}</span>
                            <span className={styles.dot}>•</span>
                            <span>{calculateAge(patient.dateOfBirth)} years old</span>
                            <span className={styles.dot}>•</span>
                            <span>DOB: {formatDate(patient.dateOfBirth)}</span>
                        </div>
                    </div>
                </div>

                <div className={styles.contactGrid}>
                    <div className={styles.contactItem}>
                        <span className={styles.contactIcon}>📱</span>
                        <div>
                            <div className={styles.contactLabel}>Phone</div>
                            <div className={styles.contactValue}>{patient.phone}</div>
                        </div>
                    </div>
                    {patient.email && (
                        <div className={styles.contactItem}>
                            <span className={styles.contactIcon}>📧</span>
                            <div>
                                <div className={styles.contactLabel}>Email</div>
                                <div className={styles.contactValue}>{patient.email}</div>
                            </div>
                        </div>
                    )}
                    {patient.address?.city && (
                        <div className={styles.contactItem}>
                            <span className={styles.contactIcon}>📍</span>
                            <div>
                                <div className={styles.contactLabel}>Location</div>
                                <div className={styles.contactValue}>
                                    {[patient.address.city, patient.address.state].filter(Boolean).join(', ')}
                                </div>
                            </div>
                        </div>
                    )}
                    <div className={styles.contactItem}>
                        <span className={styles.contactIcon}>📅</span>
                        <div>
                            <div className={styles.contactLabel}>Patient Since</div>
                            <div className={styles.contactValue}>{formatDate(patient.createdAt)}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>{appointments.length}</div>
                    <div className={styles.statLabel}>Total Visits</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>{consultations.length}</div>
                    <div className={styles.statLabel}>Consultations</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>
                        {appointments.length > 0 ? formatDate(appointments[0].date) : '—'}
                    </div>
                    <div className={styles.statLabel}>Last Visit</div>
                </div>
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'overview' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    Overview
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'appointments' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('appointments')}
                >
                    Appointments ({appointments.length})
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'consultations' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('consultations')}
                >
                    Consultations ({consultations.length})
                </button>
            </div>

            {/* Tab Content */}
            <div className={styles.tabContent}>
                {activeTab === 'overview' && (
                    <div className={styles.overviewGrid}>
                        {/* Address */}
                        {(patient.address?.street || patient.address?.city) && (
                            <div className={styles.infoCard}>
                                <h3 className={styles.infoCardTitle}>📍 Address</h3>
                                <p className={styles.infoText}>
                                    {[patient.address.street, patient.address.city, patient.address.state, patient.address.pincode]
                                        .filter(Boolean)
                                        .join(', ')}
                                </p>
                            </div>
                        )}

                        {/* ID Info */}
                        {patient.govtIdType && (
                            <div className={styles.infoCard}>
                                <h3 className={styles.infoCardTitle}>🪪 Identification</h3>
                                <p className={styles.infoText}>
                                    <strong>{patient.govtIdType}:</strong> {patient.govtIdNumber}
                                </p>
                            </div>
                        )}

                        {/* Medical History */}
                        <div className={styles.infoCard}>
                            <h3 className={styles.infoCardTitle}>🏥 Medical History</h3>
                            <p className={styles.infoText}>
                                {patient.medicalHistory || 'No medical history recorded.'}
                            </p>
                        </div>

                        {/* Allergies */}
                        <div className={styles.infoCard}>
                            <h3 className={styles.infoCardTitle}>⚠️ Allergies</h3>
                            {patient.allergies && patient.allergies.length > 0 ? (
                                <div className={styles.tagList}>
                                    {patient.allergies.map((allergy, i) => (
                                        <span key={i} className={styles.allergyTag}>
                                            {allergy}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className={styles.infoText}>No known allergies.</p>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'appointments' && (
                    <div>
                        {appointments.length === 0 ? (
                            <div className={styles.emptyTab}>
                                <p>No appointments found for this patient.</p>
                            </div>
                        ) : (
                            <div className={styles.listItems}>
                                {appointments.map(apt => (
                                    <div key={apt.id} className={styles.listItem}>
                                        <div className={styles.listItemLeft}>
                                            <div className={styles.listItemDate}>
                                                {formatDate(apt.date)}
                                            </div>
                                            <div className={styles.listItemMeta}>
                                                {apt.time} • {apt.type === 'walkin' ? 'Walk-in' : 'Scheduled'}
                                            </div>
                                            {apt.reasonForVisit && (
                                                <div className={styles.listItemReason}>
                                                    {apt.reasonForVisit}
                                                </div>
                                            )}
                                        </div>
                                        <span className={`${styles.statusBadge} ${statusColor(apt.status)}`}>
                                            {apt.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'consultations' && (
                    <div>
                        {consultations.length === 0 ? (
                            <div className={styles.emptyTab}>
                                <p>No consultations found for this patient.</p>
                            </div>
                        ) : (
                            <div className={styles.listItems}>
                                {consultations.map(con => (
                                    <div key={con.id} className={styles.listItem}>
                                        <div className={styles.listItemLeft}>
                                            <div className={styles.listItemDate}>
                                                {formatDate(con.date)}
                                            </div>
                                            <div className={styles.listItemMeta}>
                                                {con.diagnosis.join(', ') || 'No diagnosis'}
                                            </div>
                                            {con.symptoms.length > 0 && (
                                                <div className={styles.listItemReason}>
                                                    Symptoms: {con.symptoms.join(', ')}
                                                </div>
                                            )}
                                        </div>
                                        {con.followUpDate && (
                                            <span className={styles.followUpTag}>
                                                Follow-up: {formatDate(con.followUpDate)}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
