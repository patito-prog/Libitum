
const MiniEvents = (props) => {
    const { user_id, id, title, slug, description, location, event_date, price, cover_image, max_capacity, status_id } = props.data;
    return (
        <>
            <div id={id}>
                <div className="">
                    <p>{title && title}</p>
                    {/*Esta localización deberá ser la calle en pequeñito... */}
                    <p>{location && location}</p>
                </div>
                <div className="">
                    <p>{event_date && event_date}</p>
                    <p>{status_id && status_id}</p>
                </div>
            </div>
            
        </>
    )
}

export default MiniEvents;