import React from 'react';

const LoadingSpinner = ({ size = "large", fullScreen = false }) => {
    const sizeClasses = {
        small: "h-6 w-6",
        medium: "h-12 w-12",
        large: "h-16 w-16"
    };

    const spinner = (
        <div className={`animate-spin rounded-full border-b-2 border-green-600 ${sizeClasses[size]}`}></div>
    );

    if (fullScreen) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                {spinner}
            </div>
        );
    }

    return (
        <div className="flex justify-center py-8">
            {spinner}
        </div>
    );
};

export default LoadingSpinner;

