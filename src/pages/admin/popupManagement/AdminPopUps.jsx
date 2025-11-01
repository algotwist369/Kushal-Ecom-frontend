import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../../api/axiosConfig';
import BackButton from '../../../components/common/BackButton';
import LoadingSpinner from '../../../components/admin/common/LoadingSpinner';

const AdminPopUps = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [popups, setPopups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPopups, setTotalPopups] = useState(0);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchPopUps();
    }, []);

    // Force refresh when navigating back from create/edit with state
    useEffect(() => {
        if (location.state?.refresh) {
            fetchPopUps();
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const fetchPopUps = async () => {
        setLoading(true);
        try {
            const response = await api.get('/popups', {
                params: {
                    _t: Date.now() // Cache busting
                }
            });
            
            if (response.data.success) {
                setPopups(response.data.data.popups || []);
                setTotalPopups(response.data.data.total || 0);
            }
        } catch (error) {
            console.error('Error fetching popups:', error);
            toast.error('Failed to fetch popups');
        }
        setLoading(false);
    };

    const handleDeletePopUp = async (popupId, title) => {
        if (window.confirm(`Are you sure you want to delete popup: ${title}?`)) {
            try {
                await toast.promise(
                    api.delete(`/popups/${popupId}`),
                    {
                        loading: 'Deleting popup...',
                        success: 'Popup deleted successfully!',
                        error: 'Failed to delete popup',
                    }
                );
                fetchPopUps();
            } catch (error) {
                console.error('Error deleting popup:', error);
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
                        <h1 className="text-4xl font-bold text-gray-900">PopUp Management</h1>
                        <p className="text-gray-600 mt-2">Manage promotional popups ({totalPopups} total)</p>
                    </div>
                    <button
                        onClick={() => navigate('/admin/popups/create')}
                        className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-semibold whitespace-nowrap"
                    >
                        + Create PopUp
                    </button>
                </div>

                {/* Popups Grid */}
                {popups.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {popups.map((popup) => (
                            <div key={popup._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                                <div className="relative h-48 bg-gray-200">
                                    {popup.image ? (
                                        <img
                                            src={popup.image}
                                            alt={popup.title}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.parentElement.innerHTML = '<div class="flex items-center justify-center h-full text-gray-400 text-6xl">🎁</div>';
                                            }}
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400 text-6xl">
                                            🎁
                                        </div>
                                    )}
                                    <span className={`absolute top-2 right-2 px-3 py-1 text-xs font-semibold rounded-full ${
                                        popup.isActive 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {popup.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                        {popup.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                        {popup.description}
                                    </p>
                                    {popup.product && (
                                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                            <p className="text-xs text-gray-500 mb-1">Linked Product:</p>
                                            <p className="text-sm font-medium text-gray-900">{popup.product.name}</p>
                                            <p className="text-xs text-gray-500 mt-1">₹{popup.product.discountPrice || popup.product.price}</p>
                                        </div>
                                    )}
                                    
                                    {/* Analytics */}
                                    <div className="mb-4 grid grid-cols-2 gap-3">
                                        <div className="p-3 bg-gray-50 rounded-lg text-center">
                                            <p className="text-2xl font-bold text-gray-600">{popup.viewCount || 0}</p>
                                            <p className="text-xs text-gray-800">Views</p>
                                        </div>
                                        <div className="p-3 bg-green-50 rounded-lg text-center">
                                            <p className="text-2xl font-bold text-green-600">{popup.clickCount || 0}</p>
                                            <p className="text-xs text-green-800">Clicks</p>
                                        </div>
                                    </div>

                                    {/* Settings Info */}
                                    <div className="mb-4 space-y-2 text-xs text-gray-600">
                                        <p><strong>Delay:</strong> {popup.delaySeconds}s</p>
                                        <p><strong>Frequency:</strong> {popup.displayFrequency?.replace('_', ' ')}</p>
                                        <p><strong>Button:</strong> {popup.buttonText || 'Shop Now'}</p>
                                    </div>

                                    <div className="text-xs text-gray-500 mb-4">
                                        Created: {new Date(popup.createdAt).toLocaleDateString()}
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => navigate(`/admin/popups/edit/${popup._id}`)}
                                            className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-semibold"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeletePopUp(popup._id, popup.title)}
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No popups found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Get started by creating a new popup.
                        </p>
                        <div className="mt-6">
                            <button
                                onClick={() => navigate('/admin/popups/create')}
                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800"
                            >
                                + Create PopUp
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPopUps;

