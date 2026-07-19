import ErrorBoundary from './components/ErrorBoundary.jsx'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import OcultarRoboIAFinal from './components/OcultarRoboIAFinal.jsx';
import DesativarAssistenteIA from './components/DesativarAssistenteIA.jsx';
import './App.css' // <-- Mude apenas o nome aqui para combinar com o seu ficheiro!

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <><DesativarAssistenteIA /><><OcultarRoboIAFinal /><App /></></>
    </ErrorBoundary>
  </React.StrictMode>,
)