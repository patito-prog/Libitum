import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import styles from './index.module.scss'; // Aunque esté "sin usar" está importandose correctamente el archivo .scss aunque podemos usar el style.[loquesea] para las clases.
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
