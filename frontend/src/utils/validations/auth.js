/* Validaciones de formularios de usuario (login y registro).
   Todas devuelven un string con el error, o null si está todo OK. */

/**
 * Valida el formulario de login.
 * @param {{email:string, password:string}} credentials
 * @returns {string|null} mensaje de error o null si es válido
 */
export const validateLogin = (credentials) => {
    if(!credentials.email || !credentials.password){
        return "Debes rellenar todos los campos.";
    }

    // Email válido vía expresión regular.
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(!validEmail.test(credentials.email)){
        return "El email debe ser válido";
    }

    return null;
}

/**
 * Valida el formulario de registro: campos obligatorios, formato de email,
 * longitud y coincidencia de contraseña, y la URL de donación si es artista.
 * @param {Object} formData
 * @returns {string|null} mensaje de error o null si es válido
 */
export const validateRegister = (formData) => {
    if(!formData.name || !formData.email || !formData.password || !formData.confirmPassword){
        return "Debes rellenar todos los campos."
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        return "El formato del email no es válido.";
    }

    if (formData.password.length < 8) {
        return "La contraseña debe tener al menos 8 caracteres.";
    }

    if (formData.password !== formData.confirmPassword) {
        return "Las contraseñas no coinciden.";
    }

    if (formData.role === 'artist' && formData.donation_url) {
        try {
            new URL(formData.donation_url);
        } catch {
            return "La URL de donación no es válida. Debe empezar por https://.";
        }
    }

    return null;
}
