import { Link } from 'react-router-dom';
import styles from './Legal.module.scss';

const EMAIL = 'libitum.project@gmail.com';

/** Términos de uso. Texto base; adáptalo a tu entidad real. */
const Terms = () => (
    <div className={styles.page}>
        <h1 className={styles.title}>Términos de uso</h1>
        <p className={styles.updated}>Última actualización: mayo de 2026</p>

        <section className={styles.section}>
            <h2>1. Qué es Libitum</h2>
            <p>
                Libitum es una plataforma que conecta artistas (música en vivo, arte callejero) con su público:
                permite publicar eventos, seguir artistas, asistir a eventos y facilitar donaciones a través de
                plataformas externas.
            </p>
        </section>

        <section className={styles.section}>
            <h2>2. Tu cuenta</h2>
            <ul>
                <li>Debes facilitar datos veraces y mantener tu contraseña segura.</li>
                <li>Eres responsable de la actividad que se realice desde tu cuenta.</li>
                <li>El servicio está pensado para mayores de 14 años.</li>
            </ul>
        </section>

        <section className={styles.section}>
            <h2>3. Uso aceptable</h2>
            <p>
                No está permitido publicar contenido ilegal, ofensivo o que infrinja derechos de terceros,
                suplantar a otras personas, ni usar la plataforma para fines fraudulentos. Podemos retirar
                contenido o suspender cuentas que incumplan estas normas.
            </p>
        </section>

        <section className={styles.section}>
            <h2>4. Contenido de los artistas</h2>
            <p>
                Cada artista es responsable de la información de sus eventos y de los enlaces de donación que
                publica. Libitum no organiza los eventos ni garantiza su celebración.
            </p>
        </section>

        <section className={styles.section}>
            <h2>5. Donaciones y pagos</h2>
            <p>
                Las donaciones se realizan <strong>directamente</strong> en plataformas externas (PayPal, Ko-fi,
                Bizum…) bajo la responsabilidad del artista y del donante. <strong>Libitum no procesa pagos, no
                cobra comisión y no interviene</strong> en esas transacciones. El número de Bizum que un artista
                publique queda visible bajo su propia responsabilidad.
            </p>
        </section>

        <section className={styles.section}>
            <h2>6. Responsabilidad</h2>
            <p>
                El servicio se ofrece "tal cual", sin garantías de disponibilidad continua. Libitum no se hace
                responsable de la relación entre artistas y público ni de las transacciones económicas entre ellos.
            </p>
        </section>

        <section className={styles.section}>
            <h2>7. Baja</h2>
            <p>
                Puedes dejar de usar Libitum y <strong>eliminar tu cuenta</strong> en cualquier momento desde tu
                perfil.
            </p>
        </section>

        <section className={styles.section}>
            <h2>8. Cambios y legislación</h2>
            <p>
                Podemos modificar estos términos publicando aquí la versión vigente. La legislación aplicable es
                la española. Consulta también nuestra <Link to="/privacidad">Política de privacidad</Link>. Dudas:{' '}
                <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.
            </p>
        </section>

        <p className={styles.note}>
            Este texto es una base general. Si Libitum pasa a un uso comercial amplio, conviene que un
            profesional legal lo revise y lo adapte a la entidad concreta.
        </p>
    </div>
);

export default Terms;
