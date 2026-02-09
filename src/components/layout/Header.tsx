'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import styles from './Header.module.css';

interface HeaderProps {
    onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
    const { doctor, logout } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className={styles.header}>
            <div className={styles.left}>
                <button
                    type="button"
                    className={styles.menuButton}
                    onClick={onMenuClick}
                    aria-label="Toggle menu"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </button>
            </div>

            <div className={styles.right}>
                <div className={styles.userMenu} ref={dropdownRef}>
                    <button
                        type="button"
                        className={styles.userButton}
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                        <div className={styles.avatar}>
                            {doctor?.name?.charAt(0).toUpperCase() || 'D'}
                        </div>
                        <div className={styles.userInfo}>
                            <span className={styles.userName}>{doctor?.name || 'Doctor'}</span>
                            <span className={styles.userPhone}>{doctor?.phone || ''}</span>
                        </div>
                        <svg
                            className={`${styles.chevron} ${isDropdownOpen ? styles.open : ''}`}
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                        >
                            <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    </button>

                    {isDropdownOpen && (
                        <div className={styles.dropdown}>
                            <Link
                                href="/profile"
                                className={styles.dropdownItem}
                                onClick={() => setIsDropdownOpen(false)}
                            >
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <circle cx="10" cy="6" r="4" stroke="currentColor" strokeWidth="1.5" />
                                    <path d="M2.5 17.5C2.5 14.7386 5.73858 12.5 10 12.5C14.2614 12.5 17.5 14.7386 17.5 17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                                My Profile
                            </Link>
                            <Link
                                href="/profile"
                                className={styles.dropdownItem}
                                onClick={() => setIsDropdownOpen(false)}
                            >
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path d="M10 2.5V5M10 15V17.5M17.5 10H15M5 10H2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
                                    <path d="M3.75 3.75L5.5 5.5M14.5 14.5L16.25 16.25M16.25 3.75L14.5 5.5M5.5 14.5L3.75 16.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                                My Availability
                            </Link>
                            <div className={styles.dropdownDivider} />
                            <button
                                type="button"
                                className={`${styles.dropdownItem} ${styles.logout}`}
                                onClick={() => {
                                    logout();
                                    setIsDropdownOpen(false);
                                }}
                            >
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path d="M7.5 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V4.16667C2.5 3.72464 2.67559 3.30072 2.98816 2.98816C3.30072 2.67559 3.72464 2.5 4.16667 2.5H7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    <path d="M13.333 14.1667L17.4997 10L13.333 5.83334" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M17.5 10H7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                                Log Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
