import styles from './Loader.module.scss';

/** Spinner de carga. Con fullScreen ocupa toda la pantalla; si no, su contenedor. */
const Loader = ({ fullScreen = false }) => {
    return (
        <div className={fullScreen ? styles.fullScreenContainer : styles.container}>
            <div className={styles.spinner}></div>
        </div>
    );
};

export default Loader;