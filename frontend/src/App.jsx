import styles from './App.module.scss';
import EventProvider from './context/EventProvider.jsx';
import Router from './routes/Router';
import MessageApp from "./components/common/MessageApp.jsx";
import Container from "./components/layout/Container.jsx";
import Header from "./components/layout/Container.jsx";
import Content from "./components/layout/Container.jsx";
import Footer from "./components/layout/Container.jsx";

function App() {

  return (
    <>
    <Container>
      <Header />
      <Content>
        <MessageApp />
        <EventProvider>
          <Router />
        </EventProvider>
      </Content>
      <Footer />
      </Container>
    </> 
  )
}

export default App;
