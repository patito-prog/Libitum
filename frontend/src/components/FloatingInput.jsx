import { useState, useRef, useEffect } from 'react';
import styles from './FloatingInput.module.scss';

const ALWAYS_FLOAT_TYPES = ['datetime-local', 'date', 'time', 'month', 'week'];

const FloatingInput = ({ id, name, label, placeholder = '', type = 'text', onChange, ...props }) => {
    const [focused, setFocused] = useState(false);
    const [hasValue, setHasValue] = useState(!!(props.defaultValue || props.value));
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

const FloatingMultiSelect = ({ id, name, label, onChange, options = [] }) => {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState([]);
    const ref = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggle = (optId) => {
        const next = selected.includes(optId)
            ? selected.filter(x => x !== optId)
            : [...selected, optId];
        setSelected(next);
        onChange?.({ target: { name, value: next } });
    };

    const selectedNames = options.filter(o => selected.includes(o.id)).map(o => o.name);

    return (
        <div className={`${styles.field} ${styles.multiField}`} ref={ref}>
            <label htmlFor={id} className={`${styles.label} ${styles.floating}`}>{label}</label>
            <div className={styles.multiTrigger} onClick={() => setOpen(o => !o)}>
                {selectedNames.length === 0
                    ? <span className={styles.multiPlaceholder}>Elige categorías…</span>
                    : <span className={styles.multiChips}>
                        {selectedNames.map(n => (
                            <span key={n} className={styles.chip}>{n}</span>
                        ))}
                    </span>
                }
                <span className={`${styles.multiArrow} ${open ? styles.multiArrowOpen : ''}`}>
                    <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M80 40 L160 100 L80 160" fill="none" stroke="currentColor" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M160 40 L240 100 L160 160" fill="none" stroke="currentColor" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M240 40 L320 100 L240 160" fill="none" stroke="currentColor" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </span>
            </div>
            {open && (
                <div className={styles.multiDropdown}>
                    {options.map(opt => (
                        <label key={opt.id} className={styles.multiCheckItem}>
                            <input
                                type="checkbox"
                                checked={selected.includes(opt.id)}
                                onChange={() => toggle(opt.id)}
                            />
                            {opt.name}
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
};

export { FloatingInput, FloatingTextarea, FloatingSelect, FloatingMultiSelect };
