import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getAllCategories, deleteCategory } from '../../../services/adminService';
import BackButton from '../../../components/common/BackButton';
import SearchBar from '../../../components/admin/common/SearchBar';
import FilterSelect from '../../../components/admin/common/FilterSelect';
import ViewToggle from '../../../components/admin/common/ViewToggle';
import Pagination from '../../../components/admin/common/Pagination';
import SortSelect from '../../../components/admin/common/SortSelect';
import ItemsPerPageSelect from '../../../components/admin/common/ItemsPerPageSelect';
import LoadingSpinner from '../../../components/admin/common/LoadingSpinner';

const AdminCategories = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCategories, setTotalCategories] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(12);
    
    // View mode
    const [viewMode, setViewMode] = useState('card');

    useEffect(() => {
        fetchCategories();
    }, [currentPage, itemsPerPage, searchTerm, filterStatus, sortBy]);

    // Force refresh when navigating back from create/edit with state
    useEffect(() => {
        if (location.state?.refresh) {
            fetchCategories();
            // Clear the state to prevent re-fetching on subsequent renders
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                limit: itemsPerPage,
                ...(searchTerm && { search: searchTerm }),
                ...(filterStatus && { status: filterStatus }),
                ...(sortBy && { sortBy }),
                _t: Date.now() // Cache busting parameter
            };

            const result = await getAllCategories(params);
            if (result.success) {
                setCategories(result.data.categories || result.data);
                setTotalPages(result.data.pages || 1);
                setTotalCategories(result.data.total || (result.data.categories?.length || result.data.length || 0));
            } else {
                toast.error(result.message || 'Failed to fetch categories');
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Failed to fetch categories. Please try again.');
        }
        setLoading(false);
    };

    const handleDeleteCategory = async (categoryId, categoryName) => {
        if (window.confirm(`Are you sure you want to delete category: ${categoryName}?\n\nWarning: This may affect products in this category.`)) {
            const deletePromise = deleteCategory(categoryId);
            
            toast.promise(
                deletePromise,
                {
                    loading: 'Deleting category...',
                    success: 'Category deleted successfully!',
                    error: 'Failed to delete category',
                }
            );

            const result = await deletePromise;
            if (result.success) {
                fetchCategories();
            }
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleItemsPerPageChange = (value) => {
        setItemsPerPage(value);
        setCurrentPage(1);
    };

    const handleFilterChange = () => {
        setCurrentPage(1);
    };

    useEffect(() => {
        handleFilterChange();
    }, [searchTerm, filterStatus]);

    const sortOptions = [
        { value: 'newest', label: 'Newest First' },
        { value: 'oldest', label: 'Oldest First' },
        { value: 'name', label: 'Name (A-Z)' },
        { value: 'nameDesc', label: 'Name (Z-A)' }
    ];

    const statusOptions = [
        { value: '', label: 'All Status' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' }
    ];

    if (loading && categories.length === 0) {
        return <LoadingSpinner fullScreen />;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <BackButton to="/admin" label="Back to Dashboard" />
                
                {/* Header */}
                <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-[#5c2d16]">Category Management</h1>
                        <p className="text-gray-600 mt-2">Manage product categories ({totalCategories} total)</p>
                    </div>
                    <button
                        onClick={() => navigate('/admin/categories/create')}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold whitespace-nowrap"
                    >
                        + Add Category
                    </button>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {/* Search */}
                        <SearchBar
                            value={searchTerm}
                            onChange={setSearchTerm}
                            placeholder="Search by name or description..."
                            label="Search Categories"
                        />

                        {/* Status Filter */}
                        <FilterSelect
                            value={filterStatus}
                            onChange={setFilterStatus}
                            label="Status"
                            options={statusOptions}
                        />
                    </div>

                    {/* Sort and View Toggle */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-4 flex-wrap">
                            <SortSelect
                                value={sortBy}
                                onChange={setSortBy}
                                options={sortOptions}
                            />

                            <ItemsPerPageSelect
                                value={itemsPerPage}
                                onChange={handleItemsPerPageChange}
                            />

                            <div className="text-sm text-gray-600">
                                Showing <span className="font-semibold">{categories.length}</span> of{' '}
                                <span className="font-semibold">{totalCategories}</span> categories
                            </div>
                        </div>

                        <ViewToggle
                            viewMode={viewMode}
                            onViewModeChange={setViewMode}
                        />
                    </div>
                </div>

                {loading && <LoadingSpinner />}

                {/* Card View */}
                {!loading && viewMode === 'card' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categories.map((category) => (
                            <div key={category._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                                <div className="relative h-48 bg-gray-200">
                                    {category.image ? (
                                        <img
                                            src={category.image}
                                            alt={category.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.parentElement.innerHTML = '<div class="flex items-center justify-center h-full text-gray-400 text-6xl">📁</div>';
                                            }}
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400 text-6xl">
                                            📁
                                        </div>
                                    )}
                                    <span className={`absolute top-2 right-2 px-3 py-1 text-xs font-semibold rounded-full ${
                                        category.isActive 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {category.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-semibold text-[#5c2d16] mb-2">
                                        {category.name}
                                    </h3>
                                    <p className="text-gray-500 text-xs mb-2">
                                        Slug: <span className="font-mono">{category.slug}</span>
                                    </p>
                                    {category.description && (
                                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                            {category.description}
                                        </p>
                                    )}
                                    <div className="text-xs text-gray-500 mb-4">
                                        Created: {new Date(category.createdAt).toLocaleDateString()}
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => navigate(`/admin/categories/edit/${category._id}`)}
                                            className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-semibold"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCategory(category._id, category.name)}
                                            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Table View */}
                {!loading && viewMode === 'table' && (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Image
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Category Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Slug
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Description
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Created
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {categories.map((category) => (
                                        <tr key={category._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="h-16 w-16 rounded-lg overflow-hidden bg-gray-100">
                                                    {category.image ? (
                                                        <img
                                                            src={category.image}
                                                            alt={category.name}
                                                            className="h-full w-full object-cover"
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="flex items-center justify-center h-full text-gray-400 text-3xl">
                                                            📁
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-[#5c2d16]">
                                                    {category.name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-xs font-mono text-gray-500">
                                                    {category.slug}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-600 max-w-xs truncate">
                                                    {category.description || 'No description'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                    category.isActive
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {category.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(category.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => navigate(`/admin/categories/edit/${category._id}`)}
                                                        className="text-gray-600 hover:text-gray-900 font-medium"
                                                        title="Edit category"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteCategory(category._id, category.name)}
                                                        className="text-red-600 hover:text-red-900 font-medium"
                                                        title="Delete category"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* No Results */}
                {!loading && categories.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg shadow-md">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-[#5c2d16]">No categories found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {searchTerm || filterStatus
                                ? 'Try adjusting your filters or search term.'
                                : 'Get started by creating a new category.'}
                        </p>
                        {!searchTerm && !filterStatus && (
                            <div className="mt-6">
                                <button
                                    onClick={() => navigate('/admin/categories/create')}
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                                >
                                    + Add Category
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Pagination */}
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    itemsPerPage={itemsPerPage}
                    onItemsPerPageChange={handleItemsPerPageChange}
                    totalItems={totalCategories}
                    currentItems={categories.length}
                />
            </div>
        </div>
    );
};

export default AdminCategories;
