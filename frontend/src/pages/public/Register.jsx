import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthContext from '../../hooks/useAuthContext.js';
import useMessageContext from '../../hooks/useMessageContext.js';
// Asegúrate de que esta ruta apunta a tu archivo de validaciones
import { validateRegister } from "../../utils/validations/index.js";
import styles from './Auth.module.scss'; 

const Register = () => {
    // Unificamos todo en el formData (he puesto 'user' por defecto para que coincida con el backend habitual)
    const initialData = {
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "user" 
    };

    const nav = useNavigate();
    const [formData, setFormData] = useState(initialData);
    const [loading, setLoading] = useState(false);

    const { register } = useAuthContext();
    const { showMessageWithTime } = useMessageContext();

   
    const updateData = (event) => {
        const { name, value } = event.target;
        setFormData({
            ...formData,
            [name]: value
        });
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
            await register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                confirmPassword: formData.confirmPassword,
                role: formData.role
            });

            showMessageWithTime("¡Cuenta creada con éxito! Inicia sesión.", "ok");
            
            
            nav('/login');
            
        } catch (error) {
            showMessageWithTime("Error al registrarse.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.authContainer}>
            <div className={styles.authCard}>
                <h1 className={styles.title}>Crea tu cuenta</h1>
                <p className={styles.subtitle}>Únete a la comunidad de Libitum</p>

                <form className={styles.form} onSubmit={submit}>
                    {/* SELECTOR DE ROL */}
                    <div className={styles.inputGroup}>
                        <label>¿Cómo quieres usar Libitum?</label>
                        <div className={styles.roleSelector}>
                            <label className={`${styles.roleLabel} ${formData.role === 'user' ? styles.activeRole : ''}`}>
                                <input 
                                    type="radio" 
                                    name="role" 
                                    value="user" 
                                    checked={formData.role === 'user'} 
                                    onChange={updateData}
                                />
                                🎧 Espectador
                            </label>
                            
                            <label className={`${styles.roleLabel} ${formData.role === 'artist' ? styles.activeRole : ''}`}>
                                <input 
                                    type="radio" 
                                    name="role" 
                                    value="artist" 
                                    checked={formData.role === 'artist'} 
                                    onChange={updateData}
                                />
                                🎸 Artista
                            </label>
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="name">Nombre completo</label>
                        <input 
                            type="text" 
                            id="name" 
                            name="name" // Obligatorio para updateData
                            className={styles.input} 
                            placeholder="Tu nombre o nombre artístico"
                            value={formData.name}
                            onChange={updateData} 
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="email">Correo electrónico</label>
                        <input 
                            type="email" 
                            id="email" 
                            name="email" // Obligatorio para updateData
                            className={styles.input} 
                            placeholder="tu@email.com"
                            value={formData.email}
                            onChange={updateData} 
                            autoComplete="username"
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="password">Contraseña</label>
                        <input 
                            type="password" 
                            id="password" 
                            name="password" // Obligatorio para updateData
                            className={styles.input} 
                            placeholder="Mínimo 8 caracteres"
                            value={formData.password}
                            onChange={updateData} 
                            autoComplete="new-password"
                            
                        />
                    </div>

                    {/* NUEVO CAMPO: CONFIRMAR CONTRASEÑA */}
                    <div className={styles.inputGroup}>
                        <label htmlFor="confirmPassword">Confirmar contraseña</label>
                        <input 
                            type="password" 
                            id="confirmPassword" 
                            name="confirmPassword" // Obligatorio para updateData
                            className={styles.input} 
                            placeholder="Repite tu contraseña"
                            value={formData.confirmPassword}
                            onChange={updateData} 
                            autoComplete="new-password"
                        />
                    </div>

                    <button 
                        type="submit" 
                        className={styles.submitBtn} 
                        disabled={loading} // Bloqueamos si está cargando
                    >
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