import styles from './ConfirmModal.module.scss';

/**
 * Modal de confirmación reutilizable.
 *
 * Lo usamos en vez del feo window.confirm del navegador. Muestra un mensaje,
 * un detalle opcional y dos botones (confirmar / cancelar). Click fuera o en
 * "Cancelar" lo cierra. El botón de confirmar puede pintarse en rojo (danger)
 * para acciones destructivas tipo borrar.
 *
 * @param {Object}   props
 * @param {string}   props.message      Pregunta principal (ej. "¿Eliminar evento?")
 * @param {string}   [props.detail]     Texto secundario aclaratorio
 * @param {string}   [props.confirmLabel='Eliminar'] Texto del botón de confirmar
 * @param {string}   [props.cancelLabel='Cancelar']  Texto del botón de cancelar
 * @param {boolean}  [props.danger=true] Si true, el botón de confirmar va en rojo
 * @param {Function} props.onConfirm    Callback al confirmar
 * @param {Function} props.onCancel     Callback al cancelar / cerrar
 */
const ConfirmModal = ({
    message,
    detail,
    confirmLabel = 'Eliminar',
    cancelLabel  = 'Cancelar',
    danger       = true,
    onConfirm,
    onCancel,
}) => (
    <div className={styles.overlay} onClick={onCancel}>
        <div className={styles.modal} onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
            <p className={styles.message}>{message}</p>
            {detail && <p className={styles.detail}>{detail}</p>}
            <div className={styles.actions}>
                <button className={styles.cancelBtn} onClick={onCancel}>
                    {cancelLabel}
                </button>
                <button
                    className={`${styles.confirmBtn} ${danger ? styles.danger : ''}`}
                    onClick={onConfirm}
                    autoFocus
                >
                    {confirmLabel}
                </button>
            </div>
        </div>
    </div>
);

export default ConfirmModal;
