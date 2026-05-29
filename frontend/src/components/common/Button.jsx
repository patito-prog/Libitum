import styles from './Button.module.scss';

/** Botón con icono (imagen). Usado p.ej. para el botón de editar evento. */
const Button = ({ title, img, onClick, alt, className }) => (
    <button
        onClick={onClick}
        className={`${styles.btn} ${className ?? ''}`}
    >
        <img src={img} title={title} alt={alt ?? title} />
    </button>
);

export default Button;
