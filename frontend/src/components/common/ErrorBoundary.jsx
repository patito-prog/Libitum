import { Component } from 'react';
import styles from './ErrorBoundary.module.scss';

/**
 * Red de seguridad para errores de React. Si algo revienta al renderizar
 * (incluido el típico fallo al descargar un "chunk" de código en conexiones
 * lentas), en vez de dejar la pantalla en blanco mostramos un aviso con botón
 * de recargar.
 *
 * Para los errores de carga de chunk (ChunkLoadError) recargamos solos una vez
 * — suele pasar tras un despliegue nuevo o un corte de red, y al recargar se
 * bajan los archivos actualizados.
 */
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error) {
        const msg = String(error?.message ?? error);
        const isChunkError =
            /chunk|dynamically imported module|Failed to fetch|importing a module script/i.test(msg);

        // Si es un fallo de descarga de código, recargamos automáticamente una
        // sola vez (usamos sessionStorage para no entrar en bucle de recargas).
        if (isChunkError && !sessionStorage.getItem('chunkReloaded')) {
            sessionStorage.setItem('chunkReloaded', '1');
            window.location.reload();
        }
    }

    handleReload = () => {
        sessionStorage.removeItem('chunkReloaded');
        window.location.reload();
    };

    render() {
        if (!this.state.hasError) return this.props.children;

        return (
            <div className={styles.wrap}>
                <span className={styles.icon} aria-hidden="true">🎸</span>
                <h1 className={styles.title}>Se nos ha desafinado algo</h1>
                <p className={styles.text}>
                    Ha habido un problema al cargar esta parte. No te preocupes, casi
                    siempre se arregla recargando.
                </p>
                <button className={styles.btn} onClick={this.handleReload}>
                    Recargar la página
                </button>
            </div>
        );
    }
}

export default ErrorBoundary;
