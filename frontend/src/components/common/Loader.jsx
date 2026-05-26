import styles from './Loader.module.scss';

const Loader = ({ fullScreen = false }) => {
    return (
        <div className={fullScreen ? styles.fullScreenContainer : styles.container}>
            <div className={styles.spinner}></div>
        </div>
    );
};

export default Loader;