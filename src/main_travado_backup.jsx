import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import ControleVisualRodapeEncerrado from './components/ControleVisualRodapeEncerrado.jsx';
import './App.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ControleVisualRodapeEncerrado />
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
