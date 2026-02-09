// Doctor Types
export type Speciality = 'Cardiologist' | 'Oncologist' | 'General Physician' | 'Pulmonologist';

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface TimeSlot {
  day: DayOfWeek;
  startTime: string; // HH:MM format
  endTime: string;
}

export interface WhatsAppTemplates {
  followUpReminder?: string;
  appointmentReminder?: string;
  labTestReminder?: string;
}

export interface Doctor {
  id: string;
  email: string;
  password: string;
  name: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  speciality: Speciality;
  govtIdType: string;
  govtIdNumber: string;
  medicalLicenseNumber: string;
  walkInAvailability: TimeSlot[];
  appointmentAvailability: TimeSlot[];
  appointmentDuration: number; // in minutes
  whatsAppTemplates?: WhatsAppTemplates;
  createdAt: string;
}

// Patient Types
export type Gender = 'Male' | 'Female' | 'Other';

export interface Patient {
  id: string;
  name: string;
  phone: string;
  email?: string;
  dateOfBirth: string;
  gender: Gender;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  govtIdType?: string;
  govtIdNumber?: string;
  medicalHistory?: string;
  allergies?: string[];
  createdBy?: string; // doctor id - null if self-registered
  createdAt: string;
}

// Appointment Types
export type AppointmentType = 'scheduled' | 'walkin';
export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'no-show';

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  type: AppointmentType;
  date: string;
  time: string;
  status: AppointmentStatus;
  reasonForVisit?: string;
  remarksForReception?: string;
  createdAt: string;
}

// Consultation Types
export interface Vitals {
  bloodPressure?: string;
  pulse?: number;
  temperature?: number;
  weight?: number;
  height?: number;
  spo2?: number;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export type LabTestStatus = 'ordered' | 'completed';

export interface LabTest {
  name: string;
  status: LabTestStatus;
  results?: string;
  orderedAt: string;
  completedAt?: string;
}

export interface Consultation {
  id: string;
  appointmentId?: string;
  patientId: string;
  doctorId: string;
  date: string;
  placeOfConsultation: string;
  symptoms: string[];
  vitals: Vitals;
  examinations: string;
  diagnosis: string[];
  prescribedMedications: Medication[];
  labTests: LabTest[];
  advice: string;
  followUpDate?: string;
  followUpNotificationSent: boolean;
  createdAt: string;
}

// Auth Types
export interface AuthState {
  isAuthenticated: boolean;
  doctor: Doctor | null;
}
