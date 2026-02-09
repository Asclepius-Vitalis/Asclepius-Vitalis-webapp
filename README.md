# Asclepius-Vitalis Web App

A Next.js frontend MVP for **Asclepius-Vitalis** - a healthcare management system focused on doctor-centric workflows.

> ⚠️ **MVP Notice**: This is a frontend-only MVP using browser localStorage for data persistence. No backend or database integration.

## ✨ Features

- **Doctor Authentication**: Sign-up and sign-in for doctors
- **Doctor Profile**: View and manage profile information
- **Patient Management**: Add and manage patient records
- **Appointment Booking**: Create appointments on behalf of patients
- **Walk-in Consultations**: Record walk-in patient visits
- **Consultation Details**: Add comprehensive clinical data (symptoms, vitals, diagnosis, medications, lab tests)
- **WhatsApp Integration**: Send follow-up reminders via WhatsApp

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 14+ | React framework with App Router |
| TypeScript | Type safety |
| Vanilla CSS | Styling |
| localStorage | Data persistence |
| Responsive Design | Mobile-first, laptop & mobile friendly |

## 📱 Responsive Design

The application is designed to work seamlessly on:
- **Mobile devices** (320px+)
- **Tablets** (768px+)
- **Laptops/Desktops** (1024px+)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/             # Authentication routes (login, signup)
│   └── (protected)/        # Protected routes (dashboard, patients, appointments, consultations)
├── components/
│   ├── ui/                 # Reusable UI components
│   ├── layout/             # Layout components (Sidebar, Header)
│   ├── forms/              # Form components
│   └── features/           # Feature-specific components
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities and context
└── types/                  # TypeScript interfaces
```

## 📋 Documentation

See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for detailed implementation specifications.

## 📄 License

Private - All rights reserved.
