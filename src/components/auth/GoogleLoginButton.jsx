import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { googleLogin } from '../../services/googleAuthService';
import { config } from '../../config/config';

const GoogleLoginButton = () => {
    // Force component to always render - add console log immediately
    console.log('🔵 GoogleLoginButton Component Function Called');
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    // Check if Google Client ID is configured
    const isGoogleConfigured = config.googleClientId && config.googleClientId.trim() !== '';

    // Debug logging - always log
    React.useEffect(() => {
        console.log('🔵 GoogleLoginButton Component Rendered:', {
            isGoogleConfigured,
            clientId: config.googleClientId ? `Set (${config.googleClientId.substring(0, 10)}...)` : 'Not set',
            configObject: config
        });
        
        // Check if GoogleLogin button actually rendered after a delay
        setTimeout(() => {
            const googleButton = document.querySelector('[data-testid="google-login-button"], iframe[src*="accounts.google.com"]');
            const fallbackButton = document.getElementById('google-login-fallback');
            
            console.log('🔍 Checking Google Login Button:', {
                googleButtonFound: !!googleButton,
                fallbackButtonFound: !!fallbackButton,
                googleButtonVisible: googleButton ? window.getComputedStyle(googleButton).display !== 'none' : false
            });
            
            // If GoogleLogin didn't render after 2 seconds, show fallback
            if (!googleButton && fallbackButton && isGoogleConfigured) {
                console.warn('⚠️ GoogleLogin component did not render, showing fallback');
                fallbackButton.style.display = 'block';
            }
        }, 2000);
    }, [isGoogleConfigured]);

    const handleSuccess = async (credentialResponse) => {
        try {
            const result = await googleLogin(credentialResponse.credential);

            if (result.success) {
                // Update auth context
                login(result.data);

                // Show success message
                alert(result.data.message || 'Login successful!');

                // Redirect based on role or return url
                if (result.data.role === 'admin') {
                    navigate('/admin');
                } else {
                    const from = location.state?.from || '/';
                    navigate(from);
                }
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error('Google login error:', error);
            alert('Failed to login with Google. Please try again.');
        }
    };

    const handleError = () => {
        console.error('Google login failed');
        alert('Google login failed. Please try again.');
    };

    const handleClick = () => {
        if (!isGoogleConfigured) {
            alert('Google Login is not configured. Please contact administrator.');
        }
    };

    // Always show the button - if not configured, show disabled placeholder
    // Force render with explicit styles
    console.log('🔵 GoogleLoginButton returning JSX, isGoogleConfigured:', isGoogleConfigured);
    
    return (
        <div className="w-full flex justify-center items-center">
            {isGoogleConfigured ? (
                <div className="w-full flex justify-center">
                    <GoogleLogin
                        onSuccess={handleSuccess}
                        onError={handleError}
                        size="large"
                        theme="outline"
                        text="continue_with"
                        shape="rectangular"
                        width="384"
                        useOneTap={false}
                    />
                </div>
            ) : (
                <div className="w-full flex justify-center">
                    <button
                        type="button"
                        onClick={handleClick}
                        className="w-full max-w-[384px] flex items-center justify-center gap-3 px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors shadow-sm hover:shadow-md"
                        style={{ 
                            minHeight: '48px', 
                            cursor: 'pointer'
                        }}
                    >
                        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        <span className="text-sm font-medium">Continue with Google</span>
                    </button>
                    {import.meta.env.DEV && (
                        <p className="mt-2 text-xs text-yellow-600 text-center">
                            ⚠️ Google Client ID not configured. Add VITE_GOOGLE_CLIENT_ID to .env file
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default GoogleLoginButton;

