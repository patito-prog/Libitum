import { useState } from 'react';
import { Link } from 'react-router-dom';
import useAuthContext from '../../hooks/useAuthContext.js';
import useMessageContext from '../../hooks/useMessageContext.js';
import VerifyNotice from '../../components/auth/VerifyNotice.jsx';
import { validateRegister } from "../../utils/validations/index.js";
import styles from './Auth.module.scss';

/**
 * Pantalla de registro. Si el rol elegido es artista, muestra campos extra
 * (como la URL de donación). Valida en cliente antes de mandar al back.
 */
const Register = () => {
    const initialData = {
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "user",
        donation_url: "",
    };

    const [formData, setFormData] = useState(initialData);
    const [loading, setLoading] = useState(false);
    // Cuando el registro va bien, guardamos el email para pasar a la pantalla
    // de "revisa tu correo" en vez de redirigir al login.
    const [registeredEmail, setRegisteredEmail] = useState(null);

    const { register } = useAuthContext();
    const { showMessageWithTime } = useMessageContext();

    const updateData = (event) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    };

    const submit = async (event) => {
        event.preventDefault();

        const error = validateRegister(formData);
        if (error) {
            showMessageWithTime(error, "error");
            return;
        }

        try {
            setLoading(true);
            const payload = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role,
            };
            if (formData.role === 'artist' && formData.donation_url) {
                payload.donation_url = formData.donation_url;
            }
            await register(payload);
            showMessageWithTime("¡Cuenta creada! Revisa tu correo para confirmarla.", "ok");
            setRegisteredEmail(formData.email);
        } catch (err) {
            showMessageWithTime(err?.message || "Error al registrarse.", "error");
        } finally {
            setLoading(false);
        }
    };

    const isArtist = formData.role === 'artist';

    // Registro completado: mostramos el aviso de "revisa tu correo".
    if (registeredEmail) {
        return (
            <div className={styles.authContainer}>
                <div className={styles.authCard}>
                    <VerifyNotice email={registeredEmail} title="¡Ya casi estás!" />
                </div>
            </div>
        );
    }

    return (
        <div className={styles.authContainer}>
            <div className={`${styles.authCard} ${isArtist ? styles.authCardWide : ''}`}>
                <h1 className={styles.title}>Crea tu cuenta</h1>
                <p className={styles.subtitle}>Únete a la comunidad de Libitum</p>

                <form className={styles.form} onSubmit={submit}>
                    {/* SELECTOR DE ROL */}
                    <div className={styles.inputGroup}>
                        <label>¿Cómo quieres usar Libitum?</label>
                        <div className={styles.roleSelector}>
                            <label className={`${styles.roleLabel} ${formData.role === 'user' ? styles.activeRole : ''}`}>
                                <input type="radio" name="role" value="user" checked={formData.role === 'user'} onChange={updateData} />
                                🎧 Espectador
                            </label>
                            <label className={`${styles.roleLabel} ${isArtist ? styles.activeRole : ''}`}>
                                <input type="radio" name="role" value="artist" checked={isArtist} onChange={updateData} />
                                🎸 Artista
                            </label>
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="name">Nombre completo</label>
                        <input type="text" id="name" name="name" className={styles.input}
                            placeholder="Tu nombre o nombre artístico"
                            value={formData.name} onChange={updateData} />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="email">Correo electrónico</label>
                        <input type="email" id="email" name="email" className={styles.input}
                            placeholder="tu@email.com"
                            value={formData.email} onChange={updateData} autoComplete="username" />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="password">Contraseña</label>
                        <input type="password" id="password" name="password" className={styles.input}
                            placeholder="Mínimo 6 caracteres"
                            value={formData.password} onChange={updateData} autoComplete="new-password" />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="confirmPassword">Confirmar contraseña</label>
                        <input type="password" id="confirmPassword" name="confirmPassword" className={styles.input}
                            placeholder="Repite tu contraseña"
                            value={formData.confirmPassword} onChange={updateData} autoComplete="new-password" />
                    </div>

                    {/* CAMPO DE DONACIÓN — solo para artistas */}
                    {isArtist && (
                        <div className={styles.donationBlock}>
                            <div className={styles.donationNotice}>
                                <span className={styles.noticeIcon}>💰</span>
                                <div>
                                    <strong>¡No te olvides de esto!</strong>
                                    <p>
                                        Tus fans llegarán a tu perfil escaneando tu QR. Si no tienes un enlace de donación,
                                        no podrán apoyarte económicamente. Puedes añadirlo ahora o más tarde en tu perfil.
                                    </p>
                                </div>
                            </div>
                            <div className={styles.inputGroup}>
                                <label htmlFor="donation_url">
                                    Enlace de donación <span className={styles.optional}>(opcional)</span>
                                </label>
                                <input
                                    type="url"
                                    id="donation_url"
                                    name="donation_url"
                                    className={`${styles.input} ${styles.donationInput}`}
                                    placeholder="https://buymeacoffee.com/tu_usuario"
                                    value={formData.donation_url}
                                    onChange={updateData}
                                />
                                <p className={styles.donationHint}>
                                    Plataformas aceptadas: Ko-fi · Buy Me a Coffee · PayPal · Patreon · GoFundMe · Twitch
                                </p>
                            </div>
                        </div>
                    )}

                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading ? 'Registrando...' : 'Registrarse'}
                    </button>
                </form>

                <p className={styles.switchAuth}>
                    ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
