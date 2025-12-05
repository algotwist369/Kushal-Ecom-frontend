import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { googleLogin } from '../../services/googleAuthService';

const GoogleLoginButton = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

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
    };

    return (
        <div className="w-full flex justify-center">
            <GoogleLogin
                onSuccess={handleSuccess}
                onError={handleError}
                size="large"
                theme="outline"
                text="continue_with"
                shape="rectangular"
                width="384"
            />
        </div>
    );
};

export default GoogleLoginButton;

