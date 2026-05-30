import { Link } from 'react-router-dom';
import styles from './Legal.module.scss';

const EMAIL = 'libitum.project@gmail.com';

/** Política de privacidad (RGPD). Texto base; adáptalo a tu entidad real. */
const PrivacyPolicy = () => (
    <div className={styles.page}>
        <h1 className={styles.title}>Política de privacidad</h1>
        <p className={styles.updated}>Última actualización: mayo de 2026</p>

        <section className={styles.section}>
            <h2>1. Responsable del tratamiento</h2>
            <p>
                El responsable del tratamiento de tus datos es <strong>Libitum</strong>. Para cualquier
                cuestión relacionada con tus datos puedes escribirnos a{' '}
                <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.
            </p>
        </section>

        <section className={styles.section}>
            <h2>2. Qué datos recogemos</h2>
            <ul>
                <li><strong>De tu cuenta:</strong> nombre, correo electrónico y, opcionalmente, ciudad y foto de perfil.</li>
                <li><strong>Si eres artista:</strong> biografía, redes sociales, enlace de donación y/o número de Bizum que decidas publicar.</li>
                <li><strong>De uso:</strong> eventos que creas o a los que asistes, artistas que sigues y "me gusta".</li>
            </ul>
        </section>

        <section className={styles.section}>
            <h2>3. Para qué los usamos</h2>
            <p>
                Para prestarte el servicio: gestionar tu cuenta, mostrar y organizar eventos, conectar
                artistas y público, y enviarte recordatorios por email de los eventos a los que te apuntas
                (si los activas). La base legal es la <strong>ejecución del servicio</strong> que solicitas y tu
                <strong> consentimiento</strong>.
            </p>
        </section>

        <section className={styles.section}>
            <h2>4. Con quién los compartimos</h2>
            <p>
                No vendemos tus datos. Solo se procesan en los proveedores que hacen funcionar la plataforma:
                alojamiento y base de datos (Railway, Neon), frontend (Vercel) y envío de correos (Brevo).
            </p>
            <p>
                <strong>Pagos y donaciones:</strong> se realizan directamente en plataformas externas (PayPal,
                Ko-fi, Bizum…). <strong>Libitum no procesa pagos ni almacena datos bancarios.</strong>
            </p>
        </section>

        <section className={styles.section}>
            <h2>5. Cuánto tiempo los guardamos</h2>
            <p>
                Mientras tu cuenta esté activa. Puedes <strong>eliminar tu cuenta</strong> cuando quieras desde
                tu perfil; al hacerlo, tus datos personales se borran.
            </p>
        </section>

        <section className={styles.section}>
            <h2>6. Tus derechos</h2>
            <p>
                Tienes derecho a acceder, rectificar, suprimir, oponerte y solicitar la portabilidad de tus
                datos. Para ejercerlos, escríbenos a <a href={`mailto:${EMAIL}`}>{EMAIL}</a> o elimina tu cuenta
                desde la app.
            </p>
        </section>

        <section className={styles.section}>
            <h2>7. Almacenamiento en tu navegador</h2>
            <p>
                Guardamos tu token de sesión en el almacenamiento local del navegador (localStorage) con fines
                <strong> exclusivamente técnicos</strong> (mantener tu sesión iniciada). No usamos cookies de
                seguimiento ni de publicidad.
            </p>
        </section>

        <section className={styles.section}>
            <h2>8. Cambios</h2>
            <p>
                Podemos actualizar esta política. Publicaremos siempre aquí la versión vigente con su fecha.
                Consulta también nuestros <Link to="/terminos">Términos de uso</Link>.
            </p>
        </section>

        <p className={styles.note}>
            Este texto es una base general. Si Libitum pasa a un uso comercial amplio, conviene que un
            profesional legal lo revise y lo adapte a la entidad concreta.
        </p>
    </div>
);

export default PrivacyPolicy;
