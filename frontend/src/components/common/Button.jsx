import styles from './Button.module.scss';

const Button = ({ title, img, onClick, alt, className }) => (
    <button
        onClick={onClick}
        className={`${styles.btn} ${className ?? ''}`}
    >
        <img src={img} title={title} alt={alt ?? title} />
    </button>
);

export default Button;
