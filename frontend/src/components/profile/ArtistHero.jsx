import styles from '../../pages/public/ArtistProfile.module.scss';

/**
 * Cabecera de la página pública del artista (avatar + nombre + seguidores).
 * El botón cambia según quién mire: "Editar perfil" si es el dueño, o
 * "Seguir/Siguiendo" si es un visitante.
 */
const ArtistHero = ({ artist, isOwnProfile, isFollowing, followLoading, editMode, onToggleEdit, onFollow }) => (
    <div className={styles.hero}>
        <div className={styles.avatarWrapper}>
            {artist.avatar_url
                ? <img src={artist.avatar_url} alt={artist.name} className={styles.avatar} />
                : <div className={styles.avatarPlaceholder}>{artist.name?.charAt(0).toUpperCase()}</div>
            }
        </div>

        <div className={styles.info}>
            <h1 className={styles.name}>{artist.name}</h1>
            {artist.city && <p className={styles.city}>📍 {artist.city}</p>}
            <p className={styles.followersCount}>
                <strong>{artist.total_followers}</strong>
                {artist.total_followers === 1 ? ' seguidor' : ' seguidores'}
            </p>

            {isOwnProfile ? (
                <button
                    className={`${styles.followBtn} ${editMode ? styles.following : ''}`}
                    onClick={onToggleEdit}
                >
                    {editMode ? '✕ Cancelar edición' : '✏️ Editar perfil'}
                </button>
            ) : (
                <button
                    className={`${styles.followBtn} ${isFollowing ? styles.following : ''}`}
                    onClick={onFollow}
                    disabled={followLoading}
                >
                    {followLoading ? '...' : isFollowing ? '✓ Siguiendo' : '+ Seguir'}
                </button>
            )}
        </div>
    </div>
);

export default ArtistHero;
