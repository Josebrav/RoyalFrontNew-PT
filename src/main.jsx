import React from 'react'
import ReactDOM from 'react-dom/client'
import { reloadOnceForNewVersion } from "./utils/chunkReload";
import App from './App.jsx'
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';

import store from './redux/store/index.js';
import { Provider } from 'react-redux'

import { setupAxiosInterceptors } from './api/axiosInterceptors.js';
import ErrorBoundary from './components/ErrorBoundary/errorBoundary.jsx';

import './index.css'

// Registra el interceptor global de axios: ante un 401 en una sesión activa,
// limpia el token y avisa a la app (evento `auth:session-expired`).
setupAxiosInterceptors();

// Archivo de una version anterior que ya no existe (se publico una nueva con la pestaña abierta): recargar
window.addEventListener("vite:preloadError", (event) => {
  if (reloadOnceForNewVersion()) event.preventDefault();
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
  <Provider store={store}>

  <BrowserRouter>
  <ChakraProvider>
    <App />
  </ChakraProvider>
  </BrowserRouter>

  </Provider>
  </ErrorBoundary>
)
