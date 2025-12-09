import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createOrUpdateHeroImages, addHeroImages, getHeroImagesAdmin } from '../../../services/adminService';
import BackButton from '../../../components/common/BackButton';

const AdminHeroImageCreate = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [images, setImages] = useState([
        {
            large_image: '',
            mobile_image: '',
            product_url: ''
        }
    ]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
    const [existingImages, setExistingImages] = useState([]);

    useEffect(() => {
        window.scrollTo(0, 0);
        
        // Check if we're in edit mode
        if (location.state?.editIndex !== undefined && location.state?.images) {
            setIsEditMode(true);
            setExistingImages(location.state.images);
            const editIndex = location.state.editIndex;
            setImages([location.state.images[editIndex]]);
        } else {
            // Check if we're adding to existing
            fetchExistingImages();
        }
    }, [location.state]);

    const fetchExistingImages = async () => {
        try {
            const result = await getHeroImagesAdmin();
            if (result.success) {
                const existing = result.data?.images || result.data?.data || [];
                setExistingImages(existing);
            }
        } catch (error) {
            console.error('Error fetching existing images:', error);
        }
    };

    const handleImageChange = (index, field, value) => {
        const updatedImages = [...images];
        updatedImages[index] = {
            ...updatedImages[index],
            [field]: value
        };
        setImages(updatedImages);
    };

    const addImageRow = () => {
        setImages([
            ...images,
            {
                large_image: '',
                mobile_image: '',
                product_url: ''
            }
        ]);
    };

    const removeImageRow = (index) => {
        if (images.length > 1) {
            setImages(images.filter((_, i) => i !== index));
        } else {
            toast.error('At least one image is required');
        }
    };

    const validateImages = () => {
        for (let i = 0; i < images.length; i++) {
            const img = images[i];
            if (!img.large_image || !img.mobile_image) {
                return `Image #${i + 1} is missing required fields (large_image and mobile_image are required)`;
            }
            
            // Basic URL validation
            try {
                if (img.large_image) new URL(img.large_image);
                if (img.mobile_image) new URL(img.mobile_image);
            } catch (e) {
                return `Image #${i + 1} contains invalid URLs`;
            }
        }
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const validationError = validateImages();
        if (validationError) {
            setError(validationError);
            toast.error(validationError);
            return;
        }

        setLoading(true);

        try {
            // Filter out empty images
            const validImages = images.filter(img => img.large_image && img.mobile_image);
            
            if (validImages.length === 0) {
                setError('At least one valid hero image is required');
                setLoading(false);
                return;
            }

            let result;
            if (isEditMode) {
                // In edit mode, replace the entire array with updated one
                const updatedImages = [...existingImages];
                updatedImages[location.state.editIndex] = validImages[0];
                result = await createOrUpdateHeroImages(updatedImages);
            } else {
                // Check if user wants to add or replace
                const shouldAdd = existingImages.length > 0 && 
                    window.confirm(`You have ${existingImages.length} existing hero image(s). Do you want to ADD these new images to existing ones? (Click Cancel to REPLACE all existing images)`);
                
                if (shouldAdd) {
                    result = await addHeroImages(validImages);
                } else {
                    result = await createOrUpdateHeroImages(validImages);
                }
            }

            if (result.success) {
                toast.success(result.message || 'Hero images saved successfully!');
                setTimeout(() => {
                    navigate('/admin/hero-images', { replace: true, state: { refresh: Date.now() } });
                }, 1000);
            } else {
                setError(result.message || 'Failed to save hero images');
                toast.error(result.message || 'Failed to save hero images');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to save hero images. Please try again.';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <BackButton to="/admin/hero-images" label="Back to Hero Images" />
                
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">
                        {isEditMode ? 'Edit Hero Image' : 'Add Hero Images'}
                    </h1>
                    <p className="text-gray-600 mt-2">
                        {isEditMode 
                            ? 'Update hero image details'
                            : 'Add multiple hero images for your homepage slider. You can add multiple images at once.'
                        }
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* Form */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {images.map((image, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Image #{index + 1}
                                    </h3>
                                    {images.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeImageRow(index)}
                                            className="text-red-600 hover:text-red-700 font-medium text-sm"
                                            disabled={loading}
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    {/* Large Image URL */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Desktop Image URL <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="url"
                                            value={image.large_image}
                                            onChange={(e) => handleImageChange(index, 'large_image', e.target.value)}
                                            placeholder="https://example.com/desktop-image.jpg"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                            required
                                            disabled={loading}
                                        />
                                        {image.large_image && (
                                            <div className="mt-3">
                                                <p className="text-xs text-gray-600 mb-2">Desktop Preview:</p>
                                                <img
                                                    src={image.large_image}
                                                    alt={`Desktop preview ${index + 1}`}
                                                    className="w-full h-48 object-contain bg-gray-100 rounded-lg border border-gray-200"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Mobile Image URL */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Mobile Image URL <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="url"
                                            value={image.mobile_image}
                                            onChange={(e) => handleImageChange(index, 'mobile_image', e.target.value)}
                                            placeholder="https://example.com/mobile-image.jpg"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                            required
                                            disabled={loading}
                                        />
                                        {image.mobile_image && (
                                            <div className="mt-3">
                                                <p className="text-xs text-gray-600 mb-2">Mobile Preview:</p>
                                                <img
                                                    src={image.mobile_image}
                                                    alt={`Mobile preview ${index + 1}`}
                                                    className="w-full h-32 object-contain bg-gray-100 rounded-lg border border-gray-200"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Product URL */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Product URL (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={image.product_url}
                                            onChange={(e) => handleImageChange(index, 'product_url', e.target.value)}
                                            placeholder="/products/product-slug"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                            disabled={loading}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            URL where users will be redirected when clicking this hero image
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Add More Images Button */}
                        {!isEditMode && (
                            <button
                                type="button"
                                onClick={addImageRow}
                                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-colors font-medium"
                                disabled={loading}
                            >
                                + Add Another Image
                            </button>
                        )}

                        {/* Info Box */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-800">
                                <strong>💡 Tip:</strong> Upload your images to a CDN or image hosting service first, then paste the URLs here. 
                                Make sure desktop images are optimized for large screens (recommended: 1290x630px) and mobile images for small screens (recommended: 552x630px).
                            </p>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {loading 
                                    ? (isEditMode ? 'Updating...' : 'Saving...') 
                                    : (isEditMode ? 'Update Hero Image' : 'Save Hero Images')
                                }
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/admin/hero-images')}
                                disabled={loading}
                                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminHeroImageCreate;

