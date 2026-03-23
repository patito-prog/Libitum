import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home.jsx';
import About from '../pages/About.jsx';
import Contact from '../pages/Contact.jsx';
import Events from '../pages/Events.jsx';
import Error from '../pages/Error.jsx';

const Router = () => {
    return (
        <Routes>
            <Route path="/*" element={<Error />} />
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/events" element={<Events />} />
        </Routes>
    );
}

export default Router;