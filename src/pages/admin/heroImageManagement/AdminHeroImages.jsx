import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getHeroImagesAdmin, deleteHeroImage, deleteAllHeroImages } from '../../../services/adminService';
import BackButton from '../../../components/common/BackButton';
import LoadingSpinner from '../../../components/admin/common/LoadingSpinner';

const AdminHeroImages = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [heroImages, setHeroImages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchHeroImages();
    }, []);

    // Force refresh when navigating back from create/edit with state
    useEffect(() => {
        if (location.state?.refresh) {
            fetchHeroImages();
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const fetchHeroImages = async () => {
        setLoading(true);
        try {
            const result = await getHeroImagesAdmin();
            if (result.success) {
                setHeroImages(result.data?.images || result.data?.data || []);
            } else {
                toast.error(result.message || 'Failed to fetch hero images');
            }
        } catch (error) {
            console.error('Error fetching hero images:', error);
            toast.error('Failed to fetch hero images');
        }
        setLoading(false);
    };

    const handleDeleteHeroImage = async (index) => {
        if (window.confirm(`Are you sure you want to delete hero image #${index + 1}?`)) {
            try {
                await toast.promise(
                    deleteHeroImage(index),
                    {
                        loading: 'Deleting hero image...',
                        success: 'Hero image deleted successfully!',
                        error: 'Failed to delete hero image',
                    }
                );
                fetchHeroImages();
            } catch (error) {
                console.error('Error deleting hero image:', error);
            }
        }
    };

    const handleDeleteAll = async () => {
        if (window.confirm('Are you sure you want to delete ALL hero images? This action cannot be undone.')) {
            try {
                await toast.promise(
                    deleteAllHeroImages(),
                    {
                        loading: 'Deleting all hero images...',
                        success: 'All hero images deleted successfully!',
                        error: 'Failed to delete hero images',
                    }
                );
                fetchHeroImages();
            } catch (error) {
                console.error('Error deleting all hero images:', error);
            }
        }
    };

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <BackButton to="/admin" label="Back to Dashboard" />
                
                {/* Header */}
                <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">Hero Images Management</h1>
                        <p className="text-gray-600 mt-2">
                            Manage homepage hero slider images ({heroImages.length} total)
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate('/admin/hero-images/create')}
                            className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-semibold whitespace-nowrap"
                        >
                            + Add Hero Images
                        </button>
                        {heroImages.length > 0 && (
                            <button
                                onClick={handleDeleteAll}
                                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold whitespace-nowrap"
                            >
                                Delete All
                            </button>
                        )}
                    </div>
                </div>

                {/* Hero Images Grid */}
                {heroImages.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {heroImages.map((image, index) => (
                            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                                <div className="relative">
                                    {/* Desktop Image Preview */}
                                    <div className="h-48 bg-gray-200 relative">
                                        {image.large_image ? (
                                            <img
                                                src={image.large_image}
                                                alt={`Hero ${index + 1} - Desktop`}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    // Use React-safe approach instead of innerHTML
                                                    const placeholder = document.createElement('div');
                                                    placeholder.className = 'flex items-center justify-center h-full text-gray-400 text-6xl';
                                                    placeholder.textContent = '🖼️';
                                                    e.target.parentElement.replaceChildren(placeholder);
                                                }}
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-400 text-6xl">
                                                🖼️
                                            </div>
                                        )}
                                        <span className="absolute top-2 left-2 px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                            Desktop
                                        </span>
                                    </div>
                                    
                                    {/* Mobile Image Preview */}
                                    <div className="h-32 bg-gray-100 relative border-t">
                                        {image.mobile_image ? (
                                            <img
                                                src={image.mobile_image}
                                                alt={`Hero ${index + 1} - Mobile`}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    // Use React-safe approach instead of innerHTML
                                                    const placeholder = document.createElement('div');
                                                    placeholder.className = 'flex items-center justify-center h-full text-gray-400 text-4xl';
                                                    placeholder.textContent = '📱';
                                                    e.target.parentElement.replaceChildren(placeholder);
                                                }}
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-400 text-4xl">
                                                📱
                                            </div>
                                        )}
                                        <span className="absolute top-2 left-2 px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                            Mobile
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="p-6">
                                    <div className="mb-4">
                                        <p className="text-xs text-gray-500 mb-1">Image #{index + 1}</p>
                                        {image.product_url && (
                                            <div className="p-3 bg-gray-50 rounded-lg">
                                                <p className="text-xs text-gray-500 mb-1">Product URL:</p>
                                                <p className="text-sm font-medium text-gray-900 break-all">
                                                    {image.product_url}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2 text-xs text-gray-600 mb-4">
                                        <div className="flex justify-between">
                                            <span className="font-medium">Desktop Image:</span>
                                            <span className={image.large_image ? 'text-green-600' : 'text-red-600'}>
                                                {image.large_image ? '✓ Set' : '✗ Missing'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-medium">Mobile Image:</span>
                                            <span className={image.mobile_image ? 'text-green-600' : 'text-red-600'}>
                                                {image.mobile_image ? '✓ Set' : '✗ Missing'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => navigate(`/admin/hero-images/edit`, { state: { images: heroImages, editIndex: index } })}
                                            className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-semibold"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteHeroImage(index)}
                                            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-lg shadow-md">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No hero images found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Get started by adding hero images for your homepage slider.
                        </p>
                        <div className="mt-6">
                            <button
                                onClick={() => navigate('/admin/hero-images/create')}
                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800"
                            >
                                + Add Hero Images
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminHeroImages;

