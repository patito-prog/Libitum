import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Loading from '../components/common/Loading.jsx';

// Los guards van en carga normal (son diminutos y se necesitan ya).
import PublicRoute from './guards/PublicRoute.jsx';
import PrivateRoute from './guards/ProtectedRoute.jsx';
import AdminRoute from './guards/AdminRoute.jsx';

/*
 * Carga diferida (lazy) de cada página: en vez de meter TODAS las páginas en
 * un único JS gigante que el móvil tiene que descargar entero al entrar, cada
 * ruta se baja solo cuando se visita. La primera carga pesa muchísimo menos.
 */
const RootPage      = lazy(() => import('../pages/public/RootPage.jsx'));
const About         = lazy(() => import('../pages/public/About.jsx'));
const Contact       = lazy(() => import('../pages/public/Contact.jsx'));
const Login         = lazy(() => import('../pages/public/Login.jsx'));
const Register      = lazy(() => import('../pages/public/Register.jsx'));
const Error         = lazy(() => import('../pages/public/Error.jsx'));
const EmailVerified = lazy(() => import('../pages/public/EmailVerified.jsx'));
const PaymentsInfo  = lazy(() => import('../pages/public/PaymentsInfo.jsx'));
const PrivacyPolicy = lazy(() => import('../pages/public/PrivacyPolicy.jsx'));
const Terms         = lazy(() => import('../pages/public/Terms.jsx'));
const ArtistProfile = lazy(() => import('../pages/public/ArtistProfile.jsx'));
const Artists       = lazy(() => import('../pages/public/Artists.jsx'));
const UserProfile   = lazy(() => import('../pages/public/UserProfile.jsx'));
const EventDetail   = lazy(() => import('../pages/public/EventDetail.jsx'));
const SearchEvents  = lazy(() => import('../pages/private/SearchEvents.jsx'));
const Feed          = lazy(() => import('../pages/private/Feed.jsx'));
const PageEvents    = lazy(() => import('../pages/private/PageEvents.jsx'));
const ArtistQR      = lazy(() => import('../pages/private/artist/ArtistQR.jsx'));
const ArtistStats   = lazy(() => import('../pages/private/artist/ArtistStats.jsx'));
const Favorites     = lazy(() => import('../pages/private/Favorites.jsx'));
const MyAttendance  = lazy(() => import('../pages/private/MyAttendance.jsx'));
const AdminDashboard = lazy(() => import('../pages/private/admin/AdminDashboard.jsx'));

const Router = () => {
    return (
        <Suspense fallback={<Loading fullScreen />}>
            <Routes>
                {/* Accesibles para todos sin importar si han iniciado sesión */}
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                {/* Resultado de la verificación de correo (el back redirige aquí) */}
                <Route path="/email-verificado" element={<EmailVerified />} />
                {/* Guía de pagos y donaciones */}
                <Route path="/pagos" element={<PaymentsInfo />} />
                {/* Legales */}
                <Route path="/privacidad" element={<PrivacyPolicy />} />
                <Route path="/terminos" element={<Terms />} />

                <Route element={<PublicRoute/>}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                </Route>

                {/* Landing QR/donación del artista — acceso libre */}
                <Route path="/artist/:id" element={<ArtistProfile />} />
                {/* Perfil social de cualquier usuario — acceso libre */}
                <Route path="/user/:id" element={<UserProfile />} />
                {/* Detalle de un evento — acceso libre */}
                <Route path="/event/:id" element={<EventDetail />} />

                <Route path="/events/buscar" element={<SearchEvents />} />
                <Route path="/artistas" element={<Artists />} />
                <Route path="/feed" element={<Feed />} />

                {/* Raíz pública: Landing para invitados, Home para autenticados */}
                <Route path="/" element={<RootPage />} />

                <Route element={<PrivateRoute/>}>
                    <Route path="/events" element={<PageEvents />} />
                    <Route path="/my-qr" element={<ArtistQR />} />
                    <Route path="/estadisticas" element={<ArtistStats />} />
                    <Route path="/favorites" element={<Favorites />} />
                    <Route path="/asistencias" element={<MyAttendance />} />
                    <Route path="*" element={<Error />} />
                </Route>

                <Route element={<AdminRoute/>}>
                    <Route path="/admin" element={<AdminDashboard />}/>
                </Route>
            </Routes>
        </Suspense>
    );
}

export default Router;
