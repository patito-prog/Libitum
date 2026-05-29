import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import './index.scss'; // Estilos globales (variables, body, reset). Hoja GLOBAL, no CSS Module: si fuera .module.scss el build de producción se cargaría el bloque :root por tree-shaking y se perderían todas las variables.
import App from './App.jsx'
import AuthProvider from "./context/AuthProvider.jsx";
import MessageProvider from "./context/MessageProvider.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <MessageProvider>
        <AuthProvider>       
          <App />       
        </AuthProvider>
      </MessageProvider>
    </BrowserRouter>
  </StrictMode>,
)
