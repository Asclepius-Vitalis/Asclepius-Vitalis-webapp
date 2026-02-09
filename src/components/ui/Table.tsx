import React from 'react';
import styles from './Table.module.css';

interface Column<T> {
    key: string;
    header: string;
    render?: (item: T) => React.ReactNode;
    width?: string;
}

interface TableProps<T> {
    columns: Column<T>[];
    data: T[];
    keyExtractor: (item: T) => string;
    emptyMessage?: string;
    onRowClick?: (item: T) => void;
    className?: string;
}

export function Table<T>({
    columns,
    data,
    keyExtractor,
    emptyMessage = 'No data available',
    onRowClick,
    className = '',
}: TableProps<T>) {
    return (
        <div className={`${styles.wrapper} ${className}`}>
            <table className={styles.table}>
                <thead className={styles.thead}>
                    <tr>
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                className={styles.th}
                                style={col.width ? { width: col.width } : undefined}
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className={styles.tbody}>
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className={styles.empty}>
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        data.map((item) => (
                            <tr
                                key={keyExtractor(item)}
                                className={`${styles.tr} ${onRowClick ? styles.clickable : ''}`}
                                onClick={onRowClick ? () => onRowClick(item) : undefined}
                            >
                                {columns.map((col) => (
                                    <td key={col.key} className={styles.td}>
                                        {col.render
                                            ? col.render(item)
                                            : (item as Record<string, unknown>)[col.key] as React.ReactNode}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

// Mobile-friendly card view for tables
interface MobileCardProps<T> {
    columns: Column<T>[];
    data: T[];
    keyExtractor: (item: T) => string;
    emptyMessage?: string;
    onCardClick?: (item: T) => void;
    className?: string;
}

export function MobileCards<T>({
    columns,
    data,
    keyExtractor,
    emptyMessage = 'No data available',
    onCardClick,
    className = '',
}: MobileCardProps<T>) {
    if (data.length === 0) {
        return <div className={styles.empty}>{emptyMessage}</div>;
    }

    return (
        <div className={`${styles.cardsContainer} ${className}`}>
            {data.map((item) => (
                <div
                    key={keyExtractor(item)}
                    className={`${styles.card} ${onCardClick ? styles.clickable : ''}`}
                    onClick={onCardClick ? () => onCardClick(item) : undefined}
                >
                    {columns.map((col) => (
                        <div key={col.key} className={styles.cardRow}>
                            <span className={styles.cardLabel}>{col.header}</span>
                            <span className={styles.cardValue}>
                                {col.render
                                    ? col.render(item)
                                    : (item as Record<string, unknown>)[col.key] as React.ReactNode}
                            </span>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}
