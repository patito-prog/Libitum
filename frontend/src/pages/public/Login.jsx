import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuthContext from "./../../hooks/useAuthContext.js";
import useMessageContext from "../../hooks/useMessageContext.js";
import { validateLogin } from "../../utils/validations/auth.js";
import styles from './Auth.module.scss';

const Login = () => {
    const initialCredentials = {
        email: "",
        password: ""
    };

    const [credentials, setCredentials] = useState(initialCredentials);
    const [loading, setLoading] = useState(false);

    const { logIn } = useAuthContext();
    const { showMessageWithTime } = useMessageContext();
    const nav = useNavigate();
    
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
            nav('/feed'); 
            
        } catch(error) {
            showMessageWithTime("Credenciales incorrectas o problema de conexión.", "error");
        } finally {
            setLoading(false);
        }
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
                        <input 
                            type="password" 
                            id="password" 
                            name="password" 
                            className={styles.input} 
                            placeholder="••••••••" 
                            autoComplete="current-password"
                            value={credentials.password} 
                            onChange={updateData} 
                        />
                    </div>

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