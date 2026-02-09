'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Doctor } from '@/types';
import { doctorStorage } from './storage';

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    doctor: Doctor | null;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    signup: (doctorData: Omit<Doctor, 'id' | 'createdAt'>) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    updateDoctor: (updates: Partial<Doctor>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

interface AuthProviderProps {
    children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [doctor, setDoctor] = useState<Doctor | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing session on mount
    useEffect(() => {
        const storedDoctor = doctorStorage.getCurrentDoctor();
        if (storedDoctor) {
            // Verify doctor still exists in storage
            const existingDoctor = doctorStorage.getById(storedDoctor.id);
            if (existingDoctor) {
                setDoctor(existingDoctor);
            } else {
                doctorStorage.setCurrentDoctor(null);
            }
        }
        setIsLoading(false);
    }, []);

    const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        const existingDoctor = doctorStorage.getByEmail(email);

        if (!existingDoctor) {
            return { success: false, error: 'No account found with this email' };
        }

        if (existingDoctor.password !== password) {
            return { success: false, error: 'Invalid password' };
        }

        doctorStorage.setCurrentDoctor(existingDoctor);
        setDoctor(existingDoctor);
        return { success: true };
    }, []);

    const signup = useCallback(async (doctorData: Omit<Doctor, 'id' | 'createdAt'>): Promise<{ success: boolean; error?: string }> => {
        // Check if email already exists
        const existingDoctor = doctorStorage.getByEmail(doctorData.email);
        if (existingDoctor) {
            return { success: false, error: 'An account with this email already exists' };
        }

        // Create new doctor
        const newDoctor = doctorStorage.create(doctorData);
        doctorStorage.setCurrentDoctor(newDoctor);
        setDoctor(newDoctor);
        return { success: true };
    }, []);

    const logout = useCallback(() => {
        doctorStorage.setCurrentDoctor(null);
        setDoctor(null);
        // Use window.location for reliable redirect in client context
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
    }, []);

    const updateDoctor = useCallback((updates: Partial<Doctor>) => {
        if (!doctor) return;

        const updatedDoctor = doctorStorage.update(doctor.id, updates);
        if (updatedDoctor) {
            doctorStorage.setCurrentDoctor(updatedDoctor);
            setDoctor(updatedDoctor);
        }
    }, [doctor]);

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated: !!doctor,
                isLoading,
                doctor,
                login,
                signup,
                logout,
                updateDoctor,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
