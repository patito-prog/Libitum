import styles from './ButtonAdd.module.scss';

/** Botón flotante de "+" para añadir (lo usa el artista para crear evento). */
const ButtonAdd = ({title, alt, onClick}) => {
    return (
        <button className={styles.addBtn} onClick={onClick}>
            <img
                title={title}
                src="/icon-add.png"
                alt={alt}
                className={styles.addImg}
            />
        </button>
    )
}

export default ButtonAdd;