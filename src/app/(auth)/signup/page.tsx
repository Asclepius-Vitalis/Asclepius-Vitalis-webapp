'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { Button, Input, Select } from '@/components/ui';
import type { Speciality, DayOfWeek, TimeSlot } from '@/types';
import styles from './signup.module.css';

const SPECIALITIES: { value: Speciality; label: string }[] = [
    { value: 'General Physician', label: 'General Physician' },
    { value: 'Cardiologist', label: 'Cardiologist' },
    { value: 'Pulmonologist', label: 'Pulmonologist' },
    { value: 'Oncologist', label: 'Oncologist' },
];

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const initialFormData = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    speciality: '' as Speciality | '',
    govtIdType: '',
    govtIdNumber: '',
    medicalLicenseNumber: '',
    appointmentDuration: '30',
};

export default function SignupPage() {
    const router = useRouter();
    const { signup } = useAuth();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState(initialFormData);
    const [availability, setAvailability] = useState<TimeSlot[]>([
        { day: 'Monday', startTime: '09:00', endTime: '17:00' },
        { day: 'Wednesday', startTime: '09:00', endTime: '17:00' },
        { day: 'Friday', startTime: '09:00', endTime: '17:00' }
    ]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

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

    const validateStep1 = () => {
        if (!formData.name || !formData.email || !formData.password) {
            setError('Please fill in all required fields');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return false;
        }
        return true;
    };

    const validateStep2 = () => {
        if (!formData.phone || !formData.speciality || !formData.medicalLicenseNumber) {
            setError('Please fill in all required fields');
            return false;
        }
        return true;
    };

    const handleNext = () => {
        setError('');
        if (step === 1 && validateStep1()) {
            setStep(2);
        } else if (step === 2 && validateStep2()) {
            setStep(3);
        }
    };

    const handleBack = () => {
        setError('');
        setStep(prev => prev - 1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (availability.length === 0) {
            setError('Please add at least one availability slot.');
            return;
        }

        setIsLoading(true);

        const result = await signup({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
            address: {
                street: formData.street,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode,
            },
            speciality: formData.speciality as Speciality,
            govtIdType: formData.govtIdType,
            govtIdNumber: formData.govtIdNumber,
            medicalLicenseNumber: formData.medicalLicenseNumber,
            walkInAvailability: availability,
            appointmentAvailability: availability,
            appointmentDuration: parseInt(formData.appointmentDuration),
        });

        if (result.success) {
            router.push('/dashboard');
        } else {
            setError(result.error || 'Signup failed');
        }

        setIsLoading(false);
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <div className={styles.logo}>🏥</div>
                    <h1 className={styles.title}>Create Account</h1>
                    <p className={styles.subtitle}>Join Asclepius Vitalis as a Doctor</p>
                </div>

                {/* Progress indicator */}
                <div className={styles.progress}>
                    {[1, 2, 3].map(num => (
                        <div key={num} className={`${styles.progressStep} ${step >= num ? styles.active : ''}`}>
                            <div className={styles.progressDot}>{num}</div>
                            <span className={styles.progressLabel}>
                                {num === 1 ? 'Account' : num === 2 ? 'Professional' : 'Availability'}
                            </span>
                        </div>
                    ))}
                </div>

                <form
                    onSubmit={handleSubmit}
                    className={styles.form}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                        }
                    }}
                >
                    {error && <div className={styles.error}>{error}</div>}

                    {/* Step 1: Basic Account Info */}
                    {step === 1 && (
                        <div className={styles.stepContent}>
                            <Input
                                label="Full Name"
                                placeholder="Dr. John Doe"
                                value={formData.name}
                                onChange={(e) => updateField('name', e.target.value)}
                                required
                                fullWidth
                            />
                            <Input
                                label="Email"
                                type="email"
                                placeholder="doctor@example.com"
                                value={formData.email}
                                onChange={(e) => updateField('email', e.target.value)}
                                required
                                fullWidth
                            />
                            <Input
                                label="Password"
                                type="password"
                                placeholder="Min 6 characters"
                                value={formData.password}
                                onChange={(e) => updateField('password', e.target.value)}
                                required
                                fullWidth
                            />
                            <Input
                                label="Confirm Password"
                                type="password"
                                placeholder="Re-enter password"
                                value={formData.confirmPassword}
                                onChange={(e) => updateField('confirmPassword', e.target.value)}
                                required
                                fullWidth
                            />
                        </div>
                    )}

                    {/* Step 2: Professional Info */}
                    {step === 2 && (
                        <div className={styles.stepContent}>
                            <Input
                                label="Phone Number"
                                type="tel"
                                placeholder="9876543210"
                                value={formData.phone}
                                onChange={(e) => updateField('phone', e.target.value)}
                                required
                                fullWidth
                            />
                            <Select
                                label="Speciality"
                                options={SPECIALITIES}
                                value={formData.speciality}
                                onChange={(e) => updateField('speciality', e.target.value)}
                                required
                                fullWidth
                            />
                            <Input
                                label="Medical License Number"
                                placeholder="MCI/12345/2020"
                                value={formData.medicalLicenseNumber}
                                onChange={(e) => updateField('medicalLicenseNumber', e.target.value)}
                                required
                                fullWidth
                            />
                            <div className={styles.row}>
                                <Input
                                    label="Govt ID Type"
                                    placeholder="Aadhar/PAN"
                                    value={formData.govtIdType}
                                    onChange={(e) => updateField('govtIdType', e.target.value)}
                                    fullWidth
                                />
                                <Input
                                    label="Govt ID Number"
                                    placeholder="1234-5678-9012"
                                    value={formData.govtIdNumber}
                                    onChange={(e) => updateField('govtIdNumber', e.target.value)}
                                    fullWidth
                                />
                            </div>
                            <div className={styles.row}>
                                <Input
                                    label="City"
                                    placeholder="Mumbai"
                                    value={formData.city}
                                    onChange={(e) => updateField('city', e.target.value)}
                                    fullWidth
                                />
                                <Input
                                    label="State"
                                    placeholder="Maharashtra"
                                    value={formData.state}
                                    onChange={(e) => updateField('state', e.target.value)}
                                    fullWidth
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 3: Availability */}
                    {step === 3 && (
                        <div className={styles.stepContent}>
                            <div className={styles.availabilitySection}>
                                <div className={styles.sectionHeader}>
                                    <h3>Consultation Availability</h3>
                                    <Button type="button" variant="outline" size="sm" onClick={addAvailability}>
                                        + Add Slot
                                    </Button>
                                </div>

                                {availability.length === 0 ? (
                                    <p className={styles.emptyText}>No availability slots added. Click &quot;Add Slot&quot; to add your available times.</p>
                                ) : (
                                    <div className={styles.slots}>
                                        {availability.map((slot, index) => (
                                            <div key={index} className={styles.slot}>
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
                                )}
                            </div>

                            <Input
                                label="Default Appointment Duration (minutes)"
                                type="number"
                                min="10"
                                max="120"
                                value={formData.appointmentDuration}
                                onChange={(e) => updateField('appointmentDuration', e.target.value)}
                                fullWidth
                            />
                        </div>
                    )}

                    {/* Navigation buttons */}
                    <div className={styles.buttons}>
                        {step > 1 && (
                            <Button key="back-btn" type="button" variant="outline" onClick={handleBack}>
                                Back
                            </Button>
                        )}
                        {step < 3 ? (
                            <Button key="next-btn" type="button" onClick={handleNext}>
                                Next
                            </Button>
                        ) : (
                            <Button key="submit-btn" type="submit" loading={isLoading}>
                                Create Account
                            </Button>
                        )}
                    </div>
                </form>

                <div className={styles.footer}>
                    <p>
                        Already have an account?{' '}
                        <Link href="/login" className={styles.link}>
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
