import { Routes, Route } from 'react-router-dom';
import Home from '../pages/public/Home.jsx';
import About from '../pages/public/About.jsx';
import Contact from '../pages/public/Contact.jsx';
import Login from '../pages/public/Login.jsx';
import Register from '../pages/public/Register.jsx';
import PublicRoute from './guards/PublicRoute.jsx';
import PrivateRoute from './guards/ProtectedRoute.jsx'
import PageEvents from '../pages/private/PageEvents.jsx';

const Router = () => {
    return (
        <Routes>
            <Route element={<PublicRoute/>}>
                
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
            </Route>
            
            <Route element={<PrivateRoute/>}>
                <Route path="*" element={<Error />} />
                <Route path="/" element={<Home />} />
                <Route path="/events" element={<PageEvents />} />
            </Route>
        </Routes>
    );
}

export default Router;