import useAuthContext from '../../hooks/useAuthContext.js';
import Home from './Home.jsx';
import Landing from './Landing.jsx';
import Loading from '../../components/common/Loading.jsx';

/**
 * Ruta raíz "/": muestra la carta de presentación (Landing) a los invitados
 * y el panel Home personalizado a los usuarios autenticados.
 */
const RootPage = () => {
    const { isAuthenticated, loadingAuth } = useAuthContext();

    if (loadingAuth) return <Loading fullScreen />;
    return isAuthenticated ? <Home /> : <Landing />;
};

export default RootPage;
