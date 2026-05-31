import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import useAuthContext from "./../../hooks/useAuthContext.js";
import useMessageContext from "../../hooks/useMessageContext.js";
import VerifyNotice from "../../components/auth/VerifyNotice.jsx";
import PasswordInput from "../../components/common/PasswordInput.jsx";
import { validateLogin } from "../../utils/validations/auth.js";
import styles from './Auth.module.scss';

/**
 * Pantalla de login. Valida en cliente, llama a logIn del AuthContext y
 * redirige a donde el usuario quería ir (o al feed por defecto).
 */
const Login = () => {
    const initialCredentials = {
        email: "",
        password: ""
    };

    const [credentials, setCredentials] = useState(initialCredentials);
    const [loading, setLoading] = useState(false);
    // Si el back responde que la cuenta no está verificada, guardamos el email
    // para mostrar el aviso de confirmación en vez del formulario.
    const [unverifiedEmail, setUnverifiedEmail] = useState(null);

    const { logIn } = useAuthContext();
    const { showMessageWithTime } = useMessageContext();
    const nav = useNavigate();
    const location = useLocation();
    const from = location.state?.from ?? '/feed';
    
    const updateData = (event) => {
        const { name, value } = event.target;
        setCredentials({
            ...credentials,
            [name]: value
        });
    }

    const submit = async (event) => {
        event.preventDefault(); // Esto evita que recargue, siempre y cuando esté en el form
        
        const error = validateLogin(credentials);

        if (error) {
            showMessageWithTime(error, "error");
            return;
        }
        
        try {
            setLoading(true);
            await logIn(credentials);
            showMessageWithTime("¡Bienvenido/a de nuevo!", "ok");
            nav(from, { replace: true });

        } catch (err) {
            // Caso especial: la cuenta existe pero no ha confirmado el correo.
            if (err?.body?.needs_verification) {
                setUnverifiedEmail(err.body.email || credentials.email);
                showMessageWithTime(err.message, "error");
            } else {
                showMessageWithTime("Credenciales incorrectas o problema de conexión.", "error");
            }
        } finally {
            setLoading(false);
        }
    }

    // Cuenta sin verificar: mostramos el aviso con opción de reenviar.
    if (unverifiedEmail) {
        return (
            <div className={styles.authContainer}>
                <div className={styles.authCard}>
                    <VerifyNotice email={unverifiedEmail} title="Confirma tu correo" />
                </div>
            </div>
        );
    }

    return (
        <div className={styles.authContainer}>
            <div className={styles.authCard}>
                <h1 className={styles.title}>Bienvenido de nuevo</h1>
                <p className={styles.subtitle}>Inicia sesión para continuar en Libitum</p>

                <form className={styles.form} onSubmit={submit}>
                    
                    <div className={styles.inputGroup}>
                        <label htmlFor="email">Correo electrónico</label>
                        <input 
                            type="email" 
                            id="email" 
                            name="email" 
                            className={styles.input} 
                            placeholder="tu@email.com" 
                            autoComplete="username"
                            value={credentials.email} 
                            onChange={updateData} 
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="password">Contraseña</label>
                        <PasswordInput
                            id="password"
                            name="password"
                            className={styles.input}
                            placeholder="••••••••"
                            autoComplete="current-password"
                            value={credentials.password}
                            onChange={updateData}
                        />
                    </div>

                    <p className={styles.forgotLink}>
                        <Link to="/recuperar-contrasena">¿Olvidaste tu contraseña?</Link>
                    </p>

                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={loading}
                    >
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>

                <p className={styles.switchAuth}>
                    ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
                </p>
            </div>
        </div>
    );
}

export default Login;