import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAPI from '../../../hooks/useAPI.js';
import API_BASE from '../../../config/api.js';
import Loader from '../../../components/common/Loader.jsx';
import styles from './ArtistStats.module.scss';

const STATUS_LABELS = {
    draft:     { label: 'Borrador',   icon: '📝' },
    published: { label: 'Publicado',  icon: '📢' },
    live:      { label: 'En directo', icon: '🔴' },
    finished:  { label: 'Finalizado', icon: '✅' },
    cancelled: { label: 'Cancelado',  icon: '❌' },
};

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
    const byStatus = events_impact.events_by_status ?? {};

    return (
        <div className={styles.page}>
            <h1 className={styles.title}>Estadísticas</h1>
            <p className={styles.subtitle}>Un vistazo rápido a tu impacto en Libitum.</p>

            {/* ── AUDIENCIA ── */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Audiencia</h2>
                <div className={styles.grid}>
                    <StatCard value={audience.total_followers} label="Seguidores totales" />
                    <StatCard
                        value={audience.new_followers_last_30_days}
                        label="Nuevos seguidores"
                        sub="Últimos 30 días"
                    />
                </div>
            </section>

            {/* ── EVENTOS ── */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Eventos</h2>
                <div className={styles.grid}>
                    <StatCard value={events_impact.total_events_created} label="Eventos creados" />
                    <StatCard value={events_impact.upcoming_events}      label="Próximos eventos" />
                    <StatCard value={events_impact.total_inscriptions}   label="Inscripciones totales" />
                    <StatCard value={events_impact.total_likes}          label="Likes recibidos" />
                </div>
            </section>

            {/* ── DESGLOSE POR ESTADO ── */}
            {Object.keys(byStatus).length > 0 && (
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Estado de los eventos</h2>
                    <div className={styles.statusRow}>
                        {Object.entries(byStatus).map(([name, count]) => {
                            const meta = STATUS_LABELS[name] ?? { label: name, icon: '•' };
                            return (
                                <div key={name} className={styles.statusPill}>
                                    {meta.icon} {meta.label} <span>{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* ── EVENTO MÁS POPULAR ── */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Evento más popular</h2>
                {events_impact.most_popular_event ? (
                    <Link
                        to={`/event/${events_impact.most_popular_event.id}`}
                        className={styles.topEventCard}
                    >
                        <p className={styles.topEventTitle}>
                            {events_impact.most_popular_event.title}
                        </p>
                        <div className={styles.topEventMeta}>
                            <span>👥 <strong>{events_impact.most_popular_event.inscriptions}</strong> inscripciones</span>
                            <span>❤️ <strong>{events_impact.most_popular_event.likes}</strong> likes</span>
                        </div>
                    </Link>
                ) : (
                    <p className={styles.emptyNote}>Crea tu primer evento para ver estadísticas aquí.</p>
                )}
            </section>
        </div>
    );
};

export default ArtistStats;
