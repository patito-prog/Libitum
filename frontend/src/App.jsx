import './App.css';
import EventProvider from './providers/EventProvider.jsx';
import Router from './routes/Router.jsx';

function App() {

  return (
    <>
      <EventProvider>
        <Router />
      </EventProvider>
    </> 
  )
}

export default App;
