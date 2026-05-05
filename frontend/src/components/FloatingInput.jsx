import { useState } from 'react';
import styles from './FloatingInput.module.scss';

const ALWAYS_FLOAT_TYPES = ['datetime-local', 'date', 'time', 'month', 'week'];

const FloatingInput = ({ id, name, label, placeholder = '', type = 'text', onChange, ...props }) => {
    const [focused, setFocused] = useState(false);
    const [hasValue, setHasValue] = useState(false);
    const floating = focused || hasValue || ALWAYS_FLOAT_TYPES.includes(type);

    return (
        <div className={styles.field}>
            <label htmlFor={id} className={`${styles.label} ${floating ? styles.floating : ''}`}>
                {label}
            </label>
            <input
                id={id}
                name={name}
                type={type}
                placeholder={focused ? placeholder : ''}
                className={styles.input}
                onFocus={() => setFocused(true)}
                onBlur={(e) => {
                    setFocused(false);
                    setHasValue(!!e.target.value);
                }}
                onChange={(e) => {
                    setHasValue(!!e.target.value);
                    onChange?.(e);
                }}
                {...props}
            />
        </div>
    );
};

const FloatingTextarea = ({ id, name, label, placeholder = '', rows = 4, onChange, ...props }) => {
    const [focused, setFocused] = useState(false);
    const [hasValue, setHasValue] = useState(false);
    const floating = focused || hasValue;

    return (
        <div className={styles.field}>
            <label htmlFor={id} className={`${styles.label} ${floating ? styles.floating : ''}`}>
                {label}
            </label>
            <textarea
                id={id}
                name={name}
                rows={rows}
                placeholder={focused ? placeholder : ''}
                className={styles.textarea}
                onFocus={() => setFocused(true)}
                onBlur={(e) => {
                    setFocused(false);
                    setHasValue(!!e.target.value);
                }}
                onChange={(e) => {
                    setHasValue(!!e.target.value);
                    onChange?.(e);
                }}
                {...props}
            />
        </div>
    );
};

const FloatingSelect = ({ id, name, label, onChange, children, ...props }) => (
    <div className={styles.field}>
        <label htmlFor={id} className={`${styles.label} ${styles.floating}`}>
            {label}
        </label>
        <select id={id} name={name} className={styles.select} onChange={onChange} {...props}>
            {children}
        </select>
    </div>
);

export { FloatingInput, FloatingTextarea, FloatingSelect };
