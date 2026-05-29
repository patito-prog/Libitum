import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useAPI from "../../hooks/useAPI.js";
import useAuthContext from "../../hooks/useAuthContext.js";
import useMessageContext from "../../hooks/useMessageContext.js";
import Loader from "../../components/common/Loader.jsx";
import BackButton from "../../components/common/BackButton.jsx";
import UserListModal from "../../components/common/UserListModal.jsx";
import ProfileHeader from "../../components/profile/ProfileHeader.jsx";
import ProfileForms from "../../components/profile/ProfileForms.jsx";
import ProfileEventsGrid from "../../components/profile/ProfileEventsGrid.jsx";
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

/**
 * Perfil social de un usuario (/user/:id) — la versión "dentro de la app".
 *
 * Si es tu propio perfil, puedes editar tus datos, avatar y contraseña; si es
 * el de otro, puedes seguirlo (si es artista) y ver sus eventos/redes. Distingue
 * artista de espectador para mostrar bio, redes sociales y donaciones.
 */
const UserProfile = () => {
    const { id } = useParams();
    const { getData, save, deleteData, patch, uploadFile, loading } = useAPI();
    const { user, isAuthenticated, refreshUser } = useAuthContext();
    const { showMessageWithTime } = useMessageContext();
    const navigate = useNavigate();

    const [profile, setProfile]                 = useState(null);
    const [isFollowing, setIsFollowing]         = useState(false);
    const [followLoading, setFollowLoading]     = useState(false);
    const [editMode, setEditMode]               = useState(false);
    const [formData, setFormData]               = useState(EMPTY_FORM);
    const [saveLoading, setSaveLoading]         = useState(false);
    const [avatarPreview, setAvatarPreview]     = useState(null);
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [pwForm, setPwForm]   = useState({ current_password: '', password: '', password_confirmation: '' });
    const [pwLoading, setPwLoading]             = useState(false);
    const [modal, setModal]                     = useState(null);
    const [modalUsers, setModalUsers]           = useState([]);
    const [modalLoading, setModalLoading]       = useState(false);

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
        if (!isAuthenticated) { navigate('/login', { state: { from: `/user/${id}` } }); return; }
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

    const openEdit = () => {
        const ap = profile.artist_profile;
        setFormData({
            name: profile.name ?? '', email: profile.email ?? '', city: profile.city ?? '',
            avatar_url: profile.avatar_url ?? '',
            bio: ap?.bio ?? '', spotify_url: ap?.spotify_url ?? '', instagram_url: ap?.instagram_url ?? '',
            youtube_url: ap?.youtube_url ?? '', tiktok_url: ap?.tiktok_url ?? '', donation_url: ap?.donation_url ?? '',
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
            const res = await uploadFile(`${API_BASE}/api/profile/avatar`, fd);
            setFormData(prev => ({ ...prev, avatar_url: res.data.avatar_url }));
            setProfile(prev => ({ ...prev, avatar_url: res.data.avatar_url }));
        } catch {
            showMessageWithTime('Error al subir la imagen. Comprueba el formato y tamaño.', 'error');
            setAvatarPreview(null);
        } finally {
            setAvatarUploading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaveLoading(true);
        try {
            await patch(`${API_BASE}/api/profile`, {
                name: formData.name, email: formData.email,
                city: formData.city || null, avatar_url: formData.avatar_url || null,
            });
            if (profile.role === 'artist') {
                await patch(`${API_BASE}/api/artist-profile`, {
                    bio: formData.bio || null, spotify_url: formData.spotify_url || null,
                    instagram_url: formData.instagram_url || null, youtube_url: formData.youtube_url || null,
                    tiktok_url: formData.tiktok_url || null, donation_url: formData.donation_url || null,
                });
            }
            setProfile(prev => ({
                ...prev,
                name: formData.name, email: formData.email,
                city: formData.city, avatar_url: formData.avatar_url,
                artist_profile: prev.artist_profile ? { ...prev.artist_profile, ...formData } : prev.artist_profile,
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

    if (loading && !profile) return <Loader />;
    if (!profile) return null;

    const isOwnProfile  = user?.id === Number(id);
    const artistProfile = profile.artist_profile;
    const isArtist      = profile.role === 'artist';

    return (
        <div className={styles.page}>

            {!isOwnProfile && <BackButton />}

            <ProfileHeader
                profile={profile}
                isOwnProfile={isOwnProfile}
                isArtist={isArtist}
                isFollowing={isFollowing}
                followLoading={followLoading}
                artistProfile={artistProfile}
                onFollow={handleFollow}
                onEdit={openEdit}
                onOpenModal={openModal}
            />

            {editMode && (
                <ProfileForms
                    formData={formData}
                    onChange={e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                    onSave={handleSave}
                    saveLoading={saveLoading}
                    onCancel={() => { setEditMode(false); setAvatarPreview(null); }}
                    isArtist={isArtist}
                    profile={profile}
                    avatarPreview={avatarPreview}
                    avatarUploading={avatarUploading}
                    onAvatarFile={handleAvatarFile}
                    pwForm={pwForm}
                    onPwChange={e => setPwForm(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                    onPwSave={handlePwSave}
                    pwLoading={pwLoading}
                />
            )}

            {isArtist && (
                <>
                    {artistProfile?.bio && <p className={styles.bio}>{artistProfile.bio}</p>}

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

                    <ProfileEventsGrid events={profile.events} />
                </>
            )}

            {!isArtist && (
                profile.events?.length > 0
                    ? <ProfileEventsGrid events={profile.events} />
                    : <p className={styles.empty}>Este usuario no está apuntado a ningún evento todavía.</p>
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
