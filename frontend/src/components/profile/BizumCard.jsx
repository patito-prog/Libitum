import useMessageContext from '../../hooks/useMessageContext.js';
import styles from './BizumCard.module.scss';

/**
 * Bloque "Hazme un Bizum" para el perfil del artista. Muestra el número bien
 * grande con un botón de copiar y una instrucción corta. No usamos QR porque
 * Bizum no tiene un formato de QR/enlace que abran los bancos.
 *
 * @param {{ phone: string, name?: string }} props
 */
const BizumCard = ({ phone, name }) => {
    const { showMessageWithTime } = useMessageContext();

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(phone);
            showMessageWithTime('Número copiado al portapapeles.', 'ok');
        } catch {
            showMessageWithTime('No se ha podido copiar. Cópialo a mano.', 'error');
        }
    };

    return (
        <div className={styles.bizum}>
            <p className={styles.tag}>💜 Hazme un Bizum</p>
            <button type="button" className={styles.number} onClick={copy} title="Copiar número">
                <span>{phone}</span>
                <span className={styles.copyIcon} aria-hidden="true">📋</span>
            </button>
            <p className={styles.hint}>
                Ábrelo en tu app del banco → <strong>Bizum</strong> → envía a este número
                {name ? <> para apoyar a {name}</> : null}.
            </p>
        </div>
    );
};

export default BizumCard;
