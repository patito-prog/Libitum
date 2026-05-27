import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import useAPI from "../../hooks/useAPI.js";
import useAuthContext from "../../hooks/useAuthContext.js";
import useMessageContext from "../../hooks/useMessageContext.js";
import Loader from "../../components/common/Loader.jsx";
import { formatDate } from "../../utils/validations";
import styles from "./UserProfile.module.scss";

const SOCIAL_LINKS = [
    { key: "spotify_url",   icon: "🎵", label: "Spotify"   },
    { key: "instagram_url", icon: "📸", label: "Instagram" },
    { key: "youtube_url",   icon: "▶️", label: "YouTube"   },
    { key: "tiktok_url",    icon: "🎶", label: "TikTok"    },
];

const UserProfile = () => {
    const { id } = useParams();
    const { getData, save, deleteData, loading } = useAPI();
    const { user, isAuthenticated } = useAuthContext();
    const { showMessageWithTime } = useMessageContext();
    const navigate = useNavigate();

    const [profile, setProfile]             = useState(null);
    const [isFollowing, setIsFollowing]     = useState(false);
    const [followLoading, setFollowLoading] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await getData(`http://localhost:8000/api/users/${id}`);
                setProfile(res.data);
                setIsFollowing(res.data.is_following ?? false);
            } catch {
                showMessageWithTime("No se ha podido cargar el perfil.", "error");
            }
        };
        fetch();
    }, [id]);

    const handleFollow = async () => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: `/user/${id}` } });
            return;
        }
        setFollowLoading(true);
        try {
            if (isFollowing) {
                await deleteData(`http://localhost:8000/api/artist/${id}/unfollow`);
                setIsFollowing(false);
                setProfile(prev => ({ ...prev, followers_count: prev.followers_count - 1 }));
            } else {
                await save(`http://localhost:8000/api/artist/${id}/follow`, {});
                setIsFollowing(true);
                setProfile(prev => ({ ...prev, followers_count: prev.followers_count + 1 }));
            }
        } catch {
            showMessageWithTime("No se pudo completar la acción.", "error");
        } finally {
            setFollowLoading(false);
        }
    };

    if (loading && !profile) return <Loader />;
    if (!profile) return null;

    const isOwnProfile = user?.id === Number(id);
    const artistProfile = profile.artist_profile;
    const isArtist = profile.role === 'artist';

    return (
        <div className={styles.page}>

            {/* ── CABECERA ── */}
            <div className={styles.header}>
                <div className={styles.avatarWrapper}>
                    {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt={profile.name} className={styles.avatar} />
                    ) : (
                        <div className={styles.avatarPlaceholder}>
                            {profile.name?.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>

                <div className={styles.headerInfo}>
                    <div className={styles.nameRow}>
                        <h1 className={styles.name}>{profile.name}</h1>
                        <span className={`${styles.roleBadge} ${styles[profile.role]}`}>
                            {profile.role === 'artist' ? '🎸 Artista' : '🎧 Espectador'}
                        </span>
                    </div>

                    {profile.city && <p className={styles.city}>📍 {profile.city}</p>}

                    {/* Stats */}
                    {isArtist ? (
                        <div className={styles.stats}>
                            <div className={styles.stat}>
                                <strong>{profile.events_count ?? 0}</strong>
                                <span>eventos</span>
                            </div>
                            <div className={styles.stat}>
                                <strong>{profile.followers_count ?? 0}</strong>
                                <span>seguidores</span>
                            </div>
                            <div className={styles.stat}>
                                <strong>{profile.following_count ?? 0}</strong>
                                <span>siguiendo</span>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.stats}>
                            <div className={styles.stat}>
                                <strong>{profile.following_count ?? 0}</strong>
                                <span>artistas siguiendo</span>
                            </div>
                            <div className={styles.stat}>
                                <strong>{profile.liked_count ?? 0}</strong>
                                <span>eventos favoritos</span>
                            </div>
                        </div>
                    )}

                    {/* Botones de acción */}
                    <div className={styles.actions}>
                        {isOwnProfile ? (
                            isArtist && (
                                <Link to={`/artist/${id}`} className={styles.editBtn}>
                                    ✏️ Editar perfil
                                </Link>
                            )
                        ) : (
                            isArtist && (
                                <button
                                    className={`${styles.followBtn} ${isFollowing ? styles.following : ''}`}
                                    onClick={handleFollow}
                                    disabled={followLoading}
                                >
                                    {followLoading ? '...' : isFollowing ? '✓ Siguiendo' : '+ Seguir'}
                                </button>
                            )
                        )}

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

            {/* ── CONTENIDO ARTISTA ── */}
            {isArtist && (
                <>
                    {artistProfile?.bio && (
                        <p className={styles.bio}>{artistProfile.bio}</p>
                    )}

                    {SOCIAL_LINKS.some(s => artistProfile?.[s.key]) && (
                        <div className={styles.socialRow}>
                            {SOCIAL_LINKS.map(({ key, icon, label }) =>
                                artistProfile?.[key] ? (
                                    <a key={key} href={artistProfile[key]} target="_blank"
                                        rel="noopener noreferrer" className={styles.socialChip}>
                                        {icon} {label}
                                    </a>
                                ) : null
                            )}
                        </div>
                    )}

                    {profile.events?.length > 0 && (
                        <section className={styles.eventsSection}>
                            <h2 className={styles.sectionTitle}>Eventos</h2>
                            <div className={styles.eventsGrid}>
                                {profile.events.map(event => (
                                    <div key={event.id} className={styles.eventCard}>
                                        {event.cover_image ? (
                                            <img src={event.cover_image} alt={event.title} className={styles.eventCover} />
                                        ) : (
                                            <div className={styles.eventCoverPlaceholder} />
                                        )}
                                        <div className={styles.eventInfo}>
                                            <div className={styles.eventTitleRow}>
                                                <p className={styles.eventTitle}>{event.title}</p>
                                                {event.status && (
                                                    <span className={`${styles.badge} ${styles[event.status.name]}`}>
                                                        {event.status.name}
                                                    </span>
                                                )}
                                            </div>
                                            {event.event_date && (
                                                <p className={styles.eventMeta}>🗓 {formatDate(event.event_date)}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </>
            )}

            {/* ── CONTENIDO ESPECTADOR ── */}
            {!isArtist && (
                <>
                    {profile.following?.length > 0 ? (
                        <section className={styles.eventsSection}>
                            <h2 className={styles.sectionTitle}>Artistas que sigue</h2>
                            <div className={styles.followingGrid}>
                                {profile.following.map(artist => (
                                    <Link key={artist.id} to={`/user/${artist.id}`} className={styles.artistCard}>
                                        <div className={styles.artistAvatar}>
                                            {artist.avatar_url
                                                ? <img src={artist.avatar_url} alt={artist.name} />
                                                : <span>{artist.name?.charAt(0).toUpperCase()}</span>
                                            }
                                        </div>
                                        <p className={styles.artistCardName}>{artist.name}</p>
                                        {artist.city && <p className={styles.artistCardCity}>{artist.city}</p>}
                                    </Link>
                                ))}
                            </div>
                        </section>
                    ) : (
                        <p className={styles.empty}>Este usuario aún no sigue a ningún artista.</p>
                    )}
                </>
            )}
        </div>
    );
};

export default UserProfile;
