'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { Card, CardHeader, CardContent, Badge, Button, Input, Select } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import type { TimeSlot, DayOfWeek } from '@/types';
import styles from './profile.module.css';

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function ProfilePage() {
    const { doctor, updateDoctor } = useAuth();
    const [isEditingAvailability, setIsEditingAvailability] = useState(false);
    const [availability, setAvailability] = useState<TimeSlot[]>([]);
    const [appointmentDuration, setAppointmentDuration] = useState(30);

    useEffect(() => {
        if (doctor) {
            setAvailability(doctor.appointmentAvailability || []);
            setAppointmentDuration(doctor.appointmentDuration || 30);
        }
    }, [doctor]);

    const addAvailability = () => {
        setAvailability(prev => [...prev, { day: 'Monday', startTime: '09:00', endTime: '17:00' }]);
    };

    const updateAvailability = (index: number, field: keyof TimeSlot, value: string) => {
        setAvailability(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const removeAvailability = (index: number) => {
        setAvailability(prev => prev.filter((_, i) => i !== index));
    };

    const handleSaveAvailability = () => {
        if (!doctor) return;
        updateDoctor({
            appointmentAvailability: availability,
            appointmentDuration: appointmentDuration
        });
        setIsEditingAvailability(false);
    };

    if (!doctor) return null;

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1>My Profile</h1>
            </div>

            <div className={styles.content}>
                {/* Profile Card */}
                <Card className={styles.profileCard}>
                    <div className={styles.profileHeader}>
                        <div className={styles.avatar}>
                            {doctor.name.charAt(0).toUpperCase()}
                        </div>
                        <div className={styles.profileInfo}>
                            <h2>{doctor.name}</h2>
                            <Badge variant="purple">{doctor.speciality}</Badge>
                        </div>
                    </div>

                    <div className={styles.profileDetails}>
                        <div className={styles.detailRow}>
                            <span className={styles.label}>Email</span>
                            <span className={styles.value}>{doctor.email}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.label}>Phone</span>
                            <span className={styles.value}>{doctor.phone}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.label}>License Number</span>
                            <span className={styles.value}>{doctor.medicalLicenseNumber}</span>
                        </div>
                        {doctor.govtIdType && (
                            <div className={styles.detailRow}>
                                <span className={styles.label}>{doctor.govtIdType}</span>
                                <span className={styles.value}>{doctor.govtIdNumber}</span>
                            </div>
                        )}
                        <div className={styles.detailRow}>
                            <span className={styles.label}>Member Since</span>
                            <span className={styles.value}>{formatDate(doctor.createdAt)}</span>
                        </div>
                    </div>
                </Card>

                {/* Address Card */}
                <Card>
                    <CardHeader>
                        <h3>Address</h3>
                    </CardHeader>
                    <CardContent>
                        <div className={styles.address}>
                            {doctor.address.street && <p>{doctor.address.street}</p>}
                            <p>
                                {doctor.address.city && `${doctor.address.city}, `}
                                {doctor.address.state && `${doctor.address.state} `}
                                {doctor.address.pincode}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Availability Card */}
                <Card>
                    <CardHeader className={styles.cardHeaderFlex}>
                        <h3>Consultation Availability</h3>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                if (isEditingAvailability) handleSaveAvailability();
                                else setIsEditingAvailability(true);
                            }}
                        >
                            {isEditingAvailability ? 'Save Changes' : 'Edit Availability'}
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {isEditingAvailability ? (
                            <div className={styles.editor}>
                                <div className={styles.slots}>
                                    {availability.map((slot, index) => (
                                        <div key={index} className={styles.editorSlot}>
                                            <Select
                                                options={DAYS.map(d => ({ value: d, label: d }))}
                                                value={slot.day}
                                                onChange={(e) => updateAvailability(index, 'day', e.target.value)}
                                            />
                                            <Input
                                                type="time"
                                                value={slot.startTime}
                                                onChange={(e) => updateAvailability(index, 'startTime', e.target.value)}
                                            />
                                            <span className={styles.to}>to</span>
                                            <Input
                                                type="time"
                                                value={slot.endTime}
                                                onChange={(e) => updateAvailability(index, 'endTime', e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                className={styles.removeSlot}
                                                onClick={() => removeAvailability(index)}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <div className={styles.editorActions}>
                                    <Button type="button" variant="outline" size="sm" onClick={addAvailability}>
                                        + Add Slot
                                    </Button>
                                    <Input
                                        label="Duration (min)"
                                        type="number"
                                        min="10"
                                        max="120"
                                        value={appointmentDuration}
                                        onChange={(e) => setAppointmentDuration(Number(e.target.value))}
                                        className={styles.durationInput}
                                    />
                                </div>
                            </div>
                        ) : (
                            <>
                                {doctor.appointmentAvailability.length === 0 ? (
                                    <p className={styles.emptyText}>No availability configured</p>
                                ) : (
                                    <div className={styles.availability}>
                                        {doctor.appointmentAvailability.map((slot, index) => (
                                            <div key={index} className={styles.slot}>
                                                <span className={styles.day}>{slot.day}</span>
                                                <span className={styles.time}>
                                                    {slot.startTime} - {slot.endTime}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className={styles.durationDisplay}>
                                    <span className={styles.label}>Appointment Duration:</span>
                                    <span className={styles.value}>{doctor.appointmentDuration} minutes</span>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
