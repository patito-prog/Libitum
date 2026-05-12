

const FloatingOptionsSelect = (props) => {
    const options = props.data;
    return(
        <>
            {
                options && options.length > 0 &&
                options.map((option) => {
                    return <option value={option.id} key={`${option.id}-${option.name}`}>{option.name}</option>
                })
            }
        </>
    )
}

export default FloatingOptionsSelect;