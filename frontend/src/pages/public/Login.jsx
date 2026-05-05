import {useState} from "react";
import {useNavigate, Link} from "react-router-dom";
import useAuthContext from "./../../hooks/useAuthContext.js";
import useMessageContext from "../../hooks/useMessageContext.js";

const Login = () => {

    const initialCredentials = {
        email: "",
        password: ""
    };

    const [credentials, setCredentials] = useState(initialCredentials);
    const [loading, setLoading] = useState(false);

    const {logIn} = useAuthContext();
    const {showMessage} = useMessageContext();
    const nav = useNavigate();
    
    const updateData = (event) => {
        const {name, value } = event.target;
        setCredentials({
            ...credentials,
            [name]:value
        });
    }

    const submit = async (event) => {
        event.preventDefault();
        
        //validar en validador, esto es provisional.
        if(!credentials.email || !credentials.password){
            showMessage("Por favor, rellena todos los campos.", "error");
            return;
        }
       

        try{
            setLoading(true);
            await logIn(credentials);
            showMessage("¡Bienvenido/a de nuevo!", "ok");
            //Navegar al para ti del usuario.
        }catch(error){
            showMessage("Credenciales incorrectas o problema de conexión.", "error");
        }finally{
            setLoading(false);
        }

    };
    return (
        <div className="login-container">
            <h2>Iniciar Sesión en Libitum</h2>
            
            <form onSubmit={submit}>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input 
                        id="email"
                        type="email" 
                        name="email" 
                        value={credentials.email} 
                        onChange={updateData} 
                        autoComplete="username"
                    />
                </div>

                <div>
                    <label htmlFor="password">Contraseña:</label>
                    <input 
                        id="password"
                        type="password" 
                        name="password"
                        value={credentials.password} 
                        onChange={updateData}
                        autoComplete="current-password" 
                    />
                </div>

                {/* Ya no hace falta renderizar el error aquí, 
                    tu componente global de Mensajes se encargará de mostrarlo flotando o donde lo tengas diseñado */}

                <button type="submit" disabled={loading}>
                    {loading ? "Cargando..." : "Entrar"}
                </button>
            </form>

            <p>
                ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
            </p>
        </div>
    );
}
export default Login;