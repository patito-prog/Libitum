import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import useAPI from "../../hooks/useAPI.js";
import useAuthContext from "../../hooks/useAuthContext.js";
import useMessageContext from "../../hooks/useMessageContext.js";
import Loader from "../../components/common/Loader.jsx";
import UserListModal from "../../components/common/UserListModal.jsx";
import { formatDate, STATUS_LABELS } from "../../utils/validations";
import API_BASE from "../../config/api.js";
import styles from "./UserProfile.module.scss";

const SOCIAL_LINKS = [
    { key: "spotify_url",   icon: "🎵", label: "Spotify"   },
    { key: "instagram_url", icon: "📸", label: "Instagram" },
    { key: "youtube_url",   icon: "▶️", label: "YouTube"   },
    { key: "tiktok_url",    icon: "🎶", label: "TikTok"    },
];

const EMPTY_FORM = {
    name: '', email: '', city: '', avatar_url: '',
    bio: '', spotify_url: '', instagram_url: '', youtube_url: '', tiktok_url: '', donation_url: '',
};

const UserProfile = () => {
    const { id } = useParams();
    const { getData, save, deleteData, patch, uploadFile, loading } = useAPI();
    const { user, isAuthenticated, refreshUser } = useAuthContext();
    const { showMessageWithTime } = useMessageContext();
    const navigate = useNavigate();

    const [profile, setProfile]             = useState(null);
    const [isFollowing, setIsFollowing]     = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    const [editMode, setEditMode]           = useState(false);
    const [formData, setFormData]           = useState(EMPTY_FORM);
    const [saveLoading, setSaveLoading]     = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [pwForm, setPwForm] = useState({ current_password: '', password: '', password_confirmation: '' });
    const [pwLoading, setPwLoading] = useState(false);
    const [modal, setModal]           = useState(null);   // null | 'followers' | 'following'
    const [modalUsers, setModalUsers] = useState([]);
    const [modalLoading, setModalLoading] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await getData(`${API_BASE}/api/users/${id}`);
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
                await deleteData(`${API_BASE}/api/artist/${id}/unfollow`);
                setIsFollowing(false);
                setProfile(prev => ({ ...prev, followers_count: prev.followers_count - 1 }));
            } else {
                await save(`${API_BASE}/api/artist/${id}/follow`, {});
                setIsFollowing(true);
                setProfile(prev => ({ ...prev, followers_count: prev.followers_count + 1 }));
            }
        } catch {
            showMessageWithTime("No se pudo completar la acción.", "error");
        } finally {
            setFollowLoading(false);
        }
    };

    const openModal = async (type) => {
        setModal(type);
        setModalLoading(true);
        setModalUsers([]);
        try {
            const res = await getData(`${API_BASE}/api/users/${id}/${type}`);
            setModalUsers(res.data ?? []);
        } catch {
            showMessageWithTime('No se pudo cargar la lista.', 'error');
            setModal(null);
        } finally {
            setModalLoading(false);
        }
    };

    const handlePwChange = (e) => {
        const { name, value } = e.target;
        setPwForm(prev => ({ ...prev, [name]: value }));
    };

    const handlePwSave = async (e) => {
        e.preventDefault();
        if (pwForm.password !== pwForm.password_confirmation) {
            showMessageWithTime('Las contraseñas no coinciden.', 'error');
            return;
        }
        setPwLoading(true);
        try {
            await patch(`${API_BASE}/api/profile/password`, pwForm);
            showMessageWithTime('Contraseña actualizada correctamente.', 'success');
            setPwForm({ current_password: '', password: '', password_confirmation: '' });
        } catch (err) {
            showMessageWithTime(err.message || 'Error al cambiar la contraseña.', 'error');
        } finally {
            setPwLoading(false);
        }
    };

    const openEdit = () => {
        const ap = profile.artist_profile;
        setFormData({
            name:          profile.name         ?? '',
            email:         profile.email        ?? '',
            city:          profile.city         ?? '',
            avatar_url:    profile.avatar_url   ?? '',
            bio:           ap?.bio              ?? '',
            spotify_url:   ap?.spotify_url      ?? '',
            instagram_url: ap?.instagram_url    ?? '',
            youtube_url:   ap?.youtube_url      ?? '',
            tiktok_url:    ap?.tiktok_url       ?? '',
            donation_url:  ap?.donation_url     ?? '',
        });
        setEditMode(true);
    };

    const handleAvatarFile = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setAvatarPreview(URL.createObjectURL(file));
        setAvatarUploading(true);
        try {
            const fd = new FormData();
            fd.append('avatar', file);
            const res = await uploadFile('${API_BASE}/api/profile/avatar', fd);
            setFormData(prev => ({ ...prev, avatar_url: res.data.avatar_url }));
            setProfile(prev => ({ ...prev, avatar_url: res.data.avatar_url }));
        } catch {
            showMessageWithTime('Error al subir la imagen. Comprueba el formato y tamaño.', 'error');
            setAvatarPreview(null);
        } finally {
            setAvatarUploading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaveLoading(true);
        try {
            await patch('${API_BASE}/api/profile', {
                name:       formData.name,
                email:      formData.email,
                city:       formData.city       || null,
                avatar_url: formData.avatar_url || null,
            });

            if (profile.role === 'artist') {
                await patch('${API_BASE}/api/artist-profile', {
                    bio:           formData.bio           || null,
                    spotify_url:   formData.spotify_url   || null,
                    instagram_url: formData.instagram_url || null,
                    youtube_url:   formData.youtube_url   || null,
                    tiktok_url:    formData.tiktok_url    || null,
                    donation_url:  formData.donation_url  || null,
                });
            }

            setProfile(prev => ({
                ...prev,
                name:       formData.name,
                email:      formData.email,
                city:       formData.city,
                avatar_url: formData.avatar_url,
                artist_profile: prev.artist_profile ? {
                    ...prev.artist_profile,
                    bio:           formData.bio,
                    spotify_url:   formData.spotify_url,
                    instagram_url: formData.instagram_url,
                    youtube_url:   formData.youtube_url,
                    tiktok_url:    formData.tiktok_url,
                    donation_url:  formData.donation_url,
                } : prev.artist_profile,
            }));

            await refreshUser();
            showMessageWithTime('Perfil actualizado correctamente.', 'success');
            setEditMode(false);
        } catch (err) {
            showMessageWithTime(err.message || 'Error al guardar los cambios.', 'error');
        } finally {
            setSaveLoading(false);
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
                            <button className={styles.statBtn} onClick={() => openModal('followers')}>
                                <strong>{profile.followers_count ?? 0}</strong>
                                <span>seguidores</span>
                            </button>
                            <button className={styles.statBtn} onClick={() => openModal('following')}>
                                <strong>{profile.following_count ?? 0}</strong>
                                <span>siguiendo</span>
                            </button>
                        </div>
                    ) : (
                        <div className={styles.stats}>
                            <div className={styles.stat}>
                                <strong>{profile.events_count ?? 0}</strong>
                                <span>eventos</span>
                            </div>
                            <button className={styles.statBtn} onClick={() => openModal('following')}>
                                <strong>{profile.following_count ?? 0}</strong>
                                <span>artistas siguiendo</span>
                            </button>
                        </div>
                    )}

                    {/* Botones de acción */}
                    <div className={styles.actions}>
                        {isOwnProfile ? (
                            <button className={styles.editBtn} onClick={openEdit}>✏️ Editar perfil</button>
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

            {/* ── FORMULARIO DE EDICIÓN ── */}
            {editMode && (
                <>
                <form className={styles.editForm} onSubmit={handleSave}>
                    <div className={styles.editSection}>
                        <h3 className={styles.editSectionTitle}>Información básica</h3>
                        <div className={styles.avatarEditRow}>
                            <div className={styles.avatarEditPreview}>
                                {(avatarPreview || formData.avatar_url) ? (
                                    <img src={avatarPreview || formData.avatar_url} alt="Vista previa" />
                                ) : (
                                    <span>{profile.name?.charAt(0).toUpperCase()}</span>
                                )}
                                {avatarUploading && <div className={styles.avatarUploadingOverlay}>↑</div>}
                            </div>
                            <div className={styles.avatarEditControls}>
                                <label className={styles.formLabel}>Foto de perfil</label>
                                <label className={styles.avatarPickBtn}>
                                    📷 Elegir imagen
                                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarFile} className={styles.fileInputHidden} />
                                </label>
                                <p className={styles.avatarPickHint}>JPG, PNG o WebP · Máx. 2 MB</p>
                            </div>
                        </div>

                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Nombre</label>
                                <input className={styles.formInput} name="name" value={formData.name} onChange={handleChange} required />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Email</label>
                                <input className={styles.formInput} type="email" name="email" value={formData.email} onChange={handleChange} required />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Ciudad</label>
                                <input className={styles.formInput} name="city" value={formData.city} onChange={handleChange} placeholder="Tu ciudad" />
                            </div>
                        </div>
                    </div>

                    {isArtist && (
                        <div className={styles.editSection}>
                            <h3 className={styles.editSectionTitle}>Perfil artístico</h3>
                            <div className={styles.formGrid}>
                                <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                                    <label className={styles.formLabel}>Biografía</label>
                                    <textarea className={styles.formTextarea} name="bio" value={formData.bio} onChange={handleChange} placeholder="Cuéntale al mundo quién eres..." />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>🎵 Spotify</label>
                                    <input className={styles.formInput} type="url" name="spotify_url" value={formData.spotify_url} onChange={handleChange} placeholder="https://open.spotify.com/..." />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>📸 Instagram</label>
                                    <input className={styles.formInput} type="url" name="instagram_url" value={formData.instagram_url} onChange={handleChange} placeholder="https://instagram.com/..." />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>▶️ YouTube</label>
                                    <input className={styles.formInput} type="url" name="youtube_url" value={formData.youtube_url} onChange={handleChange} placeholder="https://youtube.com/..." />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>🎶 TikTok</label>
                                    <input className={styles.formInput} type="url" name="tiktok_url" value={formData.tiktok_url} onChange={handleChange} placeholder="https://tiktok.com/@..." />
                                </div>
                                <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                                    <label className={styles.formLabel}>💛 Enlace de donación</label>
                                    <p className={styles.donationWarning}>Ko-fi, Buy Me a Coffee, PayPal, Patreon, GoFundMe o Twitch. Sin este enlace tus seguidores no podrán apoyarte económicamente.</p>
                                    <input className={styles.formInput} type="url" name="donation_url" value={formData.donation_url} onChange={handleChange} placeholder="https://ko-fi.com/..." />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className={styles.formActions}>
                        <button type="submit" className={styles.saveBtn} disabled={saveLoading}>
                            {saveLoading ? 'Guardando...' : 'Guardar cambios'}
                        </button>
                        <button type="button" className={styles.cancelEditBtn} onClick={() => { setEditMode(false); setAvatarPreview(null); }}>
                            Cancelar
                        </button>
                    </div>
                </form>

                <form className={styles.editForm} onSubmit={handlePwSave}>
                    <div className={styles.editSection}>
                        <h3 className={styles.editSectionTitle}>Cambiar contraseña</h3>
                        <div className={styles.formGrid}>
                            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                                <label className={styles.formLabel}>Contraseña actual</label>
                                <input className={styles.formInput} type="password" name="current_password" value={pwForm.current_password} onChange={handlePwChange} required />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Nueva contraseña</label>
                                <input className={styles.formInput} type="password" name="password" value={pwForm.password} onChange={handlePwChange} minLength={8} required />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Confirmar nueva contraseña</label>
                                <input className={styles.formInput} type="password" name="password_confirmation" value={pwForm.password_confirmation} onChange={handlePwChange} required />
                            </div>
                        </div>
                    </div>
                    <div className={styles.formActions}>
                        <button type="submit" className={styles.saveBtn} disabled={pwLoading}>
                            {pwLoading ? 'Guardando...' : 'Cambiar contraseña'}
                        </button>
                    </div>
                </form>
                </>
            )}

            {/* ── CONTENIDO ARTISTA ── */}
            {isArtist && (
                <>
                    {artistProfile?.donation_url && !isOwnProfile && !editMode && (
                        <div className={styles.donateBar}>
                            <p className={styles.donateBarText}>¿Te gusta su música?</p>
                            <a
                                href={artistProfile.donation_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.donateBarBtn}
                            >
                                💛 Apoyar a {profile.name?.split(' ')[0]}
                            </a>
                        </div>
                    )}

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
                                    <Link key={event.id} to={`/event/${event.id}`} className={styles.eventCard}>
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
                                                        {STATUS_LABELS[event.status.name] ?? event.status.name}
                                                    </span>
                                                )}
                                            </div>
                                            {event.event_date && (
                                                <p className={styles.eventMeta}>🗓 {formatDate(event.event_date)}</p>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}
                </>
            )}

            {/* ── CONTENIDO ESPECTADOR ── */}
            {!isArtist && (
                <>
                    {profile.events?.length > 0 ? (
                        <section className={styles.eventsSection}>
                            <h2 className={styles.sectionTitle}>Eventos</h2>
                            <div className={styles.eventsGrid}>
                                {profile.events.map(event => (
                                    <Link key={event.id} to={`/event/${event.id}`} className={styles.eventCard}>
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
                                                        {STATUS_LABELS[event.status.name] ?? event.status.name}
                                                    </span>
                                                )}
                                            </div>
                                            {event.event_date && (
                                                <p className={styles.eventMeta}>🗓 {formatDate(event.event_date)}</p>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    ) : (
                        <p className={styles.empty}>Este usuario no está apuntado a ningún evento todavía.</p>
                    )}
                </>
            )}

            {modal && (
                <UserListModal
                    title={modal === 'followers' ? 'Seguidores' : 'Siguiendo'}
                    users={modalUsers}
                    loading={modalLoading}
                    onClose={() => setModal(null)}
                />
            )}
        </div>
    );
};

export default UserProfile;
