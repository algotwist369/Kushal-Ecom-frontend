import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getCouponClaims } from '../../../services/adminService';
import BackButton from '../../../components/common/BackButton';
import { LuRefreshCcw, LuSearch } from "react-icons/lu";

const AdminCouponClaims = () => {
    const navigate = useNavigate();
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        fetchClaims();
    }, [page]);

    const fetchClaims = async (isManualRefresh = false) => {
        if (isManualRefresh) setIsRefreshing(true);
        else setLoading(true);

        try {
            const params = {
                page,
                limit: 20,
                phoneNumber: searchTerm
            };
            const result = await getCouponClaims(params);
            if (result.success) {
                setClaims(result.data.claims || []);
                setTotal(result.data.total || 0);
                setPages(result.data.pages || 1);
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error('Error fetching claims:', error);
            toast.error('Failed to load coupon claims');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchClaims();
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <BackButton to="/admin/coupons" label="Back to Coupons" />
                
                {/* Header */}
                <div className="mb-8 flex justify-between items-center text-wrap">
                    <div>
                        <h1 className="text-4xl font-bold text-[#5c2d16]">Coupon Claims</h1>
                        <p className="text-gray-600 mt-2">View all users who have claimed coupons</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => fetchClaims(true)}
                            disabled={loading || isRefreshing}
                            className={`bg-gray-200 p-3 rounded-lg hover:bg-gray-300 transition-colors ${isRefreshing ? 'animate-spin' : ''}`}
                            title="Refresh Data"
                        >
                            <LuRefreshCcw className="text-2xl" />
                        </button>
                    </div>
                </div>

                {/* Filters/Search */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Search by Phone Number</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <LuSearch className="text-gray-400" />
                                </span>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Enter phone number..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold h-10"
                        >
                            Search
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setSearchTerm('');
                                setPage(1);
                                fetchClaims();
                            }}
                            className="text-gray-600 hover:text-gray-800 font-medium px-4 py-2 h-10"
                        >
                            Reset
                        </button>
                        <span className="text-sm text-gray-600 ml-auto self-center">
                            Total Claims: <strong>{total}</strong>
                        </span>
                    </form>
                </div>

                {/* Claims Table */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    {loading && !isRefreshing ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Coupon Code
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Phone Number
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Claimed At
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Usage Count
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {claims.length > 0 ? (
                                        claims.map((claim, index) => (
                                            <tr key={`${claim.couponId}-${claim.phoneNumber}-${index}`} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-bold text-[#5c2d16]">
                                                        {claim.couponCode}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900 font-medium">
                                                        {claim.phoneNumber}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {formatDate(claim.claimedAt)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        claim.usedCount > 0 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                        {claim.usedCount} Used
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-10 text-center text-gray-500">
                                                No claims found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {pages > 1 && (
                        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                            <div className="flex-1 flex justify-between sm:hidden">
                                <button
                                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                                    disabled={page === 1}
                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setPage(prev => Math.min(prev + 1, pages))}
                                    disabled={page === pages}
                                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100"
                                >
                                    Next
                                </button>
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Showing page <span className="font-medium">{page}</span> of <span className="font-medium">{pages}</span>
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                        <button
                                            onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                                            disabled={page === 1}
                                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100"
                                        >
                                            <span className="sr-only">Previous</span>
                                            &lt;
                                        </button>
                                        {[...Array(pages)].map((_, i) => (
                                            <button
                                                key={i + 1}
                                                onClick={() => setPage(i + 1)}
                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                    page === i + 1
                                                        ? 'z-10 bg-green-50 border-green-500 text-green-600'
                                                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                }`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => setPage(prev => Math.min(prev + 1, pages))}
                                            disabled={page === pages}
                                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100"
                                        >
                                            <span className="sr-only">Next</span>
                                            &gt;
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminCouponClaims;
