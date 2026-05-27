import { Link } from 'react-router-dom';
import useAuthContext from '../../hooks/useAuthContext.js';
import styles from './Home.module.scss';

const ARTIST_CARDS = [
    { to: '/feed',          icon: '✦',  title: 'Para Ti',       desc: 'El feed con todos los eventos' },
    { to: '/events',        icon: '🎸', title: 'Mis Eventos',   desc: 'Crea y gestiona tus conciertos' },
    { to: '/estadisticas',  icon: '📊', title: 'Estadísticas',  desc: 'Seguidores, nuevos fans y más' },
    { to: '/favorites',     icon: '❤️', title: 'Favoritos',     desc: 'Eventos que te han gustado' },
    { to: '/events/buscar', icon: '🔍', title: 'Descubrir',     desc: 'Explora eventos por nombre, lugar o género' },
    { to: '/asistencias',   icon: '🗓', title: 'Asistencias',   desc: 'Eventos a los que vas a ir' },
    { to: '/my-qr',         icon: '📱', title: 'Mi QR',         desc: 'Tu enlace de donaciones' },
];

const SPECTATOR_CARDS = [
    { to: '/feed',          icon: '✦',  title: 'Para Ti',     desc: 'Eventos de artistas que sigues' },
    { to: '/events/buscar', icon: '🔍', title: 'Descubrir',   desc: 'Busca por nombre, lugar o género' },
    { to: '/favorites',     icon: '❤️', title: 'Favoritos',   desc: 'Eventos que te han gustado' },
    { to: '/asistencias',   icon: '🗓', title: 'Asistencias', desc: 'Los eventos a los que vas' },
];

const Home = () => {
    const { user } = useAuthContext();
    const isArtist = user?.role === 'artist';
    const firstName = user?.name?.split(' ')[0] ?? 'de vuelta';
    const cards = isArtist ? ARTIST_CARDS : SPECTATOR_CARDS;

    return (
        <div className={styles.page}>
            <div className={styles.hero}>
                <p className={styles.greeting}>Hola, <span className={styles.name}>{firstName}</span> 👋</p>
                <h1 className={styles.headline}>
                    {isArtist ? 'Conecta con tu público.' : 'Descubre música en vivo.'}
                </h1>
                <p className={styles.sub}>
                    {isArtist
                        ? 'Publica eventos, gestiona asistentes y recibe el apoyo de tus seguidores.'
                        : 'Sigue artistas, encuentra conciertos cerca de ti y nunca te pierdas un directo.'}
                </p>
            </div>

            <div className={styles.grid}>
                {cards.map(({ to, icon, title, desc }) => (
                    <Link key={to} to={to} className={styles.card}>
                        <span className={styles.cardIcon}>{icon}</span>
                        <h3 className={styles.cardTitle}>{title}</h3>
                        <p className={styles.cardDesc}>{desc}</p>
                        <span className={styles.arrow}>→</span>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Home;
