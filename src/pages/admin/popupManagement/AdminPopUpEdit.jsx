import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../../api/axiosConfig';
import BackButton from '../../../components/common/BackButton';

const AdminPopUpEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        product: '',
        image: '',
        title: '',
        description: '',
        delaySeconds: 2,
        displayFrequency: 'once_per_session',
        showOnPages: ['home'],
        closeableAfter: 0,
        autoCloseAfter: 0,
        buttonText: 'Shop Now',
        buttonColor: '#111827',
        isActive: true
    });
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchProducts();
        fetchPopUp();
    }, [id]);

    const fetchProducts = async () => {
        try {
            const response = await api.get('/products');
            setProducts(response.data.products || []);
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Failed to load products');
        }
    };

    const fetchPopUp = async () => {
        setFetchLoading(true);
        try {
            const response = await api.get(`/popups/${id}`);
            if (response.data.success) {
                const popup = response.data.data;
                setFormData({
                    product: popup.product?._id || '',
                    image: popup.image || '',
                    title: popup.title || '',
                    description: popup.description || '',
                    delaySeconds: popup.delaySeconds !== undefined ? popup.delaySeconds : 2,
                    displayFrequency: popup.displayFrequency || 'once_per_session',
                    showOnPages: popup.showOnPages || ['home'],
                    closeableAfter: popup.closeableAfter !== undefined ? popup.closeableAfter : 0,
                    autoCloseAfter: popup.autoCloseAfter !== undefined ? popup.autoCloseAfter : 0,
                    buttonText: popup.buttonText || 'Shop Now',
                    buttonColor: popup.buttonColor || '#111827',
                    isActive: popup.isActive !== undefined ? popup.isActive : true
                });
            }
        } catch (error) {
            console.error('Error fetching popup:', error);
            const errorMsg = error.response?.status === 404 
                ? 'Popup not found. It may have been deleted.' 
                : 'Failed to load popup';
            setError(errorMsg);
            toast.error(errorMsg);
            
            // Redirect to list after 2 seconds if popup not found
            if (error.response?.status === 404) {
                setTimeout(() => navigate('/admin/popups'), 2000);
            }
        }
        setFetchLoading(false);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        let processedValue = value;
        
        // Convert numeric fields to numbers
        if (type === 'number') {
            processedValue = value === '' ? 0 : parseInt(value);
        }
        
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : processedValue
        }));
    };

    const handlePageToggle = (page) => {
        setFormData(prev => {
            const current = prev.showOnPages || [];
            if (current.includes(page)) {
                return { ...prev, showOnPages: current.filter(p => p !== page) };
            } else {
                return { ...prev, showOnPages: [...current, page] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Ensure numeric fields are numbers
            const submitData = {
                ...formData,
                delaySeconds: parseInt(formData.delaySeconds) || 0,
                closeableAfter: parseInt(formData.closeableAfter) || 0,
                autoCloseAfter: parseInt(formData.autoCloseAfter) || 0,
            };

            const updatePromise = api.put(`/popups/${id}`, submitData);
            
            toast.promise(
                updatePromise,
                {
                    loading: 'Updating popup...',
                    success: 'Popup updated successfully!',
                    error: 'Failed to update popup',
                }
            );

            const result = await updatePromise;
            
            if (result.data.success) {
                setTimeout(() => navigate('/admin/popups', { replace: true, state: { refresh: Date.now() } }), 1000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update popup. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (error && !formData.title) {
        return (
            <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    <BackButton to="/admin/popups" label="Back to PopUps" />
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <svg className="mx-auto h-16 w-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{error}</h2>
                        <p className="text-gray-600 mb-4">Redirecting to popup list...</p>
                        <button
                            onClick={() => navigate('/admin/popups')}
                            className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition"
                        >
                            Go to PopUps List
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <BackButton to="/admin/popups" label="Back to PopUps" />
                
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">Edit PopUp</h1>
                    <p className="text-gray-600 mt-2">Update popup information</p>
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
                        {/* Product Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Product <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="product"
                                value={formData.product}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                required
                                disabled={loading}
                            >
                                <option value="">Select a product</option>
                                {products.map((product) => (
                                    <option key={product._id} value={product._id}>
                                        {product.name} - ₹{product.discountPrice || product.price}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g., Special Offer!"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                required
                                disabled={loading}
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Enter popup description..."
                                rows="4"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                required
                                disabled={loading}
                            />
                        </div>

                        {/* Image URL */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Image URL <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="url"
                                name="image"
                                value={formData.image}
                                onChange={handleChange}
                                placeholder="https://example.com/image.jpg"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                required
                                disabled={loading}
                            />
                            {formData.image && (
                                <div className="mt-4">
                                    <p className="text-sm text-gray-600 mb-2">Image Preview:</p>
                                    <img
                                        src={formData.image}
                                        alt="Popup preview"
                                        className="w-full h-64 object-cover rounded-lg"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Display Settings Section */}
                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Display Settings</h3>
                            
                            {/* Delay */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Delay (seconds)
                                </label>
                                <input
                                    type="number"
                                    name="delaySeconds"
                                    value={formData.delaySeconds}
                                    onChange={handleChange}
                                    min="0"
                                    max="60"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                    disabled={loading}
                                />
                                <p className="text-xs text-gray-500 mt-1">Time to wait before showing popup (0-60 seconds)</p>
                            </div>

                            {/* Display Frequency */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Display Frequency
                                </label>
                                <select
                                    name="displayFrequency"
                                    value={formData.displayFrequency}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                    disabled={loading}
                                >
                                    <option value="once_per_session">Once Per Session</option>
                                    <option value="once_per_day">Once Per Day</option>
                                    <option value="once_per_week">Once Per Week</option>
                                    <option value="always">Always (Every Page Load)</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-1">How often to show the popup to users</p>
                            </div>

                            {/* Show on Pages */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Show on Pages
                                </label>
                                <div className="space-y-2">
                                    {[
                                        { value: 'home', label: 'Home Page' },
                                        { value: 'products', label: 'Products List Page' },
                                        { value: 'product_details', label: 'Product Details Page' },
                                        { value: 'cart', label: 'Cart Page' },
                                        { value: 'checkout', label: 'Checkout Page' },
                                        { value: 'about', label: 'About Page' },
                                        { value: 'contact', label: 'Contact Page' },
                                        { value: 'all', label: 'All Pages' }
                                    ].map(page => (
                                        <div key={page.value} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={formData.showOnPages.includes(page.value)}
                                                onChange={() => handlePageToggle(page.value)}
                                                className="h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded"
                                                disabled={loading}
                                            />
                                            <label className="ml-2 block text-sm text-gray-700">
                                                {page.label}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Closeable After */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Closeable After (seconds)
                                </label>
                                <input
                                    type="number"
                                    name="closeableAfter"
                                    value={formData.closeableAfter}
                                    onChange={handleChange}
                                    min="0"
                                    max="30"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                    disabled={loading}
                                />
                                <p className="text-xs text-gray-500 mt-1">Seconds before user can close popup (0 = immediately closeable)</p>
                            </div>

                            {/* Auto Close After */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Auto Close After (seconds)
                                </label>
                                <input
                                    type="number"
                                    name="autoCloseAfter"
                                    value={formData.autoCloseAfter}
                                    onChange={handleChange}
                                    min="0"
                                    max="120"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                    disabled={loading}
                                />
                                <p className="text-xs text-gray-500 mt-1">Automatically close popup after X seconds (0 = never auto-close)</p>
                            </div>
                        </div>

                        {/* Button Customization Section */}
                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Button Customization</h3>
                            
                            {/* Button Text */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Button Text
                                </label>
                                <input
                                    type="text"
                                    name="buttonText"
                                    value={formData.buttonText}
                                    onChange={handleChange}
                                    maxLength="30"
                                    placeholder="e.g., Shop Now, Get Offer, Buy Now"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                    disabled={loading}
                                />
                            </div>

                            {/* Button Color */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Button Color
                                </label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="color"
                                        name="buttonColor"
                                        value={formData.buttonColor}
                                        onChange={handleChange}
                                        className="h-12 w-20 rounded border border-gray-300 cursor-pointer"
                                        disabled={loading}
                                    />
                                    <input
                                        type="text"
                                        name="buttonColor"
                                        value={formData.buttonColor}
                                        onChange={handleChange}
                                        placeholder="#111827"
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent font-mono"
                                        disabled={loading}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Hex color code for the CTA button</p>
                            </div>
                        </div>

                        {/* Active Status */}
                        <div className="border-t pt-6">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded"
                                    disabled={loading}
                                />
                                <label className="ml-2 block text-sm text-gray-700">
                                    Active (Show popup to users)
                                </label>
                            </div>

                            <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg mt-4">
                                <p className="text-sm text-gray-800">
                                    <strong>Note:</strong> Only one popup can be active at a time. Setting this popup as active will deactivate any other active popups.
                                </p>
                            </div>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Updating...' : 'Update PopUp'}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/admin/popups')}
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

export default AdminPopUpEdit;

