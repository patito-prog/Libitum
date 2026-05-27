import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
                bio:           p.bio           ?? "",
                spotify_url:   p.spotify_url   ?? "",
                instagram_url: p.instagram_url ?? "",
                youtube_url:   p.youtube_url   ?? "",
                tiktok_url:    p.tiktok_url    ?? "",
                donation_url:  p.donation_url  ?? "",
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

    const handleToggleEdit = () => { setEditMode(v => !v); setMobilePreview(false); };
    const handleCancel     = () => { setEditMode(false); setMobilePreview(false); };

    if (loading && !artist) return <Loader />;
    if (!artist) return null;

    const isOwnProfile = user?.id === Number(id);
    const firstName    = artist.name?.split(' ')[0] ?? artist.name;

    return (
        <div className={styles.page}>

            <div className={styles.heroBanner} />

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
                    mobilePreview={mobilePreview}
                    onTogglePreview={() => setMobilePreview(v => !v)}
                />
            )}

            {!editMode && (
                <ArtistPublicView profile={artist.artist_profile} firstName={firstName} />
            )}

            <ArtistEventsSection events={artist.events} />
        </div>
    );
};

export default ArtistProfile;
