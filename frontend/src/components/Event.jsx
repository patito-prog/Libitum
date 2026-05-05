
const Event = (props) => {
    const {user_id, id,  title, slug, description, location, event_date, price, cover_image, max_capacity, status_id} = props.data;
    return (
        <>
            <div id={id} className="">
                <div className="">
                    <div className="">
                        <p>{title}</p>
                    </div>
                </div>
                <div className="">
                    <p>{description && description}</p>
                    <p>{event_date && event_date}</p>
                    <p>{location && location}</p>
                    <p>{price && price}</p>
                    <p>{max_capacity && max_capacity}</p>
                    <p>{status_id && status_id}</p>
                </div>
            </div>
        </>
    )
}

export default Event;