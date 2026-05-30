import { useState } from 'react';
import styles from './PasswordInput.module.scss';

// Iconos ojo / ojo tachado (estilo Feather).
const EyeIcon = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const EyeOffIcon = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
);

/**
 * Campo de contraseña con botón de ojo para mostrar/ocultar lo escrito.
 * Acepta cualquier prop nativa del input (value, onChange, name, id, placeholder,
 * autoComplete...) y una className para encajar con el estilo del formulario.
 */
const PasswordInput = ({ className, ...props }) => {
    const [show, setShow] = useState(false);

    return (
        <div className={styles.wrap}>
            <input
                type={show ? 'text' : 'password'}
                className={`${className ?? ''} ${styles.input}`}
                {...props}
            />
            <button
                type="button"
                className={styles.toggle}
                onClick={() => setShow(s => !s)}
                aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                tabIndex={-1}
            >
                {show ? <EyeOffIcon /> : <EyeIcon />}
            </button>
        </div>
    );
};

export default PasswordInput;
