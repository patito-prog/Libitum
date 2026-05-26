//Validaciones para los usuarios.
export const validateLogin = (credentials) => {
    if(!credentials.email || !credentials.password){
        return "Debes rellenar todos los campos.";
    }

    //Comprobamos que el email es válido mediante una expresión regular.
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(!validEmail.test(credentials.email)){
        return "El email debe ser válido";
    }

    return null;
}

export const validateRegister = (formData) => {
    if(!formData.name || !formData.email || !formData.password || !formData.confirmPassword){
        return "Debes rellenar todos los campos."
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        return "El formato del email no es válido.";
    }

    if (formData.password.length < 6) {
        return "La contraseña debe tener al menos 6 caracteres.";
    }

    if (formData.password !== formData.confirmPassword) {
        return "Las contraseñas no coinciden.";
    }

    return null;
}
