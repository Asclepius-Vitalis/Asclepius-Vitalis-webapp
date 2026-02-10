'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { patientStorage } from '@/lib/storage';
import type { Gender } from '@/types';
import styles from './new-patient.module.css';

export default function NewPatientPage() {
    const { doctor } = useAuth();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        dateOfBirth: '',
        gender: '' as Gender | '',
        street: '',
        city: '',
        state: '',
        pincode: '',
        govtIdType: '',
        govtIdNumber: '',
        medicalHistory: '',
        allergies: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!doctor) return;

        // Validation
        if (!formData.name || !formData.phone || !formData.dateOfBirth || !formData.gender) {
            setError('Please fill in all required fields.');
            return;
        }

        // Check for duplicate phone
        const existingPatient = patientStorage.getByPhone(formData.phone);
        if (existingPatient) {
            setError('A patient with this phone number already exists.');
            return;
        }

        setIsSubmitting(true);

        try {
            patientStorage.create({
                name: formData.name,
                phone: formData.phone,
                email: formData.email || undefined,
                dateOfBirth: formData.dateOfBirth,
                gender: formData.gender as Gender,
                address: {
                    street: formData.street,
                    city: formData.city,
                    state: formData.state,
                    pincode: formData.pincode,
                },
                govtIdType: formData.govtIdType || undefined,
                govtIdNumber: formData.govtIdNumber || undefined,
                medicalHistory: formData.medicalHistory || undefined,
                allergies: formData.allergies ? formData.allergies.split(',').map(s => s.trim()).filter(Boolean) : undefined,
                createdBy: doctor.id,
            });

            router.push('/patients');
        } catch {
            setError('Something went wrong. Please try again.');
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
                <h1 className={styles.title}>Add New Patient</h1>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
                {error && <div className={styles.error}>{error}</div>}

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <span className={styles.sectionIcon}>👤</span>
                        Personal Information
                    </h2>
                    <div className={styles.grid}>
                        <div className={styles.field}>
                            <label className={styles.label}>Full Name *</label>
                            <input
                                type="text"
                                name="name"
                                className={styles.input}
                                placeholder="Enter patient's full name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className={styles.field}>
                            <label className={styles.label}>Phone Number *</label>
                            <input
                                type="tel"
                                name="phone"
                                className={styles.input}
                                placeholder="10-digit phone number"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className={styles.field}>
                            <label className={styles.label}>Email</label>
                            <input
                                type="email"
                                name="email"
                                className={styles.input}
                                placeholder="Email address (optional)"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div className={styles.field}>
                            <label className={styles.label}>Date of Birth *</label>
                            <input
                                type="date"
                                name="dateOfBirth"
                                className={styles.input}
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className={styles.field}>
                            <label className={styles.label}>Gender *</label>
                            <select
                                name="gender"
                                className={styles.input}
                                value={formData.gender}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <span className={styles.sectionIcon}>📍</span>
                        Address
                    </h2>
                    <div className={styles.grid}>
                        <div className={styles.fieldFull}>
                            <label className={styles.label}>Street Address</label>
                            <input
                                type="text"
                                name="street"
                                className={styles.input}
                                placeholder="Street address"
                                value={formData.street}
                                onChange={handleChange}
                            />
                        </div>
                        <div className={styles.field}>
                            <label className={styles.label}>City</label>
                            <input
                                type="text"
                                name="city"
                                className={styles.input}
                                placeholder="City"
                                value={formData.city}
                                onChange={handleChange}
                            />
                        </div>
                        <div className={styles.field}>
                            <label className={styles.label}>State</label>
                            <input
                                type="text"
                                name="state"
                                className={styles.input}
                                placeholder="State"
                                value={formData.state}
                                onChange={handleChange}
                            />
                        </div>
                        <div className={styles.field}>
                            <label className={styles.label}>Pincode</label>
                            <input
                                type="text"
                                name="pincode"
                                className={styles.input}
                                placeholder="Pincode"
                                value={formData.pincode}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <span className={styles.sectionIcon}>🪪</span>
                        Identification (Optional)
                    </h2>
                    <div className={styles.grid}>
                        <div className={styles.field}>
                            <label className={styles.label}>ID Type</label>
                            <select
                                name="govtIdType"
                                className={styles.input}
                                value={formData.govtIdType}
                                onChange={handleChange}
                            >
                                <option value="">Select ID Type</option>
                                <option value="Aadhaar">Aadhaar Card</option>
                                <option value="PAN">PAN Card</option>
                                <option value="Passport">Passport</option>
                                <option value="Driving License">Driving License</option>
                                <option value="Voter ID">Voter ID</option>
                            </select>
                        </div>
                        <div className={styles.field}>
                            <label className={styles.label}>ID Number</label>
                            <input
                                type="text"
                                name="govtIdNumber"
                                className={styles.input}
                                placeholder="ID number"
                                value={formData.govtIdNumber}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <span className={styles.sectionIcon}>🏥</span>
                        Medical Information (Optional)
                    </h2>
                    <div className={styles.grid}>
                        <div className={styles.fieldFull}>
                            <label className={styles.label}>Medical History</label>
                            <textarea
                                name="medicalHistory"
                                className={styles.textarea}
                                placeholder="Any relevant medical history (e.g., diabetes, hypertension)"
                                value={formData.medicalHistory}
                                onChange={handleChange}
                                rows={3}
                            />
                        </div>
                        <div className={styles.fieldFull}>
                            <label className={styles.label}>Allergies</label>
                            <input
                                type="text"
                                name="allergies"
                                className={styles.input}
                                placeholder="Comma-separated (e.g., Penicillin, Aspirin)"
                                value={formData.allergies}
                                onChange={handleChange}
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
                        {isSubmitting ? 'Adding...' : 'Add Patient'}
                    </button>
                </div>
            </form>
        </div>
    );
}
