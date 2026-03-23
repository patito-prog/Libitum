import './Header.css';
import { Link } from 'react-router-dom';

const Header = () => {
    return (
        <header className="header">
            <h1 className="header-title">Libitum</h1>

            <section>
                <ul>
                    <li><Link to={'/events'}>Crear Evento</Link></li>
                </ul>
            </section>
        </header>
    )
}

export default Header;