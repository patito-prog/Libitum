import BizumCard from './BizumCard.jsx';
import styles from '../../pages/public/ArtistProfile.module.scss';

// Redes que mostramos como chips si el artista las ha rellenado.
const SOCIAL_LINKS = [
    { key: 'spotify_url',   icon: '🎵', label: 'Spotify'   },
    { key: 'instagram_url', icon: '📸', label: 'Instagram' },
    { key: 'youtube_url',   icon: '▶️', label: 'YouTube'   },
    { key: 'tiktok_url',    icon: '🎶', label: 'TikTok'    },
];

/** Vista pública del artista: bio, redes sociales y bloque de donación. */
const ArtistPublicView = ({ profile, firstName }) => (
    <>
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

        {profile?.bizum_phone && (
            <BizumCard phone={profile.bizum_phone} name={firstName} />
        )}

        {profile?.bio && (
            <div className={styles.bioCard}>
                <p>{profile.bio}</p>
            </div>
        )}

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
);

export default ArtistPublicView;
