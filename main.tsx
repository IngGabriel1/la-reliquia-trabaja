import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './la_reliquia_trabaja_plataforma_comunitaria'
import ErrorBoundary from './lib/ErrorBoundary'
import './index.css'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('No se encontró el elemento #root en index.html')
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
