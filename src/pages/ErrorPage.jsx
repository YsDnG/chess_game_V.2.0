import React from 'react';
import { useRouteError, Link } from 'react-router-dom';

// Styles basiques pour la page d'erreur, vous pourrez les personnaliser
const errorPageStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  textAlign: 'center',
  fontFamily: 'Arial, sans-serif',
  backgroundColor: '#1a1a2e', // Un fond sombre
  color: '#e0e0e0', // Texte clair
};

const headingStyle = {
  fontSize: '2.5rem',
  marginBottom: '1rem',
  color: '#ff6b6b', // Une couleur d'accent pour l'erreur
};

const paragraphStyle = {
  fontSize: '1.2rem',
  marginBottom: '0.5rem',
};

const linkStyle = {
  color: '#8a4fff', // Votre couleur d'accent
  textDecoration: 'none',
  fontWeight: 'bold',
  marginTop: '1.5rem',
  padding: '0.8rem 1.5rem',
  border: '1px solid #8a4fff',
  borderRadius: '8px',
  transition: 'background-color 0.3s, color 0.3s',
};

const ErrorPage = () => {
  const error = useRouteError();
  console.error(error); // Pour le débogage, affiche l'erreur dans la console

  return (
    <div style={errorPageStyle}>
      <h1 style={headingStyle}>Oops! Une erreur est survenue.</h1>
      <p style={paragraphStyle}>
        Nous sommes désolés, mais quelque chose s'est mal passé.
      </p>
      <p style={paragraphStyle}>
        <i>{error.statusText || error.message}</i>
      </p>
      <Link to="/" style={linkStyle} 
            onMouseEnter={(e) => { e.target.style.backgroundColor = '#8a4fff'; e.target.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#8a4fff'; }}>
        Retourner à l'accueil
      </Link>
    </div>
  );
}

export default ErrorPage;
