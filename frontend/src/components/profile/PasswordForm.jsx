import PasswordInput from '../common/PasswordInput.jsx';
import styles from '../../pages/public/UserProfile.module.scss';

/**
 * Apartado independiente de seguridad: cambiar la contraseña. Va separado del
 * formulario de editar perfil a propósito (es una acción más delicada).
 */
const PasswordForm = ({ pwForm, onPwChange, onPwSave, pwLoading, onCancel }) => (
    <form className={styles.editForm} onSubmit={onPwSave}>
        <div className={styles.editSection}>
            <h3 className={styles.editSectionTitle}>🔒 Cambiar contraseña</h3>
            <div className={styles.formGrid}>
                <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                    <label className={styles.formLabel}>Contraseña actual</label>
                    <PasswordInput className={styles.formInput} name="current_password"
                        value={pwForm.current_password} onChange={onPwChange} required autoComplete="current-password" />
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Nueva contraseña</label>
                    <PasswordInput className={styles.formInput} name="password"
                        value={pwForm.password} onChange={onPwChange} minLength={8} required autoComplete="new-password" />
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Confirmar nueva contraseña</label>
                    <PasswordInput className={styles.formInput} name="password_confirmation"
                        value={pwForm.password_confirmation} onChange={onPwChange} required autoComplete="new-password" />
                </div>
            </div>
        </div>
        <div className={styles.formActions}>
            <button type="submit" className={styles.saveBtn} disabled={pwLoading}>
                {pwLoading ? 'Guardando...' : 'Cambiar contraseña'}
            </button>
            <button type="button" className={styles.cancelEditBtn} onClick={onCancel}>
                Cancelar
            </button>
        </div>
    </form>
);

export default PasswordForm;
