
const Event = (props) => {
    const {user_id, id,  title, slug, description, location, event_date, price, cover_image, max_capacity, status_id} = props.data;
    const {status} = props.data;

    return (
        <>
            <div id={id} className="event-detail">
                <div className="">
                    <div className="">
                        <p>{title && title}</p>
                    </div>
                </div>
                <div className="">
                    <p>{description && description}</p>
                    <p>{event_date && event_date}</p>
                    <p>{location && location}</p>
                    <p>Precio: {price && price}</p>
                    {max_capacity && <p>Capacidad máxima: {max_capacity}</p>}
                    <p>Estado: {status && status.name}</p>
                </div>
            </div>
        </>
    )
}

export default Event;