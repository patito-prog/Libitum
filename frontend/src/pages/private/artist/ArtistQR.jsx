import { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import useAuthContext from '../../../hooks/useAuthContext.js';
import BackButton from '../../../components/common/BackButton.jsx';
import styles from './ArtistQR.module.scss';

/**
 * Genera el código QR del artista, que apunta a su página pública (/artist/:id).
 * La idea es imprimirlo y ponerlo en la actuación para que el público lo escanee
 * y pueda donar. Permite descargarlo como PNG. Solo accesible para artistas.
 */
const ArtistQR = () => {
    const { user } = useAuthContext();
    const qrRef = useRef(null);

    const downloadQR = () => {
        const canvas = qrRef.current.querySelector('canvas');
        if (canvas) {
            const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
            const downloadLink = document.createElement("a");
            downloadLink.href = pngUrl;
            downloadLink.download = `QR_Libitum_${user.name}.png`; 
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
    };

    const profileUrl = user?.id ? `${window.location.origin}/artist/${user.id}` : "";

    return (
        <div className={styles.qrWrapper}>
            <div className={styles.qrBackRow}>
                <BackButton />
            </div>
            {!user && (
                <div className={styles.qrLoading}>
                    <p>Cargando información...</p>
                </div>
            )}

            {user && user.role !== 'artist' && (
                <div className={styles.qrErrorState}>
                    <h3>Acceso denegado</h3>
                    <p>Esta herramienta es exclusiva para los artistas registrados en Libitum.</p>
                </div>
            )}

            {user && user.role === 'artist' && (
                <div className={styles.qrContent}>
                    <h3 className={styles.qrTitle}>Tu Código QR</h3>
                    <p className={styles.qrDescription}>
                        Descarga este código e imprímelo para que tu público pueda hacerte donaciones fácilmente.
                    </p>
                    
                    <div className={styles.qrCanvasContainer} ref={qrRef}>
                        <QRCodeCanvas 
                            value={profileUrl} 
                            size={256} 
                            bgColor={"#ffffff"}
                            fgColor={"#000000"}
                            level={"H"} 
                            includeMargin={true} 
                        />
                    </div>

                    <button 
                        type="button" 
                        onClick={downloadQR} 
                        className={styles.btnDownload}
                    >
                        Descargar como PNG
                    </button>

                    <p className={styles.qrLink}>
                        <a href={profileUrl} target="_blank" rel="noopener noreferrer">
                            Ver cómo queda mi perfil público
                        </a>
                    </p>
                </div>
            )}
        </div>
    );
};

export default ArtistQR;