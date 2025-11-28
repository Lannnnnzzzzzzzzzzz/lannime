import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <LanguageProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </LanguageProvider>
  </AuthProvider>
);
