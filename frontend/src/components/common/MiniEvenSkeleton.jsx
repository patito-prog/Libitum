import styles from './MiniEventSkeleton.module.scss';

const MiniEventSkeleton = () => {
    return (
        <div className={styles.skeletonCard}>
            <div className={styles.headerRow}>
                <div className={styles.skeletonTitle}></div>
                <div className={styles.skeletonIcon}></div>
            </div>
            <div className={styles.skeletonLocation}></div>
            <div className={styles.footerRow}>
                <div className={styles.skeletonDate}></div>
                <div className={styles.skeletonBadge}></div>
            </div>
        </div>
    );
};

export default MiniEventSkeleton;