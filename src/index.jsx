import React from 'react';
import ReactDOM from 'react-dom/client';
import { createHashRouter, RouterProvider } from "react-router-dom";

import './App.css';
import Training from './pages/Training';
import MultiPlayer from './pages/Multiplayer';
import Learn from'./pages/Learn';
import ErrorPage from './pages/ErrorPage'; // Importer la page d'erreur

import WebSocketProvider from './context/WebSocketProvider';


const router = createHashRouter([
  {
    path: "/",
    element: <Training />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/multiPlayer",
    element: <MultiPlayer />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/learn",
    element: <Learn />,
    errorElement: <ErrorPage />,
  },
]);


const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>

  <WebSocketProvider>
  <RouterProvider router ={router} />

  </WebSocketProvider>

  </React.StrictMode>
);
