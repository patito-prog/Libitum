#  Estado del Proyecto: Libitum (To-Do List)
### 📂 Gestión de Base de Datos y Modelos
-[x] Modelo Event definido: Campos $fillable y $casts (fechas y precios) configurados correctamente.

- [x] Relaciones Eloquent: Conexión establecida entre Event, User (Artista), Category y Attendees.

- [x] Configuración Horaria: He mantenido la configuración UTC en el backend por escalabilidad y buenas prácticas, delegando la conversión de zona horaria al Frontend.

- [ ] Factories completas: Necesitamos terminar el CategoryFactory y EventFactory para que el seeder no falle.

- [ ] Ejecución del Seeder: Poblar la base de datos con los 10 artistas y 20 espectadores de prueba.

### ⚙️ Desarrollo Backend (API)
- [x] Ruta de Creación de Eventos: Ruta POST /event/create funcional y probada externamente.

- [x] Controlador EventController: Lógica de creación con generación automática de slug único.

- [x] Validación de Datos: Implementada validación de tipos (string, date, numeric) para evitar errores en la DB.

- [x] Excepción de Seguridad (Postman): Configurada la excepción de CSRF en bootstrap/app.php para facilitar las pruebas de desarrollo.

- [ ] Control de Acceso Real: Reactivar el middleware auth para que solo usuarios logueados con rol artist puedan publicar.

### 🎨 Frontend (React + Inertia)
- [x] Formulario de Registro Extendido: Campos de Nombre, Apellidos, Nickname y selector de Rol (Artista/Espectador).

- [x] Integración de Estilos: Uso de componentes de Breeze (InputLabel, TextInput, PrimaryButton) para mantener la coherencia visual.

- [ ] Formulario de Creación de Eventos: Crear la vista .jsx que envíe los datos a la ruta que hemos probado en Postman.

- [ ] Feedback de Usuario: Mostrar mensajes de éxito o error tras intentar crear un evento.

### 🤝 Trabajo en Equipo y Calidad
- [x] Sistema de Codificación Común: Integración de la lógica de perfiles de Irene en la validación de creación de eventos.

- [x] Control de Versiones: Resolución de conflictos de merge en archivos clave (README.md, package-lock.json).

- [ ] Documentación Técnica: Actualizar el README.md con las instrucciones para levantar el proyecto con Docker y las rutas de la API.