import styles from './Header.module.scss';
import { Link } from 'react-router-dom';
import useAuthContext from '../../hooks/useAuthContext.js';

const Header = () => {
    const {
        isAuthenticated,
    } = useAuthContext();
    return (
        <header className={`${styles.header}`}>
            <h1 className={`${styles.title}`}>Libitum</h1>

            <section>
                <ul>
                    {/*isAuthenticated &&*/}<li><Link to={'/events'}>Eventos</Link></li>
                    {/* LOG IN ?*/}
                    {/* LOG OUT ? */}
                </ul>

            </section>
        </header>
    )
}

export default Header;