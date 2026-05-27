import styles from './About.module.scss';

const About = () => {
    return (
        <div className={styles.page}>
            <div className={styles.hero}>
                <h1 className={styles.title}>Sobre Libitum</h1>
                <p className={styles.tagline}>La plataforma para artistas que quieren brillar y espectadores que quieren vivir la música.</p>
            </div>

            <div className={styles.sections}>
                <section className={styles.section}>
                    <h2>¿Qué es Libitum?</h2>
                    <p>Libitum es una plataforma de eventos musicales en vivo que conecta a artistas emergentes con su público. Desde pequeños conciertos en locales hasta grandes festivales, aquí puedes descubrir, seguir y asistir a los eventos que más te apasionan.</p>
                </section>

                <section className={styles.section}>
                    <h2>Para artistas</h2>
                    <p>Crea tu perfil, publica tus eventos y gestiona tu comunidad de seguidores. Comparte tus redes sociales, activa donaciones y mantén a tu público informado sobre cada actuación.</p>
                </section>

                <section className={styles.section}>
                    <h2>Para espectadores</h2>
                    <p>Sigue a tus artistas favoritos, guarda los eventos que no quieres perderte y activa recordatorios para cada concierto. Descubre música nueva a través del feed personalizado y el buscador de eventos.</p>
                </section>

                <section className={styles.section}>
                    <h2>Nuestra misión</h2>
                    <p>Creemos que la música en vivo merece una plataforma propia. Libitum nace para reducir la distancia entre artistas y fans, facilitar la organización de eventos y crear una comunidad viva alrededor de la música.</p>
                </section>
            </div>
        </div>
    );
};

export default About;
