'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { patientStorage, appointmentStorage } from '@/lib/storage';
import { getToday, formatTime } from '@/lib/utils';
import type { Patient, DayOfWeek } from '@/types';
import styles from './new-appointment.module.css';

export default function NewAppointmentPage() {
    const { doctor } = useAuth();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Form State
    const [selectedPatientId, setSelectedPatientId] = useState('');
    const [selectedPatientName, setSelectedPatientName] = useState('');
    const [patientSearch, setPatientSearch] = useState('');
    const [showPatientDropdown, setShowPatientDropdown] = useState(false);
    const [date, setDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [reason, setReason] = useState('');
    const [remarks, setRemarks] = useState('');

    // Data State
    const [patients, setPatients] = useState<Patient[]>([]);
    const [bookedSlots, setBookedSlots] = useState<string[]>([]);

    const patientSearchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (doctor) {
            setPatients(patientStorage.getByDoctor(doctor.id));
        }
    }, [doctor]);

    // Close patient dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (patientSearchRef.current && !patientSearchRef.current.contains(e.target as Node)) {
                setShowPatientDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filter patients based on search query
    const filteredPatients = useMemo(() => {
        if (!patientSearch.trim()) return patients;
        const q = patientSearch.toLowerCase();
        return patients.filter(p =>
            p.name.toLowerCase().includes(q) ||
            p.phone.includes(q) ||
            p.email?.toLowerCase().includes(q)
        );
    }, [patients, patientSearch]);

    // Update booked slots when date changes
    useEffect(() => {
        if (doctor && date) {
            const appointments = appointmentStorage.getByDate(doctor.id, date);
            setBookedSlots(appointments
                .filter(a => a.status !== 'cancelled' && a.status !== 'no-show')
                .map(a => a.time));
        } else {
            setBookedSlots([]);
        }
    }, [doctor, date]);

    // Generate available time slots based on doctor's schedule
    // FIX: parse date parts manually to avoid UTC timezone offset bug
    const timeSlots = useMemo(() => {
        if (!doctor || !date) return [];

        const [year, month, day] = date.split('-').map(Number);
        const dateObj = new Date(year, month - 1, day); // local time
        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' }) as DayOfWeek;

        // Find ALL availability windows for this day (doctor may have multiple slots)
        const daySlots = doctor.appointmentAvailability.filter(s => s.day === dayName);

        if (daySlots.length === 0) return [];

        const allSlots: string[] = [];

        for (const dayAvailability of daySlots) {
            const [startHour, startMinute] = dayAvailability.startTime.split(':').map(Number);
            const [endHour, endMinute] = dayAvailability.endTime.split(':').map(Number);

            let currentHour = startHour;
            let currentMinute = startMinute;

            while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
                const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
                allSlots.push(timeString);

                currentMinute += doctor.appointmentDuration;
                if (currentMinute >= 60) {
                    currentHour += Math.floor(currentMinute / 60);
                    currentMinute %= 60;
                }
            }
        }

        return allSlots;
    }, [doctor, date]);

    // Group slots by time of day
    const groupedSlots = useMemo(() => {
        const groups = {
            Morning: [] as string[],
            Afternoon: [] as string[],
            Evening: [] as string[],
            Night: [] as string[]
        };

        timeSlots.forEach(time => {
            const hour = parseInt(time.split(':')[0]);
            if (hour < 12) groups.Morning.push(time);
            else if (hour < 17) groups.Afternoon.push(time);
            else if (hour < 20) groups.Evening.push(time);
            else groups.Night.push(time);
        });

        return groups;
    }, [timeSlots]);

    const handleSelectPatient = (patient: Patient) => {
        setSelectedPatientId(patient.id);
        setSelectedPatientName(patient.name);
        setPatientSearch('');
        setShowPatientDropdown(false);
    };

    const handleClearPatient = () => {
        setSelectedPatientId('');
        setSelectedPatientName('');
        setPatientSearch('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!doctor || !selectedPatientId || !date || !selectedTime) {
            setError('Please fill in all required fields.');
            return;
        }

        setIsSubmitting(true);

        try {
            appointmentStorage.create({
                patientId: selectedPatientId,
                doctorId: doctor.id,
                type: 'scheduled',
                date,
                time: selectedTime,
                status: 'scheduled',
                reasonForVisit: reason || undefined,
                remarksForReception: remarks || undefined
            });

            router.push('/appointments');
        } catch {
            setError('Failed to book appointment. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <button className={styles.backButton} onClick={() => router.back()}>
                    ← Back
                </button>
                <h1 className={styles.title}>New Appointment</h1>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
                {error && <div className={styles.error}>{error}</div>}

                {/* Patient Selection */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <span className={styles.sectionIcon}>👤</span>
                        Select Patient
                    </h2>
                    <div className={styles.field}>
                        <label className={styles.label}>Patient *</label>

                        {selectedPatientId ? (
                            <div className={styles.selectedPatient}>
                                <div className={styles.selectedPatientInfo}>
                                    <div className={styles.patientAvatar}>
                                        {selectedPatientName.charAt(0).toUpperCase()}
                                    </div>
                                    <span className={styles.selectedName}>{selectedPatientName}</span>
                                </div>
                                <button
                                    type="button"
                                    className={styles.clearPatientBtn}
                                    onClick={handleClearPatient}
                                >
                                    ×
                                </button>
                            </div>
                        ) : (
                            <div className={styles.patientSearchWrapper} ref={patientSearchRef}>
                                <div className={styles.searchInputRow}>
                                    <span className={styles.searchIcon}>🔍</span>
                                    <input
                                        type="text"
                                        className={styles.patientSearchInput}
                                        placeholder="Search by name, phone, or email..."
                                        value={patientSearch}
                                        onChange={(e) => {
                                            setPatientSearch(e.target.value);
                                            setShowPatientDropdown(true);
                                        }}
                                        onFocus={() => setShowPatientDropdown(true)}
                                    />
                                    <button
                                        type="button"
                                        className={styles.newPatientBtn}
                                        onClick={() => router.push('/patients/new')}
                                    >
                                        + New Patient
                                    </button>
                                </div>

                                {showPatientDropdown && (
                                    <div className={styles.patientDropdown}>
                                        {filteredPatients.length === 0 ? (
                                            <div className={styles.noResults}>
                                                No patients found.{' '}
                                                <button
                                                    type="button"
                                                    className={styles.inlineLink}
                                                    onClick={() => router.push('/patients/new')}
                                                >
                                                    Add a new patient
                                                </button>
                                            </div>
                                        ) : (
                                            filteredPatients.map(p => (
                                                <div
                                                    key={p.id}
                                                    className={styles.patientOption}
                                                    onClick={() => handleSelectPatient(p)}
                                                >
                                                    <div className={styles.patientAvatar}>
                                                        {p.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className={styles.patientOptionInfo}>
                                                        <div className={styles.patientOptionName}>{p.name}</div>
                                                        <div className={styles.patientOptionMeta}>
                                                            {p.phone}{p.email ? ` • ${p.email}` : ''}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Date & Time Selection */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <span className={styles.sectionIcon}>📅</span>
                        Date & Time
                    </h2>
                    <div className={styles.field}>
                        <label className={styles.label}>Date *</label>
                        <input
                            type="date"
                            className={styles.input}
                            value={date}
                            min={getToday()}
                            onChange={(e) => {
                                setDate(e.target.value);
                                setSelectedTime('');
                            }}
                            required
                        />
                    </div>

                    {date && (
                        <div className={styles.field}>
                            <label className={styles.label}>Available Slots *</label>
                            {timeSlots.length === 0 ? (
                                <p className={styles.noSlots}>
                                    No slots available on this day. The doctor may not have set availability for this day of the week.
                                </p>
                            ) : (
                                Object.entries(groupedSlots).map(([period, slots]) => (
                                    slots.length > 0 && (
                                        <div key={period} className={styles.periodGroup}>
                                            <div className={styles.periodTitle}>{period}</div>
                                            <div className={styles.slotGrid}>
                                                {slots.map(time => {
                                                    const isBooked = bookedSlots.includes(time);
                                                    return (
                                                        <button
                                                            key={time}
                                                            type="button"
                                                            className={`${styles.slotButton} ${selectedTime === time ? styles.selected : ''} ${isBooked ? styles.booked : ''}`}
                                                            disabled={isBooked}
                                                            onClick={() => setSelectedTime(time)}
                                                        >
                                                            {formatTime(time)}
                                                            {isBooked && <span className={styles.bookedLabel}>Booked</span>}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Visit Details */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <span className={styles.sectionIcon}>📝</span>
                        Visit Details
                    </h2>
                    <div className={styles.grid}>
                        <div className={styles.fieldFull}>
                            <label className={styles.label}>Reason for Visit</label>
                            <textarea
                                className={styles.textarea}
                                placeholder="E.g., Fever, Regular checkup..."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                            />
                        </div>
                        <div className={styles.fieldFull}>
                            <label className={styles.label}>Remarks for Reception</label>
                            <input
                                type="text"
                                className={styles.input}
                                placeholder="E.g., Check temperature, Collect payment..."
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.actions}>
                    <button
                        type="button"
                        className={styles.cancelButton}
                        onClick={() => router.back()}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Booking...' : 'Book Appointment'}
                    </button>
                </div>
            </form>
        </div>
    );
}
