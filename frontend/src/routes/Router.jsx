import { Routes, Route } from 'react-router-dom';
import Home from '../pages/public/Home.jsx';
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
import AdminRoute from './guards/AdminRoute.jsx';
import AdminDashboard from "../pages/private/admin/AdminDashboard.jsx";
import Favorites from "../pages/private/Favorites.jsx";
import Feed from "../pages/private/Feed.jsx";

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

            {/* Página QR/donación del artista — acceso libre */}
            <Route path="/artist/:id" element={<ArtistProfile />} />
            {/* Perfil social de cualquier usuario — acceso libre */}
            <Route path="/user/:id" element={<UserProfile />} />
            
            <Route element={<PrivateRoute/>}>
                
                <Route path="/" element={<Home />} />
                <Route path="/events" element={<PageEvents />} />
                <Route path="/my-qr" element={<ArtistQR />} />
                <Route path="/feed" element={<Feed />} /> {/* El "Para ti" */}
                <Route path="/favorites" element={<Favorites />} /> {/* Mis Me Gusta */}
                <Route path="*" element={<Error />} />
            </Route>

            <Route element={<AdminRoute/>}>
                <Route path="/admin" element={<AdminDashboard />}/>
            </Route>
        </Routes>
    );
}

export default Router;