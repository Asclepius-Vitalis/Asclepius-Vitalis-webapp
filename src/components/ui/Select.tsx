import React from 'react';
import styles from './Select.module.css';

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
    label?: string;
    error?: string;
    options: SelectOption[];
    placeholder?: string;
    fullWidth?: boolean;
}

export function Select({
    label,
    error,
    options,
    placeholder = 'Select an option',
    fullWidth = false,
    className = '',
    id,
    ...props
}: SelectProps) {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <div className={`${styles.wrapper} ${fullWidth ? styles.fullWidth : ''}`}>
            {label && (
                <label htmlFor={selectId} className={styles.label}>
                    {label}
                    {props.required && <span className={styles.required}>*</span>}
                </label>
            )}
            <div className={`${styles.selectContainer} ${error ? styles.hasError : ''}`}>
                <select
                    id={selectId}
                    className={`${styles.select} ${className}`}
                    {...props}
                >
                    <option value="" disabled>{placeholder}</option>
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <span className={styles.arrow}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </span>
            </div>
            {error && <span className={styles.error}>{error}</span>}
        </div>
    );
}
