import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getAllCoupons, deleteCoupon } from '../../../services/adminService';
import BackButton from '../../../components/common/BackButton';
import { LuRefreshCcw } from "react-icons/lu";

const AdminCoupons = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, active, expired, inactive

    useEffect(() => {
        fetchCoupons();
    }, []);

    // Refresh when navigating back with refresh state
    useEffect(() => {
        if (location.state?.refresh) {
            fetchCoupons();
            // Clear the state
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state]);

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const result = await getAllCoupons();
            if (result.success) {
                const freshCoupons = Array.isArray(result.data.coupons) 
                    ? result.data.coupons 
                    : Array.isArray(result.data) 
                    ? result.data 
                    : [];
                setCoupons(freshCoupons);
                console.log('✅ Fetched fresh coupons:', freshCoupons.length);
            } else {
                setCoupons([]);
                console.error('Failed to fetch coupons:', result.message);
            }
        } catch (error) {
            console.error('Error fetching coupons:', error);
            setCoupons([]);
        }
        setLoading(false);
    };

    const handleDeleteCoupon = async (couponId, couponCode) => {
        if (window.confirm(`Are you sure you want to delete coupon: ${couponCode}?\n\nThis action cannot be undone.`)) {
            const deletePromise = deleteCoupon(couponId);
            
            toast.promise(
                deletePromise,
                {
                    loading: 'Deleting coupon...',
                    success: 'Coupon deleted successfully!',
                    error: 'Failed to delete coupon',
                }
            );

            const result = await deletePromise;
            if (result.success) {
                fetchCoupons();
            }
        }
    };

    const isExpired = (expiryDate) => {
        if (!expiryDate) return false;
        return new Date(expiryDate) < new Date();
    };

    const filteredCoupons = coupons.filter(coupon => {
        if (filter === 'all') return true;
        if (filter === 'active') return coupon.isActive && !isExpired(coupon.validUntil);
        if (filter === 'expired') return isExpired(coupon.validUntil);
        if (filter === 'inactive') return !coupon.isActive;
        return true;
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <BackButton to="/admin" label="Back to Dashboard" />
                
                {/* Header */}
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold text-[#5c2d16]">Coupon Management</h1>
                        <p className="text-gray-600 mt-2">Manage discount coupons</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={fetchCoupons}
                            disabled={loading}
                            className="bg-gray-200 p-2 rounded-lg"
                        >
                            <LuRefreshCcw className="text-2xl" />
                        </button>
                        <button
                            onClick={() => navigate('/admin/coupons/create')}
                            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                        >
                            + Add Coupon
                        </button>
                    </div>
                </div>

                {/* Filter */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex items-center gap-4">
                        <label className="text-sm font-medium text-gray-700">Filter:</label>
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                            <option value="all">All Coupons</option>
                            <option value="active">Active Only</option>
                            <option value="expired">Expired</option>
                            <option value="inactive">Inactive</option>
                        </select>
                        <span className="text-sm text-gray-600 ml-auto">
                            Showing {filteredCoupons.length} of {coupons.length} coupons
                        </span>
                    </div>
                </div>

                {/* Coupons Table */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Code
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Discount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Min Purchase
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Usage
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Valid Until
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {Array.isArray(filteredCoupons) && filteredCoupons.map((coupon) => (
                                    <tr key={coupon._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-[#5c2d16]">
                                                {coupon.code}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-[#5c2d16] font-semibold">
                                                {coupon.discountType === 'percentage' 
                                                    ? `${coupon.discountValue}%` 
                                                    : `₹${coupon.discountValue}`}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                                {coupon.discountType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            ₹{coupon.minPurchaseAmount || 0}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {coupon.usageCount}/{coupon.usageLimit || '∞'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {coupon.validUntil 
                                                ? new Date(coupon.validUntil).toLocaleDateString() 
                                                : 'No expiry'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                coupon.isActive && !isExpired(coupon.validUntil)
                                                    ? 'bg-green-100 text-green-800' 
                                                    : isExpired(coupon.validUntil)
                                                    ? 'bg-orange-100 text-orange-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {coupon.isActive && !isExpired(coupon.validUntil) 
                                                    ? 'Active' 
                                                    : isExpired(coupon.validUntil)
                                                    ? 'Expired'
                                                    : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            <button
                                                onClick={() => navigate(`/admin/coupons/edit/${coupon._id}`)}
                                                className="text-gray-600 hover:text-gray-900 font-semibold"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCoupon(coupon._id, coupon.code)}
                                                className="text-red-600 hover:text-red-900 font-semibold"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {(!Array.isArray(filteredCoupons) || filteredCoupons.length === 0) && (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">
                                {coupons.length === 0 
                                    ? 'No coupons found' 
                                    : 'No coupons match your filter'}
                            </p>
                            {coupons.length === 0 && (
                                <button
                                    onClick={() => navigate('/admin/coupons/create')}
                                    className="mt-4 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                                >
                                    Create First Coupon
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminCoupons;
