import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.jsx'
import { config } from './config/config'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'

// Check if Google Client ID is configured
const googleClientId = config.googleClientId || '';

if (!googleClientId && import.meta.env.DEV) {
  console.warn('⚠️ Google Client ID is not configured. Google Login button will show but will not work.');
  console.warn('Please set VITE_GOOGLE_CLIENT_ID in your .env file.');
  console.warn('Example: VITE_GOOGLE_CLIENT_ID=your-client-id-here');
}

// Always wrap with GoogleOAuthProvider, even if clientId is empty
// This allows the GoogleLogin component to render (it will show error if no clientId)
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <GoogleOAuthProvider clientId={googleClientId || 'dummy-client-id-for-rendering'}>
          <AuthProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </AuthProvider>
        </GoogleOAuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
)
