import EventProvider from './context/EventProvider.jsx';
import Router from './routes/Router';
import MessageApp from "./components/common/MessageApp.jsx";
import ErrorBoundary from "./components/common/ErrorBoundary.jsx";
import Container from "./components/layout/Container.jsx";
import Header from "./components/layout/Header.jsx";
import Content from "./components/layout/Content.jsx";
import Footer from "./components/layout/Footer.jsx";

/**
 * Componente raíz: arma el layout (Container → Header + Content + Footer) y
 * monta el toast global y el enrutado dentro del proveedor de eventos.
 * La autenticación y los mensajes se proveen más arriba, en main.jsx.
 */
function App() {

  return (
    <>
    <Container>
      <Header />
      <Content>
        <MessageApp />
        <ErrorBoundary>
          <EventProvider>
            <Router />
          </EventProvider>
        </ErrorBoundary>
      </Content>
      <Footer />
      </Container>
    </> 
  )
}

export default App;
