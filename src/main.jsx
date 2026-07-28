import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import EntradaComercialGate from './components/EntradaComercialGate.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import './App.css';
import { HashRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <HashRouter>
      <EntradaComercialGate>
        <App />
      </EntradaComercialGate>
    </HashRouter>
    </ErrorBoundary>
  </React.StrictMode>,
);
