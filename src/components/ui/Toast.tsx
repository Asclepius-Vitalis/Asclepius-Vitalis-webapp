'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import styles from './Toast.module.css';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

interface ToastProviderProps {
    children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className={styles.container}>
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`${styles.toast} ${styles[toast.type]}`}
                        onClick={() => removeToast(toast.id)}
                    >
                        <span className={styles.icon}>{getIcon(toast.type)}</span>
                        <span className={styles.message}>{toast.message}</span>
                        <button className={styles.close} aria-label="Dismiss">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

function getIcon(type: ToastType) {
    switch (type) {
        case 'success':
            return (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M16.667 5L7.5 14.167L3.333 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            );
        case 'error':
            return (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 6.667V10M10 13.333H10.008" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="2" />
                </svg>
            );
        case 'warning':
            return (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 7.5V10.833M10 14.167H10.008" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M8.575 3.217L1.517 15a1.667 1.667 0 001.425 2.5h14.116a1.667 1.667 0 001.425-2.5L11.425 3.217a1.667 1.667 0 00-2.85 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            );
        case 'info':
        default:
            return (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="2" />
                    <path d="M10 13.333V10M10 6.667H10.008" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
            );
    }
}
