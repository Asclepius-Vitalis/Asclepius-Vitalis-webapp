import React from 'react';
import styles from './Input.module.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    fullWidth?: boolean;
}

export function Input({
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    fullWidth = false,
    className = '',
    id,
    ...props
}: InputProps) {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <div className={`${styles.wrapper} ${fullWidth ? styles.fullWidth : ''}`}>
            {label && (
                <label htmlFor={inputId} className={styles.label}>
                    {label}
                    {props.required && <span className={styles.required}>*</span>}
                </label>
            )}
            <div className={`${styles.inputContainer} ${error ? styles.hasError : ''}`}>
                {leftIcon && <span className={styles.leftIcon}>{leftIcon}</span>}
                <input
                    id={inputId}
                    className={`${styles.input} ${leftIcon ? styles.hasLeftIcon : ''} ${rightIcon ? styles.hasRightIcon : ''} ${className}`}
                    {...props}
                />
                {rightIcon && <span className={styles.rightIcon}>{rightIcon}</span>}
            </div>
            {error && <span className={styles.error}>{error}</span>}
            {helperText && !error && <span className={styles.helper}>{helperText}</span>}
        </div>
    );
}
