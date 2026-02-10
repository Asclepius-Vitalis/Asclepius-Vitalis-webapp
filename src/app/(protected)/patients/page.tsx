'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { patientStorage, appointmentStorage } from '@/lib/storage';
import { formatDate, calculateAge, cn } from '@/lib/utils';
import type { Patient } from '@/types';
import styles from './patients.module.css';

type SortField = 'name' | 'createdAt' | 'dateOfBirth';
type SortOrder = 'asc' | 'desc';

export default function PatientsPage() {
    const { doctor } = useAuth();
    const router = useRouter();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [genderFilter, setGenderFilter] = useState<string>('all');
    const [sortField, setSortField] = useState<SortField>('createdAt');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

    useEffect(() => {
        if (doctor) {
            const allPatients = patientStorage.getByDoctor(doctor.id);
            setPatients(allPatients);
        }
    }, [doctor]);

    const filteredPatients = useMemo(() => {
        let result = [...patients];

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.phone.includes(query) ||
                p.email?.toLowerCase().includes(query)
            );
        }

        // Gender filter
        if (genderFilter !== 'all') {
            result = result.filter(p => p.gender === genderFilter);
        }

        // Sort
        result.sort((a, b) => {
            let comparison = 0;
            switch (sortField) {
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
                case 'createdAt':
                    comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                    break;
                case 'dateOfBirth':
                    comparison = new Date(a.dateOfBirth).getTime() - new Date(b.dateOfBirth).getTime();
                    break;
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return result;
    }, [patients, searchQuery, genderFilter, sortField, sortOrder]);

    const getLastVisit = (patientId: string): string => {
        if (!doctor) return 'No visits';
        const appointments = appointmentStorage.getByPatient(patientId)
            .filter(a => a.doctorId === doctor.id && a.status === 'completed')
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return appointments.length > 0 ? formatDate(appointments[0].date) : 'No visits';
    };

    const toggleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <h1 className={styles.title}>Patients</h1>
                    <span className={styles.count}>{patients.length} total</span>
                </div>
                <button
                    className={styles.addButton}
                    onClick={() => router.push('/patients/new')}
                >
                    <span className={styles.addIcon}>+</span>
                    Add Patient
                </button>
            </div>

            <div className={styles.filters}>
                <div className={styles.searchWrapper}>
                    <span className={styles.searchIcon}>🔍</span>
                    <input
                        type="text"
                        className={styles.searchInput}
                        placeholder="Search by name, phone, or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button
                            className={styles.clearSearch}
                            onClick={() => setSearchQuery('')}
                        >
                            ×
                        </button>
                    )}
                </div>

                <select
                    className={styles.filterSelect}
                    value={genderFilter}
                    onChange={(e) => setGenderFilter(e.target.value)}
                >
                    <option value="all">All Genders</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                </select>
            </div>

            {filteredPatients.length === 0 ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>👥</div>
                    <h3>{patients.length === 0 ? 'No patients yet' : 'No patients found'}</h3>
                    <p>
                        {patients.length === 0
                            ? 'Add your first patient to get started.'
                            : 'Try adjusting your search or filters.'}
                    </p>
                    {patients.length === 0 && (
                        <button
                            className={styles.addButton}
                            onClick={() => router.push('/patients/new')}
                        >
                            <span className={styles.addIcon}>+</span>
                            Add Patient
                        </button>
                    )}
                </div>
            ) : (
                <>
                    {/* Desktop Table */}
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th
                                        className={cn(styles.sortable, sortField === 'name' && styles.sorted)}
                                        onClick={() => toggleSort('name')}
                                    >
                                        Name {sortField === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th>Phone</th>
                                    <th>Gender</th>
                                    <th
                                        className={cn(styles.sortable, sortField === 'dateOfBirth' && styles.sorted)}
                                        onClick={() => toggleSort('dateOfBirth')}
                                    >
                                        Age {sortField === 'dateOfBirth' && (sortOrder === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th>Last Visit</th>
                                    <th
                                        className={cn(styles.sortable, sortField === 'createdAt' && styles.sorted)}
                                        onClick={() => toggleSort('createdAt')}
                                    >
                                        Added {sortField === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPatients.map(patient => (
                                    <tr
                                        key={patient.id}
                                        className={styles.tableRow}
                                        onClick={() => router.push(`/patients/${patient.id}`)}
                                    >
                                        <td>
                                            <div className={styles.patientName}>
                                                <div className={styles.avatar}>
                                                    {patient.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className={styles.name}>{patient.name}</div>
                                                    {patient.email && (
                                                        <div className={styles.email}>{patient.email}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td>{patient.phone}</td>
                                        <td>
                                            <span className={cn(styles.genderBadge, styles[`gender${patient.gender}`])}>
                                                {patient.gender}
                                            </span>
                                        </td>
                                        <td>{calculateAge(patient.dateOfBirth)} yrs</td>
                                        <td>{getLastVisit(patient.id)}</td>
                                        <td>{formatDate(patient.createdAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className={styles.mobileCards}>
                        {filteredPatients.map(patient => (
                            <div
                                key={patient.id}
                                className={styles.patientCard}
                                onClick={() => router.push(`/patients/${patient.id}`)}
                            >
                                <div className={styles.cardHeader}>
                                    <div className={styles.avatar}>
                                        {patient.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className={styles.cardInfo}>
                                        <h3 className={styles.name}>{patient.name}</h3>
                                        <p className={styles.cardPhone}>{patient.phone}</p>
                                    </div>
                                    <span className={cn(styles.genderBadge, styles[`gender${patient.gender}`])}>
                                        {patient.gender}
                                    </span>
                                </div>
                                <div className={styles.cardMeta}>
                                    <span>Age: {calculateAge(patient.dateOfBirth)}</span>
                                    <span>Last Visit: {getLastVisit(patient.id)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
