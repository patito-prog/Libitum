import useMessageContext from '../../hooks/useMessageContext.js';

/**
 * Botón para compartir un evento. Comparte el enlace público del evento
 * (/event/:id) — que tiene más sentido que compartir la ubicación, porque
 * desde el evento ya se puede abrir el mapa.
 *
 * Usa el menú nativo de compartir del móvil (navigator.share) si existe; si no,
 * copia el enlace al portapapeles y avisa.
 *
 * @param {{ eventId:(number|string), title?:string, className?:string, children?:React.ReactNode }} props
 */
const ShareButton = ({ eventId, title, className, children }) => {
    const { showMessageWithTime } = useMessageContext();

    const share = async (e) => {
        e.stopPropagation();
        e.preventDefault();

        const url = `${window.location.origin}/event/${eventId}`;
        const shareData = {
            title: title ? `${title} · Libitum` : 'Evento en Libitum',
            text: '¡Mira este evento en Libitum!',
            url,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(url);
                showMessageWithTime('Enlace del evento copiado.', 'ok');
            }
        } catch {
            // El usuario canceló el compartir, o falló el portapapeles: sin ruido.
        }
    };

    return (
        <button type="button" className={className} onClick={share} title="Compartir evento">
            {children ?? 'Compartir'}
        </button>
    );
};

export default ShareButton;
