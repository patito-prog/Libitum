import React, {useState, useEffect} from "react";
import {useParams} from "react-router-dom";
import useAPI from "../../hooks/useAPI.js";
import useMessageContext from "../../hooks/useMessageContext.js";

const ArtistProfile = () => {
    const {id} = useParams();
    const [artist, setArtist] = useState(null);
    const {error, loading, getData} = useAPI();
    const {showMessage} = useMessageContext();
    useEffect(() => {
        const fetchArtistProfile = async() => {
            try {
                const data = await getData(`http://localhost:8000/api/artists/${id}`);
                setArtist(data);
            }catch(error){
                showMessage("No se ha podido cargar el perfil del artista.", "error");
            }
        };
        fetchArtistProfile();
    }, [id]);

    return (

        <div className="artist-profile-container">
            {/* CARGANDO, usar aquí el componente loading */}
            {loading && (
                <div className="loading-state">
                    <h2>Cargando artista...</h2>
                </div>
            )}

            {/* ERROR (Opcional: puedes quitar este bloque si tu showMessage ya lo muestra en un Toast flotante, igual que hiciste en el Login) */}
            {error && !loading && (
                <div className="error-state">
                    <h2>Vaya, parece que este artista no existe o hay un error.</h2>
                </div>
            )}

            {/* ÉXITO */}
            {!loading && !error && artist && (
                <div className="artist-details">
                    <img 
                        className="artist-photo"
                        src={artist.photo_url || 'https://via.placeholder.com/150'} 
                        alt={`Foto de ${artist.name}`} 
                    />
                    <h1 className="artist-name">{artist.name}</h1>
                    <p className="artist-bio">
                        {artist.bio || "Este artista aún no ha escrito su biografía."}
                    </p>

                    {artist.donation_url ? (
                        <a 
                            className="btn-donate"
                            href={artist.donation_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                        >
                            💖 Apoyar al artista
                        </a>
                    ) : (
                        <p className="no-donations-msg">Las donaciones no están configuradas aún.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default ArtistProfile;