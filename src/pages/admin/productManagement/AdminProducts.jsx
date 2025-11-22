import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import toast from 'react-hot-toast';
import { getAllProducts, deleteProduct, getAllCategories } from '../../../services/adminService';
import BackButton from '../../../components/common/BackButton';
import { useNavigate, useLocation } from 'react-router-dom';
import SearchBar from '../../../components/admin/common/SearchBar';
import FilterSelect from '../../../components/admin/common/FilterSelect';
import ViewToggle from '../../../components/admin/common/ViewToggle';
import Pagination from '../../../components/admin/common/Pagination';
import SortSelect from '../../../components/admin/common/SortSelect';
import ItemsPerPageSelect from '../../../components/admin/common/ItemsPerPageSelect';
import LoadingSpinner from '../../../components/admin/common/LoadingSpinner';
import { RiGalleryFill, RiRefreshLine } from 'react-icons/ri';
import { LuPlus } from 'react-icons/lu';
import { FaRegEdit, FaTrash } from 'react-icons/fa';


const AdminProducts = () => {
    const navigate = useNavigate();
    const location = useLocation();
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

    // Refs for request management
    const abortControllerRef = useRef(null);
    const previousLocationRef = useRef(location.pathname);

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
            if (result.success && result.data) {
                // Backend returns { categories: [...], total: ..., page: ... }
                // Handle both possible response structures
                let categoriesData = [];
                
                if (Array.isArray(result.data)) {
                    // If data is directly an array
                    categoriesData = result.data;
                } else if (Array.isArray(result.data.categories)) {
                    // If data is an object with categories property
                    categoriesData = result.data.categories;
                } else if (result.data.categories && !Array.isArray(result.data.categories)) {
                    // If categories exists but is not an array, try to convert
                    categoriesData = [];
                }
                
                // Always ensure it's an array
                setCategories(Array.isArray(categoriesData) ? categoriesData : []);
            } else {
                // If request failed, ensure categories is still an array
                setCategories([]);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            // On error, ensure categories is still an array
            setCategories([]);
        }
    }, []);

    const fetchProducts = useCallback(async () => {
        // Abort previous request if still pending
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Create new AbortController for this request
        abortControllerRef.current = new AbortController();
        const currentAbortController = abortControllerRef.current;

        // Set loading state for initial load or when explicitly needed
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

            const result = await getAllProducts(params, currentAbortController.signal);

            // Check if request was aborted
            if (currentAbortController.signal.aborted || result.aborted) {
                // Reset loading state if aborted
                if (abortControllerRef.current === currentAbortController) {
                    setLoading(false);
                }
                return;
            }

            if (result.success) {
                // Ensure we handle the response structure correctly
                const responseData = result.data || {};

                // Check if products is an array, otherwise default to empty array
                // Handle null/undefined safely
                let productsArray = [];
                if (Array.isArray(responseData.products)) {
                    productsArray = responseData.products;
                } else if (Array.isArray(responseData)) {
                    productsArray = responseData;
                }

                // Update state immediately - React will batch these updates
                // Only update if this is still the current request
                if (abortControllerRef.current === currentAbortController) {
                    setProducts([...productsArray]);
                    setTotalPages(responseData.pages || 1);
                    setTotalProducts(responseData.total || 0);
                    setLoading(false);
                }

            } else {
                console.error('❌ Error fetching products:', result.message);
                // Only update state if this is still the current request
                if (abortControllerRef.current === currentAbortController) {
                    setProducts([]);
                    setTotalPages(1);
                    setTotalProducts(0);
                    setLoading(false);
                    toast.error(result.message || 'Failed to fetch products');
                }
            }
        } catch (error) {
            // Don't show error if request was aborted
            if (error.name === 'AbortError' || error.code === 'ERR_CANCELED' || currentAbortController.signal.aborted) {
                // Reset loading state if aborted
                if (abortControllerRef.current === currentAbortController) {
                    setLoading(false);
                }
                return;
            }
            console.error('❌ Error fetching products:', error);
            // Only update state if this is still the current request
            if (abortControllerRef.current === currentAbortController) {
                setProducts([]);
                setTotalPages(1);
                setTotalProducts(0);
                setLoading(false);
                toast.error('Failed to fetch products. Please try again.');
            }
        }
    }, [currentPage, itemsPerPage, debouncedSearchTerm, filterCategory, filterStatus, filterStock, sortBy]);

    // Initial data fetch on mount and when filters change
    useEffect(() => {
        // Fetch categories first (non-blocking, doesn't block products)
        fetchCategories();
        
        // Fetch products immediately - no delays
        fetchProducts();

        // Cleanup function to abort request on unmount or when dependencies change
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [fetchProducts, fetchCategories]);

    // Refresh data when navigating back from edit/create pages
    useEffect(() => {
        const currentPath = location.pathname;
        const previousPath = previousLocationRef.current;

        // Only refresh if we actually navigated from edit/create page
        if (previousPath && previousPath !== currentPath) {
            const state = location.state;
            if (state?.from === 'edit' || state?.from === 'create') {
                // Fetch immediately without delay
                fetchProducts();
                fetchCategories();
            } else if (previousPath.includes('/edit/') || previousPath.includes('/create')) {
                // Fallback: detect if previous path was edit/create (when state is not available)
                fetchProducts();
                fetchCategories();
            }
        }

        previousLocationRef.current = currentPath;
    }, [location.pathname, location.state, fetchProducts, fetchCategories]);

    // Refresh data when window regains focus (user switches back to tab)
    useEffect(() => {
        const handleFocus = () => {
            // Only refresh if we haven't refreshed recently (avoid excessive refreshes)
            const lastRefresh = sessionStorage.getItem('lastProductsRefresh');
            const now = Date.now();
            if (!lastRefresh || (now - parseInt(lastRefresh)) > 2000) {
                sessionStorage.setItem('lastProductsRefresh', now.toString());
                fetchProducts();
                fetchCategories();
            }
        };

        window.addEventListener('focus', handleFocus);
        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, [fetchProducts, fetchCategories]);

    // Clear image errors when products change
    useEffect(() => {
        if (products && products.length > 0) {
            setImageErrors(new Set());
        }
    }, [products]);

    const handleDeleteProduct = useCallback(async (productId, productName) => {
        if (window.confirm(`Are you sure you want to delete product: ${productName}?\n\nThis action cannot be undone.`)) {
            const deletePromise = deleteProduct(productId);

            toast.promise(
                deletePromise,
                {
                    loading: 'Deleting product...',
                    success: 'Product deleted successfully!',
                    error: (err) => {
                        // Show detailed error message, especially for order-related errors
                        const errorMsg = err?.message || err?.response?.data?.message || 'Failed to delete product';
                        return errorMsg;
                    },
                }
            );

            const result = await deletePromise;
            if (result.success) {
                // Optimistically update UI - remove product from list immediately
                setProducts(prev => {
                    const updated = prev.filter(p => p._id !== productId);
                    // If current page becomes empty and not on first page, go to previous page
                    if (updated.length === 0 && currentPage > 1) {
                        setCurrentPage(prevPage => Math.max(1, prevPage - 1));
                    }
                    return updated;
                });
                setTotalProducts(prev => Math.max(0, prev - 1));
                // Refresh the product list in background to ensure consistency
                fetchProducts();
            } else {
                // Show detailed error message
                const errorMessage = result.message || 'Failed to delete product';
                console.error('Delete failed:', errorMessage);

                // If it's an order-related error, show a more helpful message
                if (errorMessage.includes('order') || errorMessage.includes('Order')) {
                    toast.error(errorMessage, {
                        duration: 6000, // Show longer for important messages
                        style: {
                            background: '#fee2e2',
                            color: '#991b1b',
                        }
                    });
                }
            }
        }
    }, [fetchProducts, currentPage]);

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
    const categoryOptions = useMemo(() => {
        // Ensure categories is always an array
        const safeCategories = Array.isArray(categories) ? categories : [];
        return [
            { value: '', label: 'All Categories' },
            ...safeCategories.map(cat => ({ 
                value: cat?._id || cat?.id || '', 
                label: cat?.name || 'Unnamed Category' 
            }))
        ];
    }, [categories]);

    // Memoize navigation handlers
    const handleNavigateToCreate = useCallback(() => {
        navigate('/admin/products/create');
    }, [navigate]);

    const handleNavigateToEdit = useCallback((productId) => {
        navigate(`/admin/products/edit/${productId}`);
    }, [navigate]);

    if (loading && (!products || products.length === 0)) {
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
                            className="bg-gray-200 p-2 rounded-lg"
                            title="Refresh products"
                        >
                            <RiRefreshLine className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                            onClick={handleNavigateToCreate}
                            className="bg-gray-200 p-2 rounded-lg flex items-center gap-2"
                        >
                            <LuPlus className="w-5 h-5" />
                            Add Product
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
                {!loading && viewMode === 'card' && (
                    <div className="text-center text-gray-500">
                        Not available
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
                                    {products && products.length > 0 ? products
                                        .filter(product => product && product._id)
                                        .map((product) => {
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
                                                    {product.discountPrice && product.discountPrice < product.price ? (
                                                        <>
                                                            <div className="text-sm font-bold text-gray-600">
                                                                ₹{product.discountPrice}
                                                            </div>
                                                            <div className="text-xs text-gray-400 line-through">
                                                                ₹{product.price}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="text-sm font-bold text-gray-600">
                                                            ₹{product.price}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${product.stock > 10
                                                        ? 'bg-gray-100 text-gray-800'
                                                        : product.stock > 0
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : 'bg-red-100 text-red-800'
                                                        }`}>
                                                        {product.stock > 0 ? `${product.stock} units` : 'Out of Stock'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${product.isActive
                                                        ? 'bg-gray-100 text-gray-800'
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
                                                            <FaRegEdit className="w-5 h-5 text-green-700" />

                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteProduct(product._id, product.name)}
                                                            className="text-red-600 hover:text-red-900 font-medium"
                                                            title="Delete product"
                                                        >
                                                            <FaTrash className="w-5 h-5 text-red-700" />

                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                                                No products available
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* No Results */}
                {!loading && products.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg shadow-md">
                        <RiGalleryFill className="mx-auto h-12 w-12 text-gray-400" />
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
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700"
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
