import { Routes, Route } from 'react-router-dom';
import Home from '../pages/public/Home.jsx';
import About from '../pages/public/About.jsx';
import Contact from '../pages/public/Contact.jsx';
import Login from '../pages/public/Login.jsx';
import Register from '../pages/public/Register.jsx';

const Router = () => {
    return (
        <Routes>
            <Route path="/*" element={<Error />} />
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
        </Routes>
    );
}

export default Router;