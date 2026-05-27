import { useState, useEffect } from 'react';
import useAPI from '../../../hooks/useAPI.js';
import API_BASE from '../../../config/api.js';
import Loader from '../../../components/common/Loader.jsx';
import styles from './ArtistStats.module.scss';

const StatCard = ({ value, label, sub }) => (
    <div className={styles.statCard}>
        <strong className={styles.statValue}>{value}</strong>
        <p className={styles.statLabel}>{label}</p>
        {sub && <p className={styles.statSub}>{sub}</p>}
    </div>
);

const ArtistStats = () => {
    const { getData, loading } = useAPI();
    const [stats, setStats] = useState(null);

    useEffect(() => {
        getData(`${API_BASE}/api/artist/statistics`)
            .then(res => setStats(res.data))
            .catch(() => {});
    }, []);

    if (loading && !stats) return <Loader />;
    if (!stats) return null;

    const { audience, events_impact } = stats;

    return (
        <div className={styles.page}>
            <h1 className={styles.title}>Estadísticas</h1>
            <p className={styles.subtitle}>Un vistazo rápido a tu impacto en Libitum.</p>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Audiencia</h2>
                <div className={styles.grid}>
                    <StatCard
                        value={audience.total_followers}
                        label="Seguidores totales"
                    />
                    <StatCard
                        value={audience.new_followers_last_30_days}
                        label="Nuevos seguidores"
                        sub="Últimos 30 días"
                    />
                </div>
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Eventos</h2>
                <div className={styles.grid}>
                    <StatCard
                        value={events_impact.total_events_created}
                        label="Eventos creados"
                    />
                </div>
            </section>
        </div>
    );
};

export default ArtistStats;
