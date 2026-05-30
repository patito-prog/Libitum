import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BackButton from "../../components/common/BackButton.jsx";
import useAPI from "../../hooks/useAPI.js";
import useAuthContext from "../../hooks/useAuthContext.js";
import useMessageContext from "../../hooks/useMessageContext.js";
import API_BASE from "../../config/api.js";
import Loader from "../../components/common/Loader.jsx";
import ArtistHero from "../../components/profile/ArtistHero.jsx";
import ArtistEditForm from "../../components/profile/ArtistEditForm.jsx";
import ArtistPublicView from "../../components/profile/ArtistPublicView.jsx";
import ArtistEventsSection from "../../components/profile/ArtistEventsSection.jsx";
import styles from "./ArtistProfile.module.scss";

const EMPTY_FORM = {
    bio: "", spotify_url: "", instagram_url: "",
    youtube_url: "", tiktok_url: "", donation_url: "", bizum_phone: "",
};

/**
 * Página pública del artista (/artist/:id) — la landing a la que apunta su QR.
 *
 * Es la cara "de cara al fan": banner, datos, redes, botón de donación y sus
 * próximos eventos. Si la abre el propio artista, puede editar su perfil y ver
 * una previsualización de cómo lo ven los demás.
 */
const ArtistProfile = () => {
    const { id } = useParams();
    const { getData, save, deleteData, patch, uploadFile, loading } = useAPI();
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
    const [avatarPreview, setAvatarPreview]     = useState(null);
    const [avatarUploading, setAvatarUploading] = useState(false);

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
                bio:           p.bio           ?? "",
                spotify_url:   p.spotify_url   ?? "",
                instagram_url: p.instagram_url ?? "",
                youtube_url:   p.youtube_url   ?? "",
                tiktok_url:    p.tiktok_url    ?? "",
                donation_url:  p.donation_url  ?? "",
                bizum_phone:   p.bizum_phone   ?? "",
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

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSaveLoading(true);
        try {
            await patch(`${API_BASE}/api/artist-profile`, profileForm);
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

    // Sube la foto de perfil del artista (mismo endpoint que el perfil social).
    const handleAvatarFile = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setAvatarPreview(URL.createObjectURL(file));
        setAvatarUploading(true);
        try {
            const fd = new FormData();
            fd.append('avatar', file);
            const res = await uploadFile(`${API_BASE}/api/profile/avatar`, fd);
            setArtist(prev => ({ ...prev, avatar_url: res.data.avatar_url }));
        } catch {
            showMessageWithTime('Error al subir la imagen. Comprueba el formato y tamaño.', 'error');
            setAvatarPreview(null);
        } finally {
            setAvatarUploading(false);
        }
    };

    const handleToggleEdit = () => { setEditMode(v => !v); setMobilePreview(false); };
    const handleCancel     = () => { setEditMode(false); setMobilePreview(false); setAvatarPreview(null); };

    if (loading && !artist) return <Loader />;
    if (!artist) return null;

    const isOwnProfile = user?.id === Number(id);
    const firstName    = artist.name?.split(' ')[0] ?? artist.name;

    return (
        <div className={styles.page}>

            <div className={styles.heroBanner}>
                <BackButton light />
                <span className={styles.bannerGhost} aria-hidden="true">
                    {(firstName || 'ARTISTA').toUpperCase()}
                </span>
            </div>

            <ArtistHero
                artist={artist}
                isOwnProfile={isOwnProfile}
                isFollowing={isFollowing}
                followLoading={followLoading}
                editMode={editMode}
                onToggleEdit={handleToggleEdit}
                onFollow={handleFollow}
            />

            {isOwnProfile && editMode && (
                <ArtistEditForm
                    artist={artist}
                    profileForm={profileForm}
                    onChange={e => setProfileForm(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                    onSave={handleSaveProfile}
                    saveLoading={saveLoading}
                    onCancel={handleCancel}
                    avatarPreview={avatarPreview}
                    avatarUploading={avatarUploading}
                    onAvatarFile={handleAvatarFile}
                    mobilePreview={mobilePreview}
                    onTogglePreview={() => setMobilePreview(v => !v)}
                />
            )}

            {!editMode && (
                <ArtistPublicView profile={artist.artist_profile} firstName={firstName} />
            )}

            <ArtistEventsSection events={artist.created_events} />
        </div>
    );
};

export default ArtistProfile;
