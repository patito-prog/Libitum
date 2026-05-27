import styles from '../../pages/public/UserProfile.module.scss';

const ProfileHeader = ({
    profile, isOwnProfile, isArtist,
    isFollowing, followLoading, artistProfile,
    onFollow, onEdit, onOpenModal,
}) => (
    <div className={styles.header}>
        <div className={styles.avatarWrapper}>
            {profile.avatar_url
                ? <img src={profile.avatar_url} alt={profile.name} className={styles.avatar} />
                : <div className={styles.avatarPlaceholder}>{profile.name?.charAt(0).toUpperCase()}</div>
            }
        </div>

        <div className={styles.headerInfo}>
            <div className={styles.nameRow}>
                <h1 className={styles.name}>{profile.name}</h1>
                <span className={`${styles.roleBadge} ${styles[profile.role]}`}>
                    {isArtist ? '🎸 Artista' : '🎧 Espectador'}
                </span>
            </div>

            {profile.city && <p className={styles.city}>📍 {profile.city}</p>}

            <div className={styles.stats}>
                <div className={styles.stat}>
                    <strong>{profile.events_count ?? 0}</strong>
                    <span>eventos</span>
                </div>
                {isArtist && (
                    <button className={styles.statBtn} onClick={() => onOpenModal('followers')}>
                        <strong>{profile.followers_count ?? 0}</strong>
                        <span>seguidores</span>
                    </button>
                )}
                <button className={styles.statBtn} onClick={() => onOpenModal('following')}>
                    <strong>{profile.following_count ?? 0}</strong>
                    <span>{isArtist ? 'siguiendo' : 'artistas siguiendo'}</span>
                </button>
            </div>

            <div className={styles.actions}>
                {isOwnProfile
                    ? <button className={styles.editBtn} onClick={onEdit}>✏️ Editar perfil</button>
                    : isArtist && (
                        <button
                            className={`${styles.followBtn} ${isFollowing ? styles.following : ''}`}
                            onClick={onFollow}
                            disabled={followLoading}
                        >
                            {followLoading ? '...' : isFollowing ? '✓ Siguiendo' : '+ Seguir'}
                        </button>
                    )
                }
                {isArtist && artistProfile?.donation_url && !isOwnProfile && (
                    <a
                        href={artistProfile.donation_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.donateBtn}
                    >
                        💛 Donar
                    </a>
                )}
            </div>
        </div>
    </div>
);

export default ProfileHeader;
