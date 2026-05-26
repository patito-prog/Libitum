import styles from './MiniEvent.module.scss';
import appStyles from '../App.module.scss';
import { formatDate } from '../utils/validations';
import useEventContext from "../hooks/useEventContext.js";
import MiniEventSkeleton from './common/MiniEvenSkeleton.jsx';
//LO MISMO QUE EN EL COMPONENTE EVENT, HE MODIFICADO COSAS PARA AÑADIR EL SISTEMA DE LIKES, OBVIAMENTE PUEDES CAMBIARLO COMO QUIERAS, LO QUE IMPORTA ES LA LÓGICA QUE ESTÁ LISTA.
const MiniEvent = ({ data, onClick, onLike }) => {
    
    const { id, title, location, event_date, status, liked } = data;
    const statusName = status?.name ?? '';
    
    const { toggleLike } = useEventContext();
    
    const handleLikeClick = (e) => {
        e.stopPropagation();
        //Si el padre nos da una orden (onLike), la ejecutamos. Si no, usamos la general.
        if (onLike) {
            onLike(id);
        } else {
            toggleLike(id);
        }
    };
   
    return (
        <div id={id} className={`${styles.card} ${appStyles.cristal}`} onClick={onClick}>
            <div className={styles.headerRow}>
                <p className={styles.title}>{title}</p>
                <button 
                    className={styles.likeBtn}
                    onClick={handleLikeClick}
                    title={liked ? "Quitar me gusta" : "Me gusta"}
                >
                   
                    {liked ? "❤️" : "🤍"}
                </button>
            </div>
            <p className={styles.location}>📍 {location}</p>
            <div className={styles.footer}>
                <span className={styles.date}>🗓 {formatDate(event_date)}</span>
                <span className={`${styles.badge} ${styles[statusName]}`}>{statusName}</span>
            </div>
        </div>
    );
};

export default MiniEvent;
