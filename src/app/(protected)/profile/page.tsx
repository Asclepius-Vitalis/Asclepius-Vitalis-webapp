'use client';

import React from 'react';
import { useAuth } from '@/lib/auth';
import { Card, CardHeader, CardContent, Badge, Button } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import styles from './profile.module.css';

export default function ProfilePage() {
    const { doctor } = useAuth();

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
                    <CardHeader>
                        <h3>Consultation Availability</h3>
                    </CardHeader>
                    <CardContent>
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
                    </CardContent>
                </Card>

                {/* Appointment Settings */}
                <Card>
                    <CardHeader>
                        <h3>Appointment Settings</h3>
                    </CardHeader>
                    <CardContent>
                        <div className={styles.detailRow}>
                            <span className={styles.label}>Default Duration</span>
                            <span className={styles.value}>{doctor.appointmentDuration} minutes</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
