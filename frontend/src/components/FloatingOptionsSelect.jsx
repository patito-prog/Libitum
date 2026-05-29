/**
 * Pinta las <option> de un select a partir de un array [{id, name}].
 * Pensado para meterse como children dentro de un FloatingSelect.
 */
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