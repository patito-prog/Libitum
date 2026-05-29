import { Link, useSearchParams } from 'react-router-dom';
import styles from './EmailVerified.module.scss';

/**
 * Página a la que el backend redirige tras pinchar el enlace de verificación.
 * Lee ?status= de la URL y muestra el resultado con la estética de la marca.
 *   success → verificado ahora
 *   already → ya estaba verificado
 *   error   → enlace inválido o caducado
 */
const EmailVerified = () => {
    const [params] = useSearchParams();
    const status = params.get('status') || 'success';

    const content = {
        success: {
            icon: '🎉',
            title: '¡Correo confirmado!',
            text: 'Tu cuenta ya está activa. Inicia sesión y empieza a vivir la cultura de calle.',
            ok: true,
        },
        already: {
            icon: '✅',
            title: 'Ya estabas confirmado',
            text: 'Tu correo ya estaba verificado. Puedes iniciar sesión sin problema.',
            ok: true,
        },
        error: {
            icon: '⚠️',
            title: 'Enlace no válido',
            text: 'El enlace ha caducado o no es correcto. Vuelve a iniciar sesión y reenvíate el correo de confirmación.',
            ok: false,
        },
    }[status] ?? null;

    const data = content ?? {
        icon: '⚠️',
        title: 'Algo no ha ido bien',
        text: 'No hemos podido procesar la verificación. Inténtalo de nuevo desde el login.',
        ok: false,
    };

    return (
        <div className={styles.wrap}>
            <div className={`${styles.card} ${data.ok ? styles.ok : styles.bad}`}>
                <span className={styles.icon} aria-hidden="true">{data.icon}</span>
                <h1 className={styles.title}>{data.title}</h1>
                <p className={styles.text}>{data.text}</p>
                <Link to="/login" className={styles.btn}>Ir a iniciar sesión</Link>
            </div>
        </div>
    );
};

export default EmailVerified;
