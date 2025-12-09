import React from 'react';
import { useNavigate } from 'react-router-dom';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log error to console in development
        if (import.meta.env.DEV) {
            console.error('ErrorBoundary caught an error:', error, errorInfo);
        }
        
        this.setState({
            error,
            errorInfo
        });

        // In production, you might want to log to an error reporting service
        // Example: logErrorToService(error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return <ErrorFallback error={this.state.error} resetError={() => this.setState({ hasError: false, error: null })} />;
        }

        return this.props.children;
    }
}

const ErrorFallback = ({ error, resetError }) => {
    const navigate = useNavigate();
    const isDevelopment = import.meta.env.DEV;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
                <div className="mb-4">
                    <svg className="mx-auto h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
                <p className="text-gray-600 mb-6">
                    We're sorry, but something unexpected happened. Please try refreshing the page.
                </p>

                {isDevelopment && error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-left">
                        <p className="text-sm font-semibold text-red-800 mb-2">Error Details (Development Only):</p>
                        <pre className="text-xs text-red-700 overflow-auto max-h-40">
                            {error.toString()}
                            {error.stack && `\n\n${error.stack}`}
                        </pre>
                    </div>
                )}

                <div className="flex gap-3 justify-center">
                    <button
                        onClick={() => {
                            resetError();
                            window.location.href = '/';
                        }}
                        className="px-4 py-2 bg-[#5c2d16] text-white rounded-lg hover:bg-[#442112] transition"
                    >
                        Go Home
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                    >
                        Refresh Page
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ErrorBoundary;

