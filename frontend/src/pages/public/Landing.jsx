import { Link } from 'react-router-dom';
import styles from './Landing.module.scss';

const TICKER = ['MÚSICA EN VIVO', 'ARTISTAS CALLEJEROS', 'CONCIERTOS', 'DIRECTO', 'CULTURA', 'APOYA EL ARTE'];

const FEATURES = [
    {
        tag: 'PARA ARTISTAS',
        title: 'Tu escenario digital',
        desc: 'Publica tus eventos, reúne a tu público y recibe donaciones con tu QR personal.',
        variant: 'teal',
    },
    {
        tag: 'PARA EL PÚBLICO',
        title: 'Nunca te pierdas un directo',
        desc: 'Sigue a tus artistas favoritos, descubre conciertos cerca de ti y apúntate en un toque.',
        variant: 'coral',
    },
];

/**
 * Landing pública (carta de presentación) para visitantes sin sesión.
 * Explica qué es Libitum (para artistas y para público) e invita a registrarse
 * o iniciar sesión. La muestra RootPage cuando no hay usuario autenticado.
 */
const Landing = () => {
    return (
        <div className={styles.page}>

            {/* Ticker superior */}
            <div className={styles.ticker} aria-hidden="true">
                <div className={styles.tickerTrack}>
                    {[...TICKER, ...TICKER].map((t, i) => (
                        <span key={i} className={styles.tickerItem}>{t} <span>✦</span></span>
                    ))}
                </div>
            </div>

            <div className={styles.inner}>

                {/* ── HERO ── */}
                <section className={styles.hero}>
                    <div className={styles.eyebrow}>
                        <span className={styles.eyebrowMark}>LIBITUM<span>✦</span></span>
                        <span className={styles.eyebrowYear}>MÚSICA · ARTE · DIRECTO</span>
                    </div>

                    <div className={styles.headlineWrap}>
                        <span className={styles.ghost} aria-hidden="true">LIVE</span>
                        <h1 className={styles.headline}>
                            <span className={styles.l1}>DONDE</span>
                            <span className={styles.l2}>EL ARTE</span>
                            <span className={styles.l3}>SUENA.</span>
                        </h1>
                        <span className={styles.deco} aria-hidden="true">✱</span>
                    </div>

                    <div className={styles.heroBottom}>
                        <span className={styles.connector} aria-hidden="true" />
                        <p className={styles.sub}>
                            La plataforma para artistas callejeros y la gente que los escucha.
                            Publica, descubre y vive la música en directo.
                        </p>
                    </div>

                    <div className={styles.ctaRow}>
                        <Link to="/register" className={styles.ctaPrimary}>
                            Crear cuenta gratis <span>→</span>
                        </Link>
                        <Link to="/login" className={styles.ctaSecondary}>
                            Ya tengo cuenta
                        </Link>
                    </div>
                </section>

                {/* ── DOBLE PÚBLICO ── */}
                <section className={styles.features}>
                    {FEATURES.map((f) => (
                        <div key={f.tag} className={`${styles.feature} ${styles[f.variant]}`}>
                            <span className={styles.featureTag}>{f.tag}</span>
                            <h2 className={styles.featureTitle}>{f.title}</h2>
                            <p className={styles.featureDesc}>{f.desc}</p>
                        </div>
                    ))}
                </section>

                {/* ── CIERRE ── */}
                <section className={styles.closing}>
                    <p className={styles.closingText}>¿List@ para subirte al escenario?</p>
                    <Link to="/register" className={styles.ctaPrimary}>
                        Empezar ahora <span>→</span>
                    </Link>
                </section>

            </div>
        </div>
    );
};

export default Landing;
