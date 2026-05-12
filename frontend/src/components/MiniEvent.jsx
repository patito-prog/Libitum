import styles from './MiniEvent.module.scss';
import appStyles from '../App.module.scss';

const MiniEvent = (props) => {
    const { user_id, id, title, slug, description, location, event_date, price, cover_image, max_capacity, status_id } = props.data;
    const {status} = props.data;
    return (
        <>
            <div id={id} className={`${styles.miniEvent} ${appStyles.cristal}`}>
                <div className={styles.identificacion}>
                    <p>{title && title}</p>
                    {/*Esta localización deberá ser la calle en pequeñito... */}
                    <p>{location && location}</p>
                </div>
                <div className="">
                    <p>{event_date && event_date}</p>
                    <p>{status_id && status.name}</p>
                </div>
            </div>
            
        </>
    )
}

export default MiniEvent;