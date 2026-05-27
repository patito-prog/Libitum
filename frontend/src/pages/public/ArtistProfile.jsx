import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useAPI from "../../hooks/useAPI.js";
import useAuthContext from "../../hooks/useAuthContext.js";
import useMessageContext from "../../hooks/useMessageContext.js";
import API_BASE from "../../config/api.js";
import Loader from "../../components/common/Loader.jsx";
import { formatDate } from "../../utils/validations";
import styles from "./ArtistProfile.module.scss";

const SOCIAL_LINKS = [
    { key: "spotify_url",   icon: "🎵", label: "Spotify",   placeholder: "https://open.spotify.com/artist/..."  },
    { key: "instagram_url", icon: "📸", label: "Instagram", placeholder: "https://instagram.com/tu_usuario"     },
    { key: "youtube_url",   icon: "▶️", label: "YouTube",   placeholder: "https://youtube.com/@tu_canal"        },
    { key: "tiktok_url",    icon: "🎶", label: "TikTok",    placeholder: "https://tiktok.com/@tu_usuario"       },
];

const EMPTY_FORM = {
    bio: "", spotify_url: "", instagram_url: "",
    youtube_url: "", tiktok_url: "", donation_url: "",
};

const ArtistProfile = () => {
    const { id } = useParams();
    const { getData, save, deleteData, patch, loading } = useAPI();
    const { user, isAuthenticated } = useAuthContext();
    const { showMessageWithTime } = useMessageContext();
    const navigate = useNavigate();

    const [artist, setArtist]               = useState(null);
    const [isFollowing, setIsFollowing]     = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    const [editMode, setEditMode]           = useState(false);
    const [mobilePreview, setMobilePreview] = useState(false);
    const [profileForm, setProfileForm]     = useState(EMPTY_FORM);
    const [saveLoading, setSaveLoading]     = useState(false);

    useEffect(() => {
        const fetchArtist = async () => {
            try {
                const res = await getData(`${API_BASE}/api/artists/${id}`);
                setArtist(res.data);
                setIsFollowing(res.data.is_following);
            } catch {
                showMessageWithTime("No se ha podido cargar el perfil del artista.", "error");
            }
        };
        fetchArtist();
    }, [id]);

    useEffect(() => {
        if (artist?.artist_profile) {
            const p = artist.artist_profile;
            setProfileForm({
                bio:          p.bio           ?? "",
                spotify_url:  p.spotify_url   ?? "",
                instagram_url:p.instagram_url ?? "",
                youtube_url:  p.youtube_url   ?? "",
                tiktok_url:   p.tiktok_url    ?? "",
                donation_url: p.donation_url  ?? "",
            });
        }
    }, [artist]);

    const handleFollow = async () => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: `/artist/${id}` } });
            return;
        }
        setFollowLoading(true);
        try {
            if (isFollowing) {
                await deleteData(`${API_BASE}/api/artist/${id}/unfollow`);
                setIsFollowing(false);
                setArtist(prev => ({ ...prev, total_followers: prev.total_followers - 1 }));
            } else {
                await save(`${API_BASE}/api/artist/${id}/follow`, {});
                setIsFollowing(true);
                setArtist(prev => ({ ...prev, total_followers: prev.total_followers + 1 }));
            }
        } catch {
            showMessageWithTime("No se pudo completar la acción.", "error");
        } finally {
            setFollowLoading(false);
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setProfileForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSaveLoading(true);
        try {
            await patch("${API_BASE}/api/artist-profile", profileForm);
            setArtist(prev => ({
                ...prev,
                artist_profile: { ...prev.artist_profile, ...profileForm },
            }));
            setEditMode(false);
            setMobilePreview(false);
            showMessageWithTime("Perfil actualizado correctamente.", "ok");
        } catch {
            showMessageWithTime("Error al guardar el perfil.", "error");
        } finally {
            setSaveLoading(false);
        }
    };

    if (loading && !artist) return <Loader />;
    if (!artist) return null;

    const profile      = artist.artist_profile;
    const isOwnProfile = user?.id === Number(id);
    const firstName    = artist.name?.split(' ')[0] ?? artist.name;

    return (
        <div className={styles.page}>

            {/* ── HERO ── */}
            <div className={styles.hero}>
                <div className={styles.avatarWrapper}>
                    {artist.avatar_url ? (
                        <img src={artist.avatar_url} alt={artist.name} className={styles.avatar} />
                    ) : (
                        <div className={styles.avatarPlaceholder}>
                            {artist.name?.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>

                <div className={styles.info}>
                    <h1 className={styles.name}>{artist.name}</h1>
                    {artist.city && <p className={styles.city}>📍 {artist.city}</p>}
                    <p className={styles.followersCount}>
                        <strong>{artist.total_followers}</strong>
                        {artist.total_followers === 1 ? " seguidor" : " seguidores"}
                    </p>

                    {isOwnProfile ? (
                        <button
                            className={`${styles.followBtn} ${editMode ? styles.following : ""}`}
                            onClick={() => { setEditMode(v => !v); setMobilePreview(false); }}
                        >
                            {editMode ? "✕ Cancelar edición" : "✏️ Editar perfil"}
                        </button>
                    ) : (
                        <button
                            className={`${styles.followBtn} ${isFollowing ? styles.following : ""}`}
                            onClick={handleFollow}
                            disabled={followLoading}
                        >
                            {followLoading ? "..." : isFollowing ? "✓ Siguiendo" : "+ Seguir"}
                        </button>
                    )}
                </div>
            </div>

            {/* ── FORMULARIO DE EDICIÓN ── */}
            {isOwnProfile && editMode && (
                <>
                    <form className={styles.editForm} onSubmit={handleSaveProfile}>
                        <h2 className={styles.editTitle}>Editar perfil</h2>

                        <div className={styles.formField}>
                            <label htmlFor="bio">Biografía</label>
                            <textarea id="bio" name="bio" value={profileForm.bio}
                                onChange={handleFormChange} placeholder="Cuéntale al mundo quién eres..."
                                rows={4} className={styles.textarea} />
                        </div>

                        <div className={styles.formGrid}>
                            {SOCIAL_LINKS.map(({ key, icon, label, placeholder }) => (
                                <div key={key} className={styles.formField}>
                                    <label htmlFor={key}>{icon} {label}</label>
                                    <input type="url" id={key} name={key}
                                        value={profileForm[key]} onChange={handleFormChange}
                                        placeholder={placeholder} className={styles.input} />
                                </div>
                            ))}
                        </div>

                        {/* Donation URL — campo destacado */}
                        <div className={styles.donationEditBlock}>
                            <div className={styles.donationEditHeader}>
                                <span className={styles.donationEditIcon}>💰</span>
                                <div>
                                    <p className={styles.donationEditTitle}>Enlace de donación</p>
                                    <p className={styles.donationEditHint}>
                                        Este es el enlace al que van tus fans cuando escanean tu QR.
                                        {!profileForm.donation_url && " ¡Aún no tienes uno configurado!"}
                                    </p>
                                </div>
                            </div>
                            <input type="url" id="donation_url" name="donation_url"
                                value={profileForm.donation_url} onChange={handleFormChange}
                                placeholder="https://buymeacoffee.com/tu_usuario"
                                className={`${styles.input} ${styles.donationEditInput}`} />
                            <p className={styles.donationEditPlatforms}>
                                Plataformas aceptadas: Ko-fi · Buy Me a Coffee · PayPal · Patreon · GoFundMe · Twitch
                            </p>
                        </div>

                        <div className={styles.formActions}>
                            <button type="button" className={styles.cancelBtn} onClick={() => { setEditMode(false); setMobilePreview(false); }}>
                                Cancelar
                            </button>
                            <button type="submit" className={styles.submitBtn} disabled={saveLoading}>
                                {saveLoading ? "Guardando..." : "Guardar cambios"}
                            </button>
                        </div>
                    </form>

                    {/* PREVIEW MÓVIL */}
                    <div className={styles.previewSection}>
                        <button
                            type="button"
                            className={styles.previewToggle}
                            onClick={() => setMobilePreview(v => !v)}
                        >
                            {mobilePreview ? "✕ Cerrar vista" : "📱 Ver cómo te ven en el móvil"}
                        </button>

                        {mobilePreview && (
                            <div className={styles.phoneContainer}>
                                <div className={styles.phoneFrame}>
                                    <div className={styles.phoneBar} />
                                    <div className={styles.phoneScreen}>
                                        {/* Identity */}
                                        <div className={styles.previewHero}>
                                            <div className={styles.previewAvatar}>
                                                {artist.avatar_url
                                                    ? <img src={artist.avatar_url} alt="" />
                                                    : <span>{artist.name?.charAt(0).toUpperCase()}</span>
                                                }
                                            </div>
                                            <div className={styles.previewInfo}>
                                                <p className={styles.previewName}>{artist.name}</p>
                                                <p className={styles.previewFollowers}>{artist.total_followers} seguidores</p>
                                            </div>
                                        </div>

                                        {/* Donation CTA */}
                                        {profileForm.donation_url ? (
                                            <div className={styles.previewDonate}>
                                                <p className={styles.previewDonateTag}>Cada contribución importa</p>
                                                <div className={styles.previewDonateBtn}>
                                                    💛 Apoyar a {firstName}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className={styles.previewNoDonate}>
                                                ⚠️ Sin enlace de donación
                                            </div>
                                        )}

                                        {/* Follow */}
                                        <div className={styles.previewFollow}>+ Seguir</div>

                                        {/* Bio snippet */}
                                        {profileForm.bio && (
                                            <p className={styles.previewBio}>
                                                {profileForm.bio.slice(0, 80)}{profileForm.bio.length > 80 ? '…' : ''}
                                            </p>
                                        )}

                                        {/* Redes sociales */}
                                        {SOCIAL_LINKS.some(s => profileForm[s.key]) && (
                                            <div className={styles.previewSocials}>
                                                {SOCIAL_LINKS.filter(s => profileForm[s.key]).map(({ key, icon, label }) => (
                                                    <div key={key} className={styles.previewSocialChip}>
                                                        {icon} {label}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <p className={styles.previewCaption}>
                                    Así ven tu perfil los fans al escanear tu QR
                                </p>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* ── VISTA PÚBLICA ── */}
            {!editMode && (
                <>
                    {/* DONACIÓN — protagonista de la página */}
                    {profile?.donation_url && (
                        <div className={styles.donateSection}>
                            <p className={styles.donateTagline}>
                                Cada contribución permite a {firstName} seguir creando
                            </p>
                            <a
                                href={profile.donation_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.donateBtnHero}
                            >
                                💛 Apoyar a {firstName}
                            </a>
                            <p className={styles.donateDisclaimer}>Sin comisiones · Pago seguro</p>
                        </div>
                    )}

                    {/* BIO */}
                    {profile?.bio && (
                        <div className={styles.bioCard}>
                            <p>{profile.bio}</p>
                        </div>
                    )}

                    {/* REDES SOCIALES */}
                    {SOCIAL_LINKS.some(s => profile?.[s.key]) && (
                        <div className={styles.linksRow}>
                            {SOCIAL_LINKS.map(({ key, icon, label }) =>
                                profile?.[key] ? (
                                    <a key={key} href={profile[key]} target="_blank"
                                        rel="noopener noreferrer" className={styles.socialLink}>
                                        {icon} {label}
                                    </a>
                                ) : null
                            )}
                        </div>
                    )}
                </>
            )}

            {/* ── EVENTOS ── */}
            <section className={styles.eventsSection}>
                <h2>Próximos eventos</h2>
                {artist.events?.length > 0 ? (
                    <div className={styles.eventsGrid}>
                        {artist.events.map(event => (
                            <div key={event.id} className={styles.eventCard}>
                                {event.cover_image && (
                                    <img src={event.cover_image} alt={event.title} className={styles.eventCover} />
                                )}
                                <div className={styles.eventBody}>
                                    <div className={styles.eventHeader}>
                                        <h3 className={styles.eventTitle}>{event.title}</h3>
                                        {event.status && (
                                            <span className={`${styles.badge} ${styles[event.status.name]}`}>
                                                {event.status.name}
                                            </span>
                                        )}
                                    </div>
                                    {event.event_date && <p className={styles.eventMeta}>🗓 {formatDate(event.event_date)}</p>}
                                    {event.location && <p className={styles.eventMeta}>📍 {event.location}</p>}
                                    <p className={styles.eventPrice}>
                                        {Number(event.price) > 0
                                            ? `💶 ${Number(event.price).toFixed(2)} €`
                                            : "Entrada gratuita"}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className={styles.noEvents}>Este artista no tiene eventos publicados por ahora.</p>
                )}
            </section>
        </div>
    );
};

export default ArtistProfile;
