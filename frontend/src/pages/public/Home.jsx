import { Link } from 'react-router-dom';
import useAuthContext from '../../hooks/useAuthContext.js';
import styles from './Home.module.scss';

// Palabras del ticker (marquesina) que recorre la cabecera.
const TICKER = ['MÚSICA EN VIVO', 'ARTISTAS', 'EVENTOS', 'DIRECTO', 'CULTURA', 'LIBITUM'];

// Accesos rápidos de la rejilla según el rol. El número es solo decorativo.
const ARTIST_CARDS = [
    { to: '/feed',          num: '01', title: 'Para Ti',       desc: 'El feed con los eventos de tus seguidores' },
    { to: '/events',        num: '02', title: 'Mis Eventos',   desc: 'Crea y gestiona tus conciertos' },
    { to: '/estadisticas',  num: '03', title: 'Estadísticas',  desc: 'Seguidores, nuevos fans y más' },
    { to: '/favorites',     num: '04', title: 'Favoritos',     desc: 'Eventos que te han gustado' },
    { to: '/events/buscar', num: '05', title: 'Descubrir',     desc: 'Explora eventos por nombre, lugar o género' },
    { to: '/asistencias',   num: '06', title: 'Asistencias',   desc: 'Eventos a los que vas a ir' },
    { to: '/my-qr',         num: '07', title: 'Mi QR',         desc: 'Tu enlace de donaciones' },
];

const SPECTATOR_CARDS = [
    { to: '/feed',          num: '01', title: 'Para Ti',     desc: 'Eventos de artistas que sigues' },
    { to: '/events/buscar', num: '02', title: 'Descubrir',   desc: 'Busca por nombre, lugar o género' },
    { to: '/favorites',     num: '03', title: 'Favoritos',   desc: 'Eventos que te han gustado' },
    { to: '/asistencias',   num: '04', title: 'Asistencias', desc: 'Los eventos a los que vas' },
];

/**
 * Home del usuario autenticado (panel de inicio personalizado).
 * Saluda por su nombre y muestra accesos rápidos distintos según sea artista
 * o espectador. A los invitados no les llega aquí: ven la Landing (ver RootPage).
 */
const Home = () => {
    const { user } = useAuthContext();
    const isArtist = user?.role === 'artist';
    const firstName = user?.name?.split(' ')[0] ?? 'de vuelta';
    const cards = isArtist ? ARTIST_CARDS : SPECTATOR_CARDS;

    return (
        <div className={styles.page}>

            {/* ── Ticker marquee ── */}
            <div className={styles.ticker} aria-hidden="true">
                <div className={styles.tickerTrack}>
                    {[...TICKER, ...TICKER].map((t, i) => (
                        <span key={i} className={styles.tickerItem}>
                            {t} <span className={styles.tickerDot}>✦</span>
                        </span>
                    ))}
                </div>
            </div>

            <div className={styles.inner}>

                {/* ── Hero ── */}
                <section className={styles.hero}>
                    {/* Eyebrow editorial: marca a la izquierda, año a la derecha */}
                    <div className={styles.eyebrow}>
                        <span className={styles.eyebrowMark}>LIBITUM<span>✦</span></span>
                        <span className={styles.eyebrowYear}>EST. 2026</span>
                    </div>

                    <div className={styles.heroMeta}>
                        <span className={styles.heroPulse} />
                        <span>Hola, <strong>{firstName}</strong></span>
                        <span className={`${styles.roleTag} ${isArtist ? styles.roleArtist : styles.roleSpec}`}>
                            {isArtist ? '🎸 Artista' : '🎧 Espectador'}
                        </span>
                    </div>

                    <div className={styles.headlineWrap}>
                        {/* Palabra fantasma (outline) superpuesta detrás */}
                        <span className={styles.ghost} aria-hidden="true">
                            {isArtist ? 'CREA' : 'LIVE'}
                        </span>

                        <div className={styles.headlineStack}>
                            <span className={styles.line1}>
                                {isArtist ? 'CONECTA' : 'DESCUBRE'}
                            </span>
                            <span className={styles.line2}>
                                {isArtist ? 'CON TU' : 'MÚSICA'}
                            </span>
                            <span className={styles.line3}>
                                {isArtist ? 'PÚBLICO.' : 'EN VIVO.'}
                            </span>
                        </div>

                        <span className={styles.deco} aria-hidden="true">✱</span>
                    </div>

                    <div className={styles.heroBottom}>
                        {/* Línea conectora editorial */}
                        <span className={styles.connector} aria-hidden="true" />
                        <p className={styles.sub}>
                            {isArtist
                                ? 'Publica eventos, gestiona asistentes y recibe el apoyo de tus seguidores.'
                                : 'Sigue artistas, encuentra conciertos cerca de ti y nunca te pierdas un directo.'}
                        </p>
                    </div>
                </section>

                {/* ── Grid de navegación ── */}
                <section className={styles.grid}>
                    {cards.map(({ to, num, title, desc }, i) => (
                        <Link
                            key={to}
                            to={to}
                            className={styles.card}
                            style={{ '--delay': `${i * 0.07}s` }}
                        >
                            <span className={styles.cardNum} aria-hidden="true">{num}</span>
                            <div className={styles.cardBody}>
                                <h3 className={styles.cardTitle}>{title}</h3>
                                <p className={styles.cardDesc}>{desc}</p>
                            </div>
                            <span className={styles.cardArrow} aria-hidden="true">→</span>
                        </Link>
                    ))}
                </section>

            </div>
        </div>
    );
};

export default Home;
