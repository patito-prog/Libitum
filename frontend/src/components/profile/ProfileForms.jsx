import styles from '../../pages/public/UserProfile.module.scss';

const SOCIAL_INPUTS = [
    { key: 'spotify_url',   label: '🎵 Spotify',   placeholder: 'https://open.spotify.com/...' },
    { key: 'instagram_url', label: '📸 Instagram',  placeholder: 'https://instagram.com/...'    },
    { key: 'youtube_url',   label: '▶️ YouTube',    placeholder: 'https://youtube.com/...'      },
    { key: 'tiktok_url',    label: '🎶 TikTok',     placeholder: 'https://tiktok.com/@...'      },
];

/**
 * Formulario de edición del perfil: datos básicos + avatar y campos de artista
 * (bio, redes, donación). El cambio de contraseña va en su propio apartado
 * (PasswordForm), no aquí. Es presentacional: recibe estado y handlers por props.
 */
const ProfileForms = ({
    formData, onChange, onSave, saveLoading, onCancel,
    isArtist, profile,
    avatarPreview, avatarUploading, onAvatarFile,
}) => (
    <>
        {/* ── FORMULARIO INFO ── */}
        <form className={styles.editForm} onSubmit={onSave}>
            <div className={styles.editSection}>
                <h3 className={styles.editSectionTitle}>Información básica</h3>

                <div className={styles.avatarEditRow}>
                    <div className={styles.avatarEditPreview}>
                        {(avatarPreview || formData.avatar_url)
                            ? <img src={avatarPreview || formData.avatar_url} alt="Vista previa" />
                            : <span>{profile.name?.charAt(0).toUpperCase()}</span>
                        }
                        {avatarUploading && <div className={styles.avatarUploadingOverlay}>↑</div>}
                    </div>
                    <div className={styles.avatarEditControls}>
                        <label className={styles.formLabel}>Foto de perfil</label>
                        <label className={styles.avatarPickBtn}>
                            📷 Elegir imagen
                            <input type="file" accept="image/jpeg,image/png,image/webp"
                                onChange={onAvatarFile} className={styles.fileInputHidden} />
                        </label>
                        <p className={styles.avatarPickHint}>JPG, PNG o WebP · Máx. 2 MB</p>
                    </div>
                </div>

                <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Nombre</label>
                        <input className={styles.formInput} name="name" value={formData.name} onChange={onChange} required />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Email</label>
                        <input className={styles.formInput} type="email" name="email" value={formData.email} onChange={onChange} required />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Ciudad</label>
                        <input className={styles.formInput} name="city" value={formData.city} onChange={onChange} placeholder="Tu ciudad" />
                    </div>
                </div>
            </div>

            {isArtist && (
                <div className={styles.editSection}>
                    <h3 className={styles.editSectionTitle}>Perfil artístico</h3>
                    <div className={styles.formGrid}>
                        <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                            <label className={styles.formLabel}>Biografía</label>
                            <textarea className={styles.formTextarea} name="bio" value={formData.bio}
                                onChange={onChange} placeholder="Cuéntale al mundo quién eres..." />
                        </div>
                        {SOCIAL_INPUTS.map(({ key, label, placeholder }) => (
                            <div key={key} className={styles.formGroup}>
                                <label className={styles.formLabel}>{label}</label>
                                <input className={styles.formInput} type="url" name={key}
                                    value={formData[key]} onChange={onChange} placeholder={placeholder} />
                            </div>
                        ))}
                        <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                            <label className={styles.formLabel}>💛 Enlace de donación</label>
                            <p className={styles.donationWarning}>💡 Recomendado: <strong>Ko-fi</strong> (con Stripe) — el donante paga con tarjeta sin crear cuenta. Evita usar solo PayPal, que a veces obliga a registrarse. También: Buy Me a Coffee, Patreon, GoFundMe o Twitch.</p>
                            <input className={styles.formInput} type="url" name="donation_url"
                                value={formData.donation_url} onChange={onChange} placeholder="https://ko-fi.com/..." />
                        </div>
                        <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                            <label className={styles.formLabel}>💜 Bizum (opcional)</label>
                            <p className={styles.donationWarning}>⚠️ Tu número será visible en tu perfil. Lo añades bajo tu responsabilidad.</p>
                            <input className={styles.formInput} type="tel" name="bizum_phone"
                                value={formData.bizum_phone} onChange={onChange} placeholder="600 00 00 00" />
                        </div>
                    </div>
                </div>
            )}

            <div className={styles.formActions}>
                <button type="submit" className={styles.saveBtn} disabled={saveLoading}>
                    {saveLoading ? 'Guardando...' : 'Guardar cambios'}
                </button>
                <button type="button" className={styles.cancelEditBtn} onClick={onCancel}>
                    Cancelar
                </button>
            </div>
        </form>
    </>
);

export default ProfileForms;
