# Asclepius-Vitalis Frontend MVP - Implementation Plan

## Overview

This document outlines the implementation plan for the **Frontend MVP** of Asclepius-Vitalis - a healthcare management system. This MVP focuses on **doctor-centric workflows** without backend/database integration, using **browser localStorage** for data persistence.

> [!IMPORTANT]
> This is a frontend-only MVP for visualization and requirement refinement. All data is stored in browser localStorage and will not persist across different browsers or devices.

---

## Technology Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 14+** | React framework with App Router |
| **TypeScript** | Type safety |
| **Vanilla CSS** | Styling (no TailwindCSS) |
| **localStorage** | Data persistence |
| **WhatsApp Web API** | Follow-up notifications (via `wa.me` links) |
| **Responsive Design** | Mobile-first, optimized for laptops and mobile devices |

---

## MVP Scope Summary

| Feature | Description |
|---------|-------------|
| Doctor Sign-up/Sign-in | Registration and authentication (localStorage-based) |
| Doctor Profile | View and manage doctor's own profile |
| Patient Management | Add and manage patient records |
| Appointment Booking | Create appointments on behalf of patients |
| Walk-in Consultations | Record walk-in patient visits |
| Consultation Details | Add detailed consultation data |
| WhatsApp Notifications | Send follow-up reminders via WhatsApp |

---

## Data Models

### Doctor
```typescript
interface Doctor {
  id: string;
  email: string;
  password: string; // hashed in real implementation, plain for MVP
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
  whatsAppTemplates?: WhatsAppTemplates; // optional, use defaults if not set
  createdAt: string;
}

type Speciality = 'Cardiologist' | 'Oncologist' | 'General Physician' | 'Pulmonologist';

interface TimeSlot {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string; // HH:MM format
  endTime: string;
}

interface WhatsAppTemplates {
  followUpReminder?: string;      // Custom follow-up reminder message
  appointmentReminder?: string;   // Custom appointment reminder message
  labTestReminder?: string;       // Custom lab test reminder message
}
```

### Patient
```typescript
interface Patient {
  id: string;
  name: string;
  phone: string;
  email?: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
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
  createdBy?: string; // doctor id - null/empty if patient self-registered
  createdAt: string;
}
```

### Appointment
```typescript
interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  type: 'scheduled' | 'walkin';
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  reasonForVisit?: string;
  remarksForReception?: string; // e.g., "check temperature", "wheelchair assistance", etc.
  createdAt: string;
}
```

### Consultation
```typescript
interface Consultation {
  id: string;
  appointmentId?: string; // optional for walk-ins
  patientId: string;
  doctorId: string;
  date: string;
  placeOfConsultation: string;
  
  // Clinical Data
  symptoms: string[];
  vitals: {
    bloodPressure?: string;
    pulse?: number;
    temperature?: number;
    weight?: number;
    height?: number;
    spo2?: number;
  };
  examinations: string;
  diagnosis: string[];
  
  // Treatment
  prescribedMedications: Medication[];
  labTests: LabTest[];
  advice: string;
  
  // Follow-up
  followUpDate?: string;
  followUpNotificationSent: boolean;
  
  createdAt: string;
}

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

interface LabTest {
  name: string;
  status: 'ordered' | 'completed';
  results?: string;
  orderedAt: string;
  completedAt?: string;
}
```

---

## Folder Structure

```
Asclepius-Vitalis-webapp/
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Root layout with providers
│   │   ├── page.tsx                      # Landing page
│   │   ├── globals.css                   # Global styles
│   │   │
│   │   ├── (auth)/                       # Auth routes (no auth required)
│   │   │   ├── login/
│   │   │   │   └── page.tsx              # Doctor login
│   │   │   └── signup/
│   │   │       └── page.tsx              # Doctor signup
│   │   │
│   │   └── (protected)/                  # Protected routes (auth required)
│   │       ├── layout.tsx                # Dashboard layout with sidebar
│   │       ├── dashboard/
│   │       │   └── page.tsx              # Doctor dashboard
│   │       ├── profile/
│   │       │   └── page.tsx              # Doctor profile view/edit
│   │       ├── patients/
│   │       │   ├── page.tsx              # Patient list
│   │       │   ├── new/
│   │       │   │   └── page.tsx          # Add new patient
│   │       │   └── [id]/
│   │       │       └── page.tsx          # Patient details
│   │       ├── appointments/
│   │       │   ├── page.tsx              # Appointments list/calendar
│   │       │   └── new/
│   │       │       └── page.tsx          # Book new appointment
│   │       └── consultations/
│   │           ├── page.tsx              # Consultations list
│   │           ├── new/
│   │           │   └── page.tsx          # New consultation (walk-in)
│   │           └── [id]/
│   │               ├── page.tsx          # Consultation details
│   │               └── edit/
│   │                   └── page.tsx      # Edit consultation
│   │
│   ├── components/
│   │   ├── ui/                           # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Table.tsx
│   │   │   └── Toast.tsx
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   ├── forms/
│   │   │   ├── DoctorSignupForm.tsx
│   │   │   ├── PatientForm.tsx
│   │   │   ├── AppointmentForm.tsx
│   │   │   └── ConsultationForm.tsx
│   │   └── features/
│   │       ├── PatientCard.tsx
│   │       ├── AppointmentCard.tsx
│   │       ├── ConsultationCard.tsx
│   │       └── WhatsAppButton.tsx
│   │
│   ├── lib/
│   │   ├── storage.ts                    # localStorage utilities
│   │   ├── auth.ts                       # Auth context and hooks
│   │   └── utils.ts                      # Helper functions
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── usePatients.ts
│   │   ├── useAppointments.ts
│   │   └── useConsultations.ts
│   │
│   └── types/
│       └── index.ts                      # TypeScript interfaces
│
├── public/
│   └── icons/                            # App icons
│
├── package.json
├── tsconfig.json
├── next.config.js
└── README.md
```

---

## Implementation Phases

### Phase 1: Project Setup & Core UI Components ✅ COMPLETE
**Completed: February 10, 2026**

#### Tasks:
- [x] Initialize Next.js project with TypeScript (Next.js 16.1.6 with Turbopack)
- [x] Set up folder structure
- [x] Create global CSS with design system (colors, typography, spacing)
- [x] Build reusable UI components (Button, Input, Select, Card, Modal, Table, Badge, Toast)
- [x] Create layout components (Sidebar, Header)
- [x] Define TypeScript interfaces for all data models

#### Files created:
| File | Description |
|------|-------------|
| `src/types/index.ts` | All TypeScript interfaces |
| `src/app/globals.css` | Global styles with CSS variables |
| `src/components/ui/*` | 8 UI components with CSS modules |
| `src/components/layout/*` | Sidebar, Header components |

---

### Phase 2: Authentication System ✅ COMPLETE
**Completed: February 10, 2026**

#### Tasks:
- [x] Create localStorage utilities for data persistence
- [x] Implement auth context with React Context API
- [x] Build doctor signup page with full form (3-step multi-step form)
- [x] Build doctor login page
- [x] Create protected route wrapper
- [x] Add logout functionality

#### Doctor Signup Fields:
- Full Name
- Email
- Password
- Phone Number
- Address (Street, City, State, Pincode)
- Speciality (dropdown: Cardiologist, Oncologist, General Physician, Pulmonologist)
- Government ID Type & Number
- Medical License Number
- Walk-in Availability (day/time slots)
- Appointment Availability (day/time slots)
- Default Appointment Duration
- WhatsApp Message Templates (optional - custom messages for reminders)

#### Files created:
| File | Description |
|------|-------------|
| `src/lib/storage.ts` | localStorage CRUD utilities for all entities |
| `src/lib/auth.tsx` | Auth context and provider |
| `src/lib/utils.ts` | Helper functions (date formatting, WhatsApp URLs) |
| `src/app/(auth)/signup/page.tsx` | Multi-step signup page |
| `src/app/(auth)/login/page.tsx` | Login page |

---

### Phase 3: Doctor Dashboard & Profile ✅ COMPLETE
**Completed: February 10, 2026**

#### Tasks:
- [x] Create protected layout with sidebar navigation
- [x] Build doctor dashboard with summary cards
- [x] Create doctor profile view page
- [x] Create landing page with hero section
- [ ] Add edit profile functionality (deferred)

#### Dashboard Features Implemented:
- Welcome banner with doctor name
- Stats cards: Today's Queue, Total Patients, Pending Follow-ups
- Tabbed appointment view (Queue/Finished/Cancelled)
- Date navigation with search
- Appointment table

#### Files created:
| File | Description |
|------|-------------|
| `src/app/(protected)/layout.tsx` | Protected layout with auth check |
| `src/app/(protected)/dashboard/page.tsx` | Dashboard with stats and queue |
| `src/app/(protected)/profile/page.tsx` | Doctor profile view |
| `src/app/page.tsx` | Landing page with hero/features |
| `src/app/providers.tsx` | Client providers wrapper |

---

### Phase 4: Patient Management
**Estimated effort: 1 hour**

#### Tasks:
- [ ] Create usePatients hook for patient CRUD operations
- [ ] Build patient list page with search/filter
- [ ] Create add new patient form
- [ ] Build patient details page

#### Files to create:
| File | Description |
|------|-------------|
| `src/hooks/usePatients.ts` | Patient data hook |
| `src/components/forms/PatientForm.tsx` | Patient form component |
| `src/components/features/PatientCard.tsx` | Patient card component |
| `src/app/(protected)/patients/page.tsx` | Patient list |
| `src/app/(protected)/patients/new/page.tsx` | Add patient |
| `src/app/(protected)/patients/[id]/page.tsx` | Patient details |

---

### Phase 5: Appointment Management
**Estimated effort: 1-2 hours**

#### Tasks:
- [ ] Create useAppointments hook
- [ ] Build appointment list/calendar view
- [ ] Create book appointment form (on behalf of patient)
- [ ] Add appointment status management

#### Appointment Booking Flow:
1. Doctor selects or creates patient
2. Selects date from available slots
3. Selects time from available slots (Morning/Afternoon/Evening/Night time periods)
4. Adds reason for visit (optional)
5. Adds remarks for reception (optional) - e.g., "check temperature", "wheelchair assistance"
6. Confirms booking

#### Files to create:
| File | Description |
|------|-------------|
| `src/hooks/useAppointments.ts` | Appointment data hook |
| `src/components/forms/AppointmentForm.tsx` | Appointment form |
| `src/components/features/AppointmentCard.tsx` | Appointment card |
| `src/app/(protected)/appointments/page.tsx` | Appointments list |
| `src/app/(protected)/appointments/new/page.tsx` | Book appointment |

---

### Phase 6: Consultation Management
**Estimated effort: 2 hours**

#### Tasks:
- [ ] Create useConsultations hook
- [ ] Build consultation list page
- [ ] Create new walk-in consultation flow
- [ ] Build consultation details form with all clinical data
- [ ] Add edit consultation functionality
- [ ] Link consultations to appointments

#### Consultation Form Sections:
1. **Patient Info** (auto-filled if from appointment)
2. **Vitals** (BP, Pulse, Temp, Weight, Height, SpO2)
3. **Symptoms** (multi-select/tags)
4. **Examinations** (text area)
5. **Diagnosis** (multi-select/tags)
6. **Medications** (dynamic list with dosage, frequency, duration)
7. **Lab Tests** (dynamic list)
8. **Advice** (text area)
9. **Follow-up Date** (date picker)

#### Files to create:
| File | Description |
|------|-------------|
| `src/hooks/useConsultations.ts` | Consultation data hook |
| `src/components/forms/ConsultationForm.tsx` | Consultation form |
| `src/components/features/ConsultationCard.tsx` | Consultation card |
| `src/app/(protected)/consultations/page.tsx` | Consultations list |
| `src/app/(protected)/consultations/new/page.tsx` | New walk-in |
| `src/app/(protected)/consultations/[id]/page.tsx` | Consultation details |
| `src/app/(protected)/consultations/[id]/edit/page.tsx` | Edit consultation |

---

### Phase 7: WhatsApp Integration
**Estimated effort: 30 minutes**

#### Tasks:
- [ ] Create WhatsApp button component
- [ ] Build follow-up notification feature
- [ ] Add quick message templates

#### Implementation:
Using `wa.me` URLs to open WhatsApp with pre-filled messages:
```
https://wa.me/{phoneNumber}?text={encodedMessage}
```

#### Message Templates:
- Follow-up reminder
- Appointment reminder
- Lab test reminder

#### Files to create:
| File | Description |
|------|-------------|
| `src/components/features/WhatsAppButton.tsx` | WhatsApp integration component |

---

### Phase 8: Landing Page & Polish
**Estimated effort: 1 hour**

#### Tasks:
- [ ] Create attractive landing page
- [ ] Add loading states and error handling
- [ ] Implement toast notifications
- [ ] Implement responsive design for all pages
- [ ] Final UI polish and animations

#### Responsive Design Requirements:
- **Mobile-first approach**: Design for mobile (320px+) first, then enhance for larger screens
- **Breakpoints**:
  - Mobile: 320px - 768px
  - Tablet: 768px - 1024px  
  - Desktop/Laptop: 1024px+
- **Key responsive behaviors**:
  - Sidebar collapses to hamburger menu on mobile
  - Tables become card-based layouts on mobile
  - Forms stack vertically on small screens
  - Touch-friendly buttons (min 44px touch targets)

#### Files to create/update:
| File | Description |
|------|-------------|
| `src/app/page.tsx` | Landing page |
| `src/components/ui/Toast.tsx` | Toast notifications |

---

## Verification Plan

### Manual Testing Checklist

#### Authentication Flow ✅ Verified
- [x] Doctor can sign up with all required fields
- [x] Doctor can log in with email/password
- [x] Doctor is redirected to dashboard after login
- [x] Protected routes redirect to login if not authenticated
- [x] Doctor can log out

#### Profile Management ✅ Verified
- [x] Doctor can view their profile
- [x] Profile displays all signup information correctly

#### Patient Management (Pending)
- [ ] Doctor can add a new patient
- [ ] Patient list displays all patients
- [ ] Doctor can view patient details
- [ ] Patient search works correctly

#### Appointment Management (Pending)
- [ ] Doctor can book appointment for a patient
- [ ] Appointment appears in appointment list
- [ ] Appointment status can be updated

#### Consultation Management (Pending)
- [ ] Doctor can create walk-in consultation
- [ ] Doctor can add consultation for scheduled appointment
- [ ] All consultation fields save correctly
- [ ] Doctor can edit existing consultation
- [ ] Medications and lab tests can be added/removed dynamically

#### WhatsApp Integration (Pending)
- [ ] WhatsApp button opens WhatsApp with correct phone number
- [ ] Follow-up message is pre-filled correctly

#### Data Persistence (Pending)
- [ ] Data persists after page refresh
- [ ] Data persists after browser close/reopen

---

## Design Specifications

### UI Design Reference

The design draws inspiration from similar healthcare applications like **:

| Element | Design Pattern |
|---------|----------------|
| **Sidebar** | Dark/navy sidebar with icons + labels, collapsible |
| **Dashboard** | Welcome header with action buttons ("Add Appointment", "Start Walk-in") |
| **Queue View** | Tabbed interface (Queue/Finished/Cancelled) with date navigation |
| **Patient Table** | Clean table with search, date filter, patient ID, last visit |
| **Appointment Modal** | Slide-out/modal with time slot grid (Morning/Afternoon/Evening/Night) |
| **Patient Details** | Split view with sidebar (Visit Summary, Certificates, Records) and consultation history |
| **Header** | User dropdown with profile, settings, availability, logout |

### Color Palette
```css
:root {
  /* Primary - Purple accent (inspired by **) */
  --primary-50: #F5F3FF;
  --primary-100: #EDE9FE;
  --primary-500: #8B5CF6;
  --primary-600: #7C3AED;
  --primary-700: #6D28D9;
  
  /* Secondary - Orange accent for CTAs */
  --accent-500: #F97316;
  --accent-600: #EA580C;
  
  /* Header/Banner - Warm yellow/orange gradient */
  --banner-start: #FCD34D;
  --banner-end: #F59E0B;
  
  /* Neutral */
  --gray-50: #F9FAFB;
  --gray-100: #F3F4F6;
  --gray-200: #E5E7EB;
  --gray-500: #6B7280;
  --gray-700: #374151;
  --gray-900: #111827;
  
  /* Sidebar */
  --sidebar-bg: #1F2937;
  --sidebar-active: #8B5CF6;
  
  /* Semantic */
  --success: #10B981;
  --warning: #F59E0B;
  --error: #EF4444;
  --info: #3B82F6;
}
```

### Typography
- **Font Family**: Inter (Google Fonts)
- **Headings**: 600-700 weight
- **Body**: 400-500 weight

### Spacing Scale
```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
```

---

## Review Status: ✅ APPROVED

> [!TIP]
> **User feedback incorporated on February 10, 2026:**

| Feedback Item | Resolution |
|---------------|------------|
| `createdBy` in Patient | Made optional - patients may self-register |
| Appointment remarks | Added `remarksForReception` field for reception tasks |
| Speciality options | Cardiologist, Oncologist, General Physician, Pulmonologist |
| WhatsApp templates | Doctor can customize during signup, defaults provided |
| UI Design | Reference ** for layout patterns |

---

## Default WhatsApp Templates

If doctor doesn't provide custom templates during signup, these defaults will be used:

```
// Follow-up Reminder
"Hi {patientName}, this is a reminder for your follow-up appointment with Dr. {doctorName} on {date}. Please confirm your availability. - {clinicName}"

// Appointment Reminder  
"Hi {patientName}, you have an appointment with Dr. {doctorName} tomorrow at {time}. Please arrive 10 minutes early. - {clinicName}"

// Lab Test Reminder
"Hi {patientName}, please remember to get your lab tests done as prescribed by Dr. {doctorName}. Tests: {testNames}. - {clinicName}"
```

---

## Implementation Progress

| Phase | Status | Completion Date |
|-------|--------|----------------|
| Phase 1: Project Setup | ✅ Complete | Feb 10, 2026 |
| Phase 2: Authentication | ✅ Complete | Feb 10, 2026 |
| Phase 3: Dashboard & Profile | ✅ Complete | Feb 10, 2026 |
| Phase 4: Patient Management | 🔲 Pending | - |
| Phase 5: Appointment Management | 🔲 Pending | - |
| Phase 6: Consultation Management | 🔲 Pending | - |
| Phase 7: WhatsApp Integration | 🔲 Pending | - |
| Phase 8: Polish | 🔲 Pending | - |

## Next Steps

1. **Phase 4: Patient Management** - Build patient list, add patient form, patient details page
2. **Phase 5: Appointment Management** - Calendar view, booking flow
3. **Phase 6: Consultation Management** - Walk-in flow, prescription entry
4. **Phase 7: WhatsApp Integration** - Follow-up reminders
5. **Phase 8: Polish** - Loading states, error handling, responsive refinements

## Known Issues

| Issue | Severity | Notes |
|-------|----------|-------|
| Welcome message shows "Dr. Dr.!" | Minor | When doctor name already includes "Dr." prefix |

---

*Last Updated: February 10, 2026*
