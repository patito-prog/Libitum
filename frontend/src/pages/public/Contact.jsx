import styles from './Contact.module.scss';

// Correo único del proyecto (el mismo que envía los correos de la app).
const EMAIL = 'libitum.project@gmail.com';
// Enlace de PayPal.me para las donaciones a los desarrolladores.
const PAYPAL_URL = 'https://www.paypal.me/irene15062025';

const Contact = () => {
    return (
        <div className={styles.page}>
            <div className={styles.hero}>
                <h1 className={styles.title}>Contacto</h1>
                <p className={styles.tagline}>¿Dudas, sugerencias, merchandising o quieres apoyar el proyecto? Estamos aquí.</p>
            </div>

            <div className={styles.sections}>
                <section className={styles.section}>
                    <h2>Soporte y consultas</h2>
                    <p>Para cualquier duda sobre la plataforma, problemas técnicos, tu cuenta o si eres artista y necesitas ayuda con tu perfil y eventos, escríbenos a:</p>
                    <a href={`mailto:${EMAIL}`} className={styles.email}>{EMAIL}</a>
                </section>

                {/* Merchandising: la forma de sacar algo de dinero para el proyecto */}
                <section className={`${styles.section} ${styles.merch}`}>
                    <h2>🛍️ Merchandising · Lleva tu QR al mundo real</h2>
                    <p>¿Eres artista y quieres que la gente te encuentre también en la calle? Te fabricamos material físico con <strong>tu QR de Libitum</strong> para que tus fans te sigan y te apoyen de un escaneo:</p>
                    <ul className={styles.merchList}>
                        <li>✦ <strong>Pegatinas</strong> con tu QR (para la funda de la guitarra, el estuche, el local...)</li>
                        <li>✦ <strong>Láminas y carteles</strong> con tu QR para colgar donde tocas</li>
                        <li>✦ <strong>Chapas y tarjetas</strong> para repartir entre el público</li>
                    </ul>
                    <p>Escríbenos con lo que tienes en mente y te pasamos opciones y precios:</p>
                    <a href={`mailto:${EMAIL}?subject=Quiero%20merchandising%20de%20mi%20QR`} className={styles.email}>{EMAIL}</a>
                </section>

                {/* Apoyo a los desarrolladores */}
                <section className={`${styles.section} ${styles.support}`}>
                    <h2><span className={styles.spark}>✨</span> Apoya el proyecto</h2>
                    <p>Libitum lo hemos hecho con muchísimo cariño y café. Si te gusta lo que ves y quieres que sigamos mejorándolo, cualquier donación nos ayuda a mantener la web en marcha y a seguir creando.</p>
                    <a href={PAYPAL_URL} target="_blank" rel="noopener noreferrer" className={styles.donateBtn}>
                        💛 Donar con PayPal
                    </a>
                    <p className={styles.orContact}>¿Prefieres escribirnos antes? <a href={`mailto:${EMAIL}?subject=Quiero%20apoyar%20Libitum`} className={styles.email}>{EMAIL}</a></p>
                    <p className={styles.thanks}>¡Gracias por formar parte de esto! 💛</p>
                </section>
            </div>
        </div>
    );
};

export default Contact;
