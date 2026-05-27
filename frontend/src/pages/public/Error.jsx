import { Link } from 'react-router-dom';

const Error = () => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 'calc(100dvh - 64px)',
            padding: '2rem 1rem',
            textAlign: 'center',
            gap: '1.25rem',
        }}>
            <span style={{ fontSize: 'clamp(4rem, 15vw, 7rem)', lineHeight: 1, userSelect: 'none' }}>✦</span>
            <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.8rem, 5vw, 2.6rem)',
                fontWeight: 900,
                color: 'var(--text-primary)',
                letterSpacing: '-0.03em',
                margin: 0,
            }}>
                Página no encontrada
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', margin: 0, maxWidth: '360px', lineHeight: 1.6 }}>
                La dirección que buscas no existe o ha sido movida.
            </p>
            <Link
                to="/"
                style={{
                    marginTop: '0.5rem',
                    padding: '0.65rem 1.75rem',
                    background: 'var(--color-primary)',
                    color: '#fff',
                    borderRadius: 'var(--radius-pill)',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    textDecoration: 'none',
                    transition: 'background var(--transition-speed)',
                }}
                onMouseOver={e => e.currentTarget.style.background = 'var(--color-primary-hover)'}
                onMouseOut={e => e.currentTarget.style.background = 'var(--color-primary)'}
            >
                Volver al inicio
            </Link>
        </div>
    );
};

export default Error;
