import { Routes, Route } from 'react-router-dom';
import RootPage from '../pages/public/RootPage.jsx';
import About from '../pages/public/About.jsx';
import Contact from '../pages/public/Contact.jsx';
import Login from '../pages/public/Login.jsx';
import Register from '../pages/public/Register.jsx';
import Error from '../pages/public/Error.jsx';
import PublicRoute from './guards/PublicRoute.jsx';
import PrivateRoute from './guards/ProtectedRoute.jsx'
import PageEvents from '../pages/private/PageEvents.jsx';
import ArtistProfile from "../pages/public/ArtistProfile.jsx";
import UserProfile from "../pages/public/UserProfile.jsx";
import ArtistQR from "../pages/private/artist/ArtistQR.jsx";
import ArtistStats from "../pages/private/artist/ArtistStats.jsx";
import EventDetail from "../pages/public/EventDetail.jsx";
import AdminRoute from './guards/AdminRoute.jsx';
import AdminDashboard from "../pages/private/admin/AdminDashboard.jsx";
import Favorites from "../pages/private/Favorites.jsx";
import Feed from "../pages/private/Feed.jsx";
import SearchEvents from "../pages/private/SearchEvents.jsx";
import MyAttendance from "../pages/private/MyAttendance.jsx";

const Router = () => {
    return (
        <Routes>
            {/* Accesibles para todos sin importar si han iniciado sesión */}
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />

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
    );
}

export default Router;