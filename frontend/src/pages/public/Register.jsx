import React, {useState} from "react";
import {Link} from "react-router-dom";
import useMessageContext from "../../hooks/useMessageContext.js";
import useAuthContext from "../../hooks/useAuthContext.js";

const Register = () => {

    const initialData = {
        name:"",
        email:"",
        password:"",
        confirmPassword:"",
        role:"spectator"
    };

    const [formData, setFormData] = useState(initialData);
    const [loading, setLoading] = useState(false);

    const {register} = useAuthContext();
    const {showMessage} = useMessageContext();

    const updateData = (event) => {
        const {name, value} = event.target;
        setFormData({
            ...formData,
            [name] : value
        });

    };

    const submit = async (event) => {
        event.preventDefault();

        //validar en validador, esto es provisional.
        if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
            showMessage("Por favor, rellena todos los campos.", "error");
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            showMessage("Las contraseñas no coinciden.", "error");
            return;
        }

        if (formData.password.length < 6) {
            showMessage("La contraseña debe tener al menos 6 caracteres.", "error");
            return;
        }

        try{
            setLoading(true);

            await register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role
            });

            showMessage("¡Cuenta creada con éxito! Inicia sesión.", "ok");
        }catch(error){
            showMessage("Error al registrarse.", "error");
        }finally{
            setLoading(false);
        }
    }
    return(
        <div className="login-container"> 
            <h2>Crear Cuenta en Libitum</h2>
            
            <form onSubmit={submit}>
                <div>
                    <label htmlFor="name">Nombre / Alias:</label>
                    <input 
                        id="name"
                        type="text" 
                        name="name" 
                        value={formData.name} 
                        onChange={updateData} 
                        autoComplete="name"
                    />
                </div>

                <div>
                    <label htmlFor="email">Email:</label>
                    <input 
                        id="email"
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={updateData} 
                        autoComplete="email"
                    />
                </div>

                <div>
                    <label htmlFor="password">Contraseña:</label>
                    <input 
                        id="password"
                        type="password" 
                        name="password"
                        value={formData.password} 
                        onChange={updateData} 
                        autoComplete="new-password"
                    />
                </div>

                <div>
                    <label htmlFor="confirmPassword">Confirmar Contraseña:</label>
                    <input 
                        id="confirmPassword"
                        type="password" 
                        name="confirmPassword"
                        value={formData.confirmPassword} 
                        onChange={updateData} 
                        autoComplete="new-password"
                    />
                </div>

                <div>
                    <label htmlFor="role">¿Cómo vas a usar Libitum?</label>
                    <select 
                        id="role" 
                        name="role" 
                        value={formData.role} 
                        onChange={updateData}
                    >
                        <option value="spectator">Soy un Espectador</option>
                        <option value="artist">Soy un Artista</option>
                    </select>
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? "Registrando..." : "Crear Cuenta"}
                </button>
            </form>

            <p>
                ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
            </p>
        </div>
    );
}

export default Register;