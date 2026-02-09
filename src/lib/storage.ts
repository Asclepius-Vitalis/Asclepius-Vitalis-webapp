// Storage keys
const STORAGE_KEYS = {
    DOCTORS: 'asclepius_doctors',
    CURRENT_DOCTOR: 'asclepius_current_doctor',
    PATIENTS: 'asclepius_patients',
    APPOINTMENTS: 'asclepius_appointments',
    CONSULTATIONS: 'asclepius_consultations',
} as const;

// Generic storage utilities
function getItem<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;

    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch {
        console.error(`Error reading from localStorage key "${key}"`);
        return null;
    }
}

function setItem<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        console.error(`Error writing to localStorage key "${key}"`);
    }
}

function removeItem(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
}

// Generate unique IDs
export function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Doctor storage
import type { Doctor, Patient, Appointment, Consultation } from '@/types';

export const doctorStorage = {
    getAll: (): Doctor[] => getItem<Doctor[]>(STORAGE_KEYS.DOCTORS) || [],

    getById: (id: string): Doctor | undefined => {
        const doctors = doctorStorage.getAll();
        return doctors.find(d => d.id === id);
    },

    getByEmail: (email: string): Doctor | undefined => {
        const doctors = doctorStorage.getAll();
        return doctors.find(d => d.email.toLowerCase() === email.toLowerCase());
    },

    create: (doctor: Omit<Doctor, 'id' | 'createdAt'>): Doctor => {
        const doctors = doctorStorage.getAll();
        const newDoctor: Doctor = {
            ...doctor,
            id: generateId(),
            createdAt: new Date().toISOString(),
        };
        doctors.push(newDoctor);
        setItem(STORAGE_KEYS.DOCTORS, doctors);
        return newDoctor;
    },

    update: (id: string, updates: Partial<Doctor>): Doctor | null => {
        const doctors = doctorStorage.getAll();
        const index = doctors.findIndex(d => d.id === id);
        if (index === -1) return null;

        doctors[index] = { ...doctors[index], ...updates };
        setItem(STORAGE_KEYS.DOCTORS, doctors);
        return doctors[index];
    },

    getCurrentDoctor: (): Doctor | null => getItem<Doctor>(STORAGE_KEYS.CURRENT_DOCTOR),

    setCurrentDoctor: (doctor: Doctor | null): void => {
        if (doctor) {
            setItem(STORAGE_KEYS.CURRENT_DOCTOR, doctor);
        } else {
            removeItem(STORAGE_KEYS.CURRENT_DOCTOR);
        }
    },
};

// Patient storage
export const patientStorage = {
    getAll: (): Patient[] => getItem<Patient[]>(STORAGE_KEYS.PATIENTS) || [],

    getById: (id: string): Patient | undefined => {
        const patients = patientStorage.getAll();
        return patients.find(p => p.id === id);
    },

    getByPhone: (phone: string): Patient | undefined => {
        const patients = patientStorage.getAll();
        return patients.find(p => p.phone === phone);
    },

    getByDoctor: (doctorId: string): Patient[] => {
        const patients = patientStorage.getAll();
        return patients.filter(p => p.createdBy === doctorId);
    },

    create: (patient: Omit<Patient, 'id' | 'createdAt'>): Patient => {
        const patients = patientStorage.getAll();
        const newPatient: Patient = {
            ...patient,
            id: generateId(),
            createdAt: new Date().toISOString(),
        };
        patients.push(newPatient);
        setItem(STORAGE_KEYS.PATIENTS, patients);
        return newPatient;
    },

    update: (id: string, updates: Partial<Patient>): Patient | null => {
        const patients = patientStorage.getAll();
        const index = patients.findIndex(p => p.id === id);
        if (index === -1) return null;

        patients[index] = { ...patients[index], ...updates };
        setItem(STORAGE_KEYS.PATIENTS, patients);
        return patients[index];
    },

    search: (query: string): Patient[] => {
        const patients = patientStorage.getAll();
        const lowerQuery = query.toLowerCase();
        return patients.filter(p =>
            p.name.toLowerCase().includes(lowerQuery) ||
            p.phone.includes(query) ||
            p.email?.toLowerCase().includes(lowerQuery)
        );
    },
};

// Appointment storage
export const appointmentStorage = {
    getAll: (): Appointment[] => getItem<Appointment[]>(STORAGE_KEYS.APPOINTMENTS) || [],

    getById: (id: string): Appointment | undefined => {
        const appointments = appointmentStorage.getAll();
        return appointments.find(a => a.id === id);
    },

    getByDoctor: (doctorId: string): Appointment[] => {
        const appointments = appointmentStorage.getAll();
        return appointments.filter(a => a.doctorId === doctorId);
    },

    getByPatient: (patientId: string): Appointment[] => {
        const appointments = appointmentStorage.getAll();
        return appointments.filter(a => a.patientId === patientId);
    },

    getByDate: (doctorId: string, date: string): Appointment[] => {
        const appointments = appointmentStorage.getAll();
        return appointments.filter(a => a.doctorId === doctorId && a.date === date);
    },

    create: (appointment: Omit<Appointment, 'id' | 'createdAt'>): Appointment => {
        const appointments = appointmentStorage.getAll();
        const newAppointment: Appointment = {
            ...appointment,
            id: generateId(),
            createdAt: new Date().toISOString(),
        };
        appointments.push(newAppointment);
        setItem(STORAGE_KEYS.APPOINTMENTS, appointments);
        return newAppointment;
    },

    update: (id: string, updates: Partial<Appointment>): Appointment | null => {
        const appointments = appointmentStorage.getAll();
        const index = appointments.findIndex(a => a.id === id);
        if (index === -1) return null;

        appointments[index] = { ...appointments[index], ...updates };
        setItem(STORAGE_KEYS.APPOINTMENTS, appointments);
        return appointments[index];
    },
};

// Consultation storage
export const consultationStorage = {
    getAll: (): Consultation[] => getItem<Consultation[]>(STORAGE_KEYS.CONSULTATIONS) || [],

    getById: (id: string): Consultation | undefined => {
        const consultations = consultationStorage.getAll();
        return consultations.find(c => c.id === id);
    },

    getByDoctor: (doctorId: string): Consultation[] => {
        const consultations = consultationStorage.getAll();
        return consultations.filter(c => c.doctorId === doctorId);
    },

    getByPatient: (patientId: string): Consultation[] => {
        const consultations = consultationStorage.getAll();
        return consultations.filter(c => c.patientId === patientId);
    },

    getByAppointment: (appointmentId: string): Consultation | undefined => {
        const consultations = consultationStorage.getAll();
        return consultations.find(c => c.appointmentId === appointmentId);
    },

    getPendingFollowUps: (doctorId: string): Consultation[] => {
        const consultations = consultationStorage.getAll();
        const today = new Date().toISOString().split('T')[0];
        return consultations.filter(c =>
            c.doctorId === doctorId &&
            c.followUpDate &&
            c.followUpDate <= today &&
            !c.followUpNotificationSent
        );
    },

    create: (consultation: Omit<Consultation, 'id' | 'createdAt'>): Consultation => {
        const consultations = consultationStorage.getAll();
        const newConsultation: Consultation = {
            ...consultation,
            id: generateId(),
            createdAt: new Date().toISOString(),
        };
        consultations.push(newConsultation);
        setItem(STORAGE_KEYS.CONSULTATIONS, consultations);
        return newConsultation;
    },

    update: (id: string, updates: Partial<Consultation>): Consultation | null => {
        const consultations = consultationStorage.getAll();
        const index = consultations.findIndex(c => c.id === id);
        if (index === -1) return null;

        consultations[index] = { ...consultations[index], ...updates };
        setItem(STORAGE_KEYS.CONSULTATIONS, consultations);
        return consultations[index];
    },
};
