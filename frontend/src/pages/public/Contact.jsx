import styles from './Contact.module.scss';

const Contact = () => {
    return (
        <div className={styles.page}>
            <div className={styles.hero}>
                <h1 className={styles.title}>Contacto</h1>
                <p className={styles.tagline}>¿Tienes alguna duda, sugerencia o quieres reportar un problema? Estamos aquí.</p>
            </div>

            <div className={styles.sections}>
                <section className={styles.section}>
                    <h2>Soporte general</h2>
                    <p>Para cualquier consulta sobre el funcionamiento de la plataforma, problemas técnicos o dudas sobre tu cuenta, escríbenos a:</p>
                    <a href="mailto:soporte@libitum.app" className={styles.email}>soporte@libitum.app</a>
                </section>

                <section className={styles.section}>
                    <h2>Artistas y eventos</h2>
                    <p>Si eres artista y necesitas ayuda para configurar tu perfil, gestionar eventos o tienes preguntas sobre las funcionalidades profesionales:</p>
                    <a href="mailto:artistas@libitum.app" className={styles.email}>artistas@libitum.app</a>
                </section>

                <section className={styles.section}>
                    <h2>Reportar contenido</h2>
                    <p>Si encuentras contenido inapropiado o necesitas reportar un problema urgente, contacta directamente con nuestro equipo de moderación:</p>
                    <a href="mailto:moderacion@libitum.app" className={styles.email}>moderacion@libitum.app</a>
                </section>
            </div>
        </div>
    );
};

export default Contact;
