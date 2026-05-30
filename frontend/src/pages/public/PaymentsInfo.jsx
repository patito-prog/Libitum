import { Link } from 'react-router-dom';
import styles from './PaymentsInfo.module.scss';

/**
 * Guía de pagos y donaciones. Explica con detalle las comisiones, la donación
 * mínima recomendada (por las comisiones de PayPal/tarjeta), las plataformas y
 * consejos de estrategia para que el artista gane más.
 */
const PaymentsInfo = () => (
    <div className={styles.page}>
        <div className={styles.hero}>
            <h1 className={styles.title}>Guía de pagos y donaciones</h1>
            <p className={styles.tagline}>
                Todo lo que un artista de calle necesita saber para cobrar bien y
                sacarle el máximo partido a sus donaciones.
            </p>
        </div>

        <div className={styles.sections}>
            {/* Donación mínima */}
            <section className={`${styles.section} ${styles.highlight}`}>
                <h2>💡 Pon una donación mínima de 1 €</h2>
                <p>
                    Cuando alguien te dona por <strong>PayPal o un enlace de pago con tarjeta</strong>,
                    la plataforma se queda una <strong>comisión fija + un porcentaje</strong>. En donaciones
                    muy pequeñas, esa comisión se <strong>come casi todo</strong>:
                </p>
                <div className={styles.exampleBox}>
                    Donación de <strong>0,10 €</strong> por PayPal → el artista recibe <strong>0,00 €</strong> 😖<br />
                    Donación de <strong>1,00 €</strong> por PayPal → el artista recibe <strong>~0,60 €</strong> ✅
                </div>
                <p>
                    Por eso, si usas PayPal o un enlace de pago, <strong>recomienda a tu público donar
                    desde 1 €</strong>. Con <strong>Bizum no pasa esto</strong> (no tiene comisión), así que
                    ahí vale cualquier cantidad.
                </p>
            </section>

            {/* Plataformas */}
            <section className={styles.section}>
                <h2>🏆 Plataformas que puedes usar</h2>
                <ul className={styles.platformList}>
                    <li>
                        <strong>Ko-fi</strong> <span className={styles.tag}>Recomendada</span>
                        <p>Gratis, <strong>0% de comisión</strong> en donaciones. Si conectas <strong>Stripe</strong>,
                        quien te dona <strong>paga con tarjeta sin crear cuenta</strong>. La opción más cómoda.</p>
                    </li>
                    <li>
                        <strong>Bizum</strong> <span className={`${styles.tag} ${styles.tagPurple}`}>Sin comisión</span>
                        <p>Lo más directo en España, <strong>instantáneo y sin comisiones</strong>. Cualquier
                        cantidad vale. Solo expones tu móvil (bajo tu responsabilidad).</p>
                    </li>
                    <li>
                        <strong>Buy Me a Coffee</strong>
                        <p>Similar a Ko-fi. El donante paga con tarjeta sin cuenta. Comisión ~5%.</p>
                    </li>
                    <li>
                        <strong>PayPal / PayPal.me</strong>
                        <p>Muy conocido, pero <strong>cobra comisión</strong> y a veces obliga al donante a
                        registrarse. Si lo usas, <strong>mínimo 1 €</strong>.</p>
                    </li>
                    <li>
                        <strong>Stripe (enlace de pago)</strong>
                        <p>Pago con tarjeta sin cuenta. Comisión ~1,5% + 0,25 €. Montarlo es un poco más técnico.</p>
                    </li>
                </ul>
            </section>

            {/* Estrategia */}
            <section className={styles.section}>
                <h2>🚀 Consejos para ganar más</h2>
                <ul className={styles.tips}>
                    <li><strong>Combina Bizum + un enlace</strong> (Ko-fi): así cubres a todo el mundo, paguen como paguen.</li>
                    <li><strong>Sugiere una cantidad</strong>: "con 1-2 € me ayudas un montón" funciona mejor que dejarlo en blanco.</li>
                    <li><strong>Pon tu QR en físico</strong>: pegatinas y láminas con tu QR para que te encuentren en la calle. <Link to="/contact">Te lo fabricamos →</Link></li>
                    <li><strong>Agradece siempre</strong>: una palabra de agradecimiento fideliza y anima a repetir.</li>
                    <li><strong>Evita pedir solo PayPal</strong>: la comisión y el registro echan para atrás. Ko-fi o Bizum convierten mejor.</li>
                </ul>
            </section>

            <p className={styles.footerNote}>
                ¿Dudas sobre pagos o merchandising? Escríbenos desde <Link to="/contact">Contacto</Link>.
            </p>
        </div>
    </div>
);

export default PaymentsInfo;
