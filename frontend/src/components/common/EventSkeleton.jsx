import styles from './EventSkeleton.module.scss';

/** Esqueleto (placeholder animado) de la tarjeta grande mientras carga el feed. */
const EventSkeleton = () => {
    return (
        <div className={styles.skeletonCard}>
            <div className={styles.skeletonHeader}>
                <div className={styles.skeletonTitle}></div>
                <div className={styles.skeletonIcon}></div>
            </div>
            <div className={styles.skeletonText}></div>
            <div className={styles.skeletonFooter}>
                <div className={styles.skeletonPill}></div>
                <div className={styles.skeletonPill}></div>
            </div>
        </div>
    );
};

export default EventSkeleton;