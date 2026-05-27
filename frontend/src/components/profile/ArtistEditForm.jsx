import styles from '../../pages/public/ArtistProfile.module.scss';

const SOCIAL_LINKS = [
    { key: 'spotify_url',   icon: '🎵', label: 'Spotify',   placeholder: 'https://open.spotify.com/artist/...' },
    { key: 'instagram_url', icon: '📸', label: 'Instagram', placeholder: 'https://instagram.com/tu_usuario'    },
    { key: 'youtube_url',   icon: '▶️', label: 'YouTube',   placeholder: 'https://youtube.com/@tu_canal'       },
    { key: 'tiktok_url',    icon: '🎶', label: 'TikTok',    placeholder: 'https://tiktok.com/@tu_usuario'      },
];

const ArtistEditForm = ({
    artist, profileForm, onChange, onSave, saveLoading, onCancel,
    mobilePreview, onTogglePreview,
}) => {
    const firstName = artist.name?.split(' ')[0] ?? artist.name;

    return (
        <>
            <form className={styles.editForm} onSubmit={onSave}>
                <h2 className={styles.editTitle}>Editar perfil</h2>

                <div className={styles.formField}>
                    <label htmlFor="bio">Biografía</label>
                    <textarea id="bio" name="bio" value={profileForm.bio}
                        onChange={onChange} placeholder="Cuéntale al mundo quién eres..."
                        rows={4} className={styles.textarea} />
                </div>

                <div className={styles.formGrid}>
                    {SOCIAL_LINKS.map(({ key, icon, label, placeholder }) => (
                        <div key={key} className={styles.formField}>
                            <label htmlFor={key}>{icon} {label}</label>
                            <input type="url" id={key} name={key}
                                value={profileForm[key]} onChange={onChange}
                                placeholder={placeholder} className={styles.input} />
                        </div>
                    ))}
                </div>

                <div className={styles.donationEditBlock}>
                    <div className={styles.donationEditHeader}>
                        <span className={styles.donationEditIcon}>💰</span>
                        <div>
                            <p className={styles.donationEditTitle}>Enlace de donación</p>
                            <p className={styles.donationEditHint}>
                                Este es el enlace al que van tus fans cuando escanean tu QR.
                                {!profileForm.donation_url && ' ¡Aún no tienes uno configurado!'}
                            </p>
                        </div>
                    </div>
                    <input type="url" id="donation_url" name="donation_url"
                        value={profileForm.donation_url} onChange={onChange}
                        placeholder="https://buymeacoffee.com/tu_usuario"
                        className={`${styles.input} ${styles.donationEditInput}`} />
                    <p className={styles.donationEditPlatforms}>
                        Plataformas aceptadas: Ko-fi · Buy Me a Coffee · PayPal · Patreon · GoFundMe · Twitch
                    </p>
                </div>

                <div className={styles.formActions}>
                    <button type="button" className={styles.cancelBtn} onClick={onCancel}>
                        Cancelar
                    </button>
                    <button type="submit" className={styles.submitBtn} disabled={saveLoading}>
                        {saveLoading ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                </div>
            </form>

            <div className={styles.previewSection}>
                <button type="button" className={styles.previewToggle} onClick={onTogglePreview}>
                    {mobilePreview ? '✕ Cerrar vista' : '📱 Ver cómo te ven en el móvil'}
                </button>

                {mobilePreview && (
                    <div className={styles.phoneContainer}>
                        <div className={styles.phoneFrame}>
                            <div className={styles.phoneBar} />
                            <div className={styles.phoneScreen}>
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

                                <div className={styles.previewFollow}>+ Seguir</div>

                                {profileForm.bio && (
                                    <p className={styles.previewBio}>
                                        {profileForm.bio.slice(0, 80)}{profileForm.bio.length > 80 ? '…' : ''}
                                    </p>
                                )}

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
    );
};

export default ArtistEditForm;
