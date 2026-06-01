# Documentación de Libitum

Documentación completa del proyecto **Libitum**, una plataforma para artistas de calle y música en vivo. Cada informe explica una parte del proyecto: qué es, cómo está hecho, por qué es así, en qué punto está y a dónde va.

> Los diagramas están en **Mermaid**: se ven como gráficos en GitHub y se pueden exportar a PDF.

## Índice de informes

| Nº | Informe | Contenido |
|---|---|---|
| 0 | [Visión general y arquitectura](00-vision-general.md) | El mapa de todo: stack, arquitectura y cómo encaja cada pieza |
| 1 | [Base de datos y modelo de datos](01-base-de-datos.md) | Tablas, relaciones, diagrama E-R, migraciones y seeders |
| 2 | [Backend](02-backend.md) | Controladores, rutas, middleware, validación y el estado automático del evento |
| 3 | [Seguridad y autenticación](03-seguridad.md) | Tokens, verificación de correo, recuperar contraseña, roles, rate-limit, CORS, RGPD |
| 4 | [Frontend](04-frontend.md) | Páginas, componentes, contextos, hooks, enrutado y guards |
| 5 | [Configuración y librerías externas](05-configuracion-librerias.md) | Dependencias, ficheros de config, variables de entorno y la PWA |
| 6 | [Batch / tareas programadas](06-batch-tareas-programadas.md) | El comando de recordatorios, la ventana de 48h y el cron |
| 7 | [Tests](07-tests.md) | La batería de 47 tests automáticos y cómo funcionan |
| 8 | [Despliegue](08-despliegue.md) | Railway, Vercel, Neon, Brevo y el despliegue continuo |
| 9 | [Problemas encontrados y soluciones](09-problemas-soluciones.md) | Los bugs reales y los cambios de tecnología |
| 10 | [Decisiones de funcionalidad](10-decisiones-funcionalidad.md) | El porqué de lo que hace la app |
| 11 | [Diseño y experiencia de usuario](11-diseno-ux.md) | Paleta, tipografía, estilo editorial y detalles de UX |
| 12 | [Situación real y mejoras previstas](12-situacion-mejoras.md) | Estado honesto, capacidad y hoja de ruta |
| 13 | [Monetización](13-monetizacion.md) | El enfoque empresarial del proyecto |
| 14 | [Impacto en los artistas y pagos](14-impacto-artistas-pagos.md) | El porqué humano y el planteamiento de los pagos |

## Cómo leerlos

- **En GitHub:** se ven directamente, con los diagramas renderizados.
- **En VS Code:** con la extensión *Markdown Preview Mermaid Support* para ver los diagramas; *Markdown PDF* para exportar a PDF.
- **Recomendado:** empezar por el **Informe 0**, que da la visión de conjunto.
