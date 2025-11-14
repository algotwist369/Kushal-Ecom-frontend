import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import toast from 'react-hot-toast';
import { getAllProducts, deleteProduct, getAllCategories } from '../../../services/adminService';
import BackButton from '../../../components/common/BackButton';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../../../components/admin/common/SearchBar';
import FilterSelect from '../../../components/admin/common/FilterSelect';
import ViewToggle from '../../../components/admin/common/ViewToggle';
import Pagination from '../../../components/admin/common/Pagination';
import SortSelect from '../../../components/admin/common/SortSelect';
import ItemsPerPageSelect from '../../../components/admin/common/ItemsPerPageSelect';
import LoadingSpinner from '../../../components/admin/common/LoadingSpinner';

const AdminProducts = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterStock, setFilterStock] = useState('');
    const [sortBy, setSortBy] = useState('newest');

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(12);

    // View mode
    const [viewMode, setViewMode] = useState('table');

    // Track image load errors
    const [imageErrors, setImageErrors] = useState(new Set());

    // Refs to prevent multiple simultaneous requests
    const fetchingRef = useRef(false);
    const abortControllerRef = useRef(null);

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm, filterCategory, filterStatus, filterStock, sortBy]);

    const fetchCategories = useCallback(async () => {
        try {
            const result = await getAllCategories();
            if (result.success) {
                setCategories(result.data.categories || result.data || []);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    }, []);

    const fetchProducts = useCallback(async () => {
        // Prevent multiple simultaneous requests
        if (fetchingRef.current) {
            return;
        }

        // Abort previous request if still pending
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        fetchingRef.current = true;
        setLoading(true);

        try {
            const params = {
                page: currentPage,
                limit: itemsPerPage,
                ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
                ...(filterCategory && { category: filterCategory }),
                ...(filterStatus && { status: filterStatus }),
                ...(filterStock && { stock: filterStock }),
                ...(sortBy && { sortBy })
            };

            const result = await getAllProducts(params);
            
            // Check if request was aborted
            if (abortControllerRef.current?.signal.aborted) {
                return;
            }

            if (result.success) {
                // Ensure we handle the response structure correctly
                const responseData = result.data || {};

                // Check if products is an array, otherwise default to empty array
                const productsArray = Array.isArray(responseData.products)
                    ? responseData.products
                    : (Array.isArray(responseData) ? responseData : []);

                // Batch state updates for better performance
                setProducts(productsArray);
                setTotalPages(responseData.pages || 1);
                setTotalProducts(responseData.total || 0);
            } else {
                console.error('Error fetching products:', result.message);
                // Batch state updates on error
                setProducts([]);
                setTotalPages(1);
                setTotalProducts(0);
                toast.error(result.message || 'Failed to fetch products');
            }
        } catch (error) {
            // Don't show error if request was aborted
            if (error.name === 'AbortError' || abortControllerRef.current?.signal.aborted) {
                return;
            }
            console.error('Error fetching products:', error);
            // Batch state updates on error
            setProducts([]);
            setTotalPages(1);
            setTotalProducts(0);
            toast.error('Failed to fetch products. Please try again.');
        } finally {
            fetchingRef.current = false;
            setLoading(false);
        }
    }, [currentPage, itemsPerPage, debouncedSearchTerm, filterCategory, filterStatus, filterStock, sortBy]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Clear image errors when products change
    useEffect(() => {
        setImageErrors(new Set());
    }, [products]);

    const handleDeleteProduct = useCallback(async (productId, productName) => {
        if (window.confirm(`Are you sure you want to delete product: ${productName}?\n\nThis action cannot be undone.`)) {
            const deletePromise = deleteProduct(productId);

            toast.promise(
                deletePromise,
                {
                    loading: 'Deleting product...',
                    success: 'Product deleted successfully!',
                    error: (err) => err?.message || 'Failed to delete product',
                }
            );

            const result = await deletePromise;
            if (result.success) {
                // Optimistically update UI - remove product from list immediately
                setProducts(prev => prev.filter(p => p._id !== productId));
                setTotalProducts(prev => Math.max(0, prev - 1));
                // Refresh the product list in background
                fetchProducts();
            } else {
                // Error is already shown by toast.promise, but we can add additional handling if needed
                console.error('Delete failed:', result.message);
            }
        }
    }, [fetchProducts]);

    const handlePageChange = useCallback((page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleItemsPerPageChange = useCallback((value) => {
        setItemsPerPage(value);
        setCurrentPage(1);
    }, []);

    const handleRefresh = useCallback(async () => {
        await Promise.all([fetchProducts(), fetchCategories()]);
        toast.success('Products refreshed successfully!');
    }, [fetchProducts, fetchCategories]);

    // Memoize static options to prevent recreation on every render
    const sortOptions = useMemo(() => [
        { value: 'newest', label: 'Newest First' },
        { value: 'oldest', label: 'Oldest First' },
        { value: 'name', label: 'Name (A-Z)' },
        { value: 'nameDesc', label: 'Name (Z-A)' },
        { value: 'priceAsc', label: 'Price (Low to High)' },
        { value: 'priceDesc', label: 'Price (High to Low)' },
        { value: 'stock', label: 'Stock (Low to High)' },
        { value: 'stockDesc', label: 'Stock (High to Low)' }
    ], []);

    const statusOptions = useMemo(() => [
        { value: '', label: 'All Status' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' }
    ], []);

    const stockOptions = useMemo(() => [
        { value: '', label: 'All Stock' },
        { value: 'instock', label: 'In Stock' },
        { value: 'outofstock', label: 'Out of Stock' }
    ], []);

    // Memoize category options
    const categoryOptions = useMemo(() => [
        { value: '', label: 'All Categories' },
        ...categories.map(cat => ({ value: cat._id, label: cat.name }))
    ], [categories]);

    // Memoize navigation handlers
    const handleNavigateToCreate = useCallback(() => {
        navigate('/admin/products/create');
    }, [navigate]);

    const handleNavigateToEdit = useCallback((productId) => {
        navigate(`/admin/products/edit/${productId}`);
    }, [navigate]);

    if (loading && products.length === 0) {
        return <LoadingSpinner fullScreen />;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <BackButton to="/admin" label="Back to Dashboard" />

                {/* Header */}
                <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-[#5c2d16]">Product Management</h1>
                        <p className="text-gray-600 mt-2">Manage all products ({totalProducts} total)</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleRefresh}
                            disabled={loading}
                            className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            title="Refresh products"
                        >
                            <svg
                                className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                />
                            </svg>
                            Refresh
                        </button>
                        <button
                            onClick={handleNavigateToCreate}
                            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold whitespace-nowrap"
                        >
                            + Add Product
                        </button>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                        {/* Search */}
                        <SearchBar
                            value={searchTerm}
                            onChange={setSearchTerm}
                            placeholder="Search by name or description..."
                            label="Search Products"
                            className="lg:col-span-2"
                        />

                        {/* Category Filter */}
                        <FilterSelect
                            value={filterCategory}
                            onChange={setFilterCategory}
                            label="Category"
                            options={categoryOptions}
                        />

                        {/* Status Filter */}
                        <FilterSelect
                            value={filterStatus}
                            onChange={setFilterStatus}
                            label="Status"
                            options={statusOptions}
                        />

                        {/* Stock Filter */}
                        <FilterSelect
                            value={filterStock}
                            onChange={setFilterStock}
                            label="Stock"
                            options={stockOptions}
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
                                Showing <span className="font-semibold">{products.length}</span> of{' '}
                                <span className="font-semibold">{totalProducts}</span> products
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
                        {products.map((product) => {
                            const hasImage = product.images && product.images[0] && !imageErrors.has(product._id);
                            const handleImageError = () => {
                                setImageErrors(prev => new Set([...prev, product._id]));
                            };
                            
                            return (
                            <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                                <div className="relative h-48 bg-gray-200">
                                    {hasImage ? (
                                        <img
                                            src={product.images[0]}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                            onError={handleImageError}
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400">
                                            No Image
                                        </div>
                                    )}
                                    <span className={`absolute top-2 right-2 px-3 py-1 text-xs font-semibold rounded-full ${product.stock > 0
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                        }`}>
                                        {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                    </span>
                                    {!product.isActive && (
                                        <span className="absolute top-2 left-2 px-3 py-1 text-xs font-semibold rounded-full bg-gray-500 text-white">
                                            Inactive
                                        </span>
                                    )}
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-semibold text-[#5c2d16] mb-2 line-clamp-2">
                                        {product.name}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                        {product.description || 'No description'}
                                    </p>
                                    {product.category?.name && (
                                        <p className="text-xs text-gray-500 mb-3">
                                            📁 {product.category.name}
                                        </p>
                                    )}
                                    <div className="flex justify-between items-center mb-4">
                                        <div>
                                            <span className="text-2xl font-bold text-green-600">
                                                ₹{product.price}
                                            </span>
                                            {product.discountPrice && product.discountPrice < product.price && (
                                                <span className="text-gray-400 line-through ml-2 text-sm">
                                                    ₹{product.discountPrice}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            Stock: <span className="font-semibold">{product.stock}</span>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleNavigateToEdit(product._id)}
                                            className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteProduct(product._id, product.name)}
                                            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                            );
                        })}
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
                                            Product Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Price
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Stock
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {products.map((product) => {
                                        const hasImage = product.images && product.images[0] && !imageErrors.has(product._id);
                                        const handleImageError = () => {
                                            setImageErrors(prev => new Set([...prev, product._id]));
                                        };
                                        
                                        return (
                                        <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="h-16 w-16 rounded-lg overflow-hidden bg-gray-100">
                                                    {hasImage ? (
                                                        <img
                                                            src={product.images[0]}
                                                            alt={product.name}
                                                            className="h-full w-full object-cover"
                                                            onError={handleImageError}
                                                            loading="lazy"
                                                        />
                                                    ) : (
                                                        <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                                                            No Image
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-[#5c2d16] max-w-xs truncate">
                                                    {product.name}
                                                </div>
                                                <div className="text-xs text-gray-500 max-w-xs truncate">
                                                    {product.description || 'No description'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                                                    {product.category?.name || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-green-600">
                                                    ₹{product.price}
                                                </div>
                                                {product.discountPrice && product.discountPrice < product.price && (
                                                    <div className="text-xs text-gray-400 line-through">
                                                        ₹{product.discountPrice}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${product.stock > 10
                                                        ? 'bg-green-100 text-green-800'
                                                        : product.stock > 0
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {product.stock > 0 ? `${product.stock} units` : 'Out of Stock'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${product.isActive
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {product.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleNavigateToEdit(product._id)}
                                                        className="text-gray-600 hover:text-gray-900 font-medium"
                                                        title="Edit product"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteProduct(product._id, product.name)}
                                                        className="text-red-600 hover:text-red-900 font-medium"
                                                        title="Delete product"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* No Results */}
                {!loading && products.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg shadow-md">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-[#5c2d16]">No products found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {searchTerm || filterStatus || filterStock || filterCategory
                                ? 'Try adjusting your filters or search term.'
                                : 'Get started by creating a new product.'}
                        </p>
                        {!searchTerm && !filterStatus && !filterStock && !filterCategory && (
                            <div className="mt-6">
                                <button
                                    onClick={handleNavigateToCreate}
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                                >
                                    + Add Product
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
                    totalItems={totalProducts}
                    currentItems={products.length}
                />
            </div>
        </div>
    );
};

export default AdminProducts;
