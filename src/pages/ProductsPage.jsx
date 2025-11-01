import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BsCartPlus, BsFilter, BsX, BsChevronLeft, BsSearch } from "react-icons/bs";
import { FaStar } from "react-icons/fa";
import api from "../api/axiosConfig";
import PopUpModal from "../components/common/PopUpModal";

const ProductsPage = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [pagesData, setPagesData] = useState({}); // { [page]: Product[] }
    const [loading, setLoading] = useState(true);
    const [minLoadedPage, setMinLoadedPage] = useState(1);
    const [maxLoadedPage, setMaxLoadedPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const [categories, setCategories] = useState([]);
    const [isLoadingNext, setIsLoadingNext] = useState(false);
    const [isLoadingPrev, setIsLoadingPrev] = useState(false);
    const bottomRef = useRef(null);
    const topRef = useRef(null);
    const gridRef = useRef(null);
    
    // Filter states
    const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
    const [activeSearch, setActiveSearch] = useState(searchParams.get('search') || '');
    const [selectedCategories, setSelectedCategories] = useState(
        searchParams.get('category') ? [searchParams.get('category')] : []
    );
    const [priceRange, setPriceRange] = useState({
        min: searchParams.get('minPrice') || '',
        max: searchParams.get('maxPrice') || ''
    });
    const [selectedPriceBucket, setSelectedPriceBucket] = useState('');
    const [minRating, setMinRating] = useState(searchParams.get('rating') || '');
    const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');
    const [showFilters, setShowFilters] = useState(false);
    
    const productsPerPage = 12;

    // Predefined price buckets
    const priceBuckets = [
        { label: 'Under ₹500', min: 0, max: 500 },
        { label: '₹500 - ₹1000', min: 500, max: 1000 },
        { label: '₹1000 - ₹2000', min: 1000, max: 2000 },
        { label: 'Above ₹2000', min: 2000, max: 999999 }
    ];

    // Flatten visible products in order
    const products = useMemo(() => {
        const items = [];
        for (let p = minLoadedPage; p <= maxLoadedPage; p++) {
            if (pagesData[p]) items.push(...pagesData[p]);
        }
        return items;
    }, [pagesData, minLoadedPage, maxLoadedPage]);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchCategories();
    }, []);

    useEffect(() => {
        // Update state when URL params change
        const search = searchParams.get('search') || '';
        const category = searchParams.get('category') || '';
        setSearchInput(search);
        setActiveSearch(search);
        setSelectedCategories(category ? [category] : []);
        // reset pages on param change
        setPagesData({});
        setMinLoadedPage(1);
        setMaxLoadedPage(1);
        setTotalPages(1);
        setTotalProducts(0);
    }, [searchParams]);

    useEffect(() => {
        let isMounted = true;
        const init = async () => {
            setLoading(true);
            await fetchProducts(1, true);
            if (isMounted) setLoading(false);
        };
        init();
        return () => { isMounted = false; };
    }, [activeSearch, selectedCategories, priceRange, selectedPriceBucket, minRating, sortBy]);

    useEffect(() => {
        // Bottom observer: load next page
        if (!bottomRef.current) return;
        const observer = new IntersectionObserver((entries) => {
            const entry = entries[0];
            if (entry.isIntersecting && !isLoadingNext && maxLoadedPage < totalPages && !loading) {
                setIsLoadingNext(true);
                fetchProducts(maxLoadedPage + 1).finally(() => setIsLoadingNext(false));
            }
        }, { root: null, rootMargin: '200px', threshold: 0 });
        observer.observe(bottomRef.current);
        return () => observer.disconnect();
    }, [maxLoadedPage, totalPages, isLoadingNext, loading]);

    useEffect(() => {
        // Top observer: load previous page
        if (!topRef.current) return;
        const observer = new IntersectionObserver((entries) => {
            const entry = entries[0];
            if (entry.isIntersecting && !isLoadingPrev && minLoadedPage > 1 && !loading) {
                setIsLoadingPrev(true);
                // Try to preserve scroll position by recording current height
                const oldHeight = gridRef.current ? gridRef.current.scrollHeight : 0;
                fetchProducts(minLoadedPage - 1).then(() => {
                    // After prepending, adjust scroll to prevent jump
                    requestAnimationFrame(() => {
                        if (gridRef.current) {
                            const newHeight = gridRef.current.scrollHeight;
                            const delta = newHeight - oldHeight;
                            window.scrollBy(0, delta);
                        }
                    });
                }).finally(() => setIsLoadingPrev(false));
            }
        }, { root: null, rootMargin: '200px', threshold: 0 });
        observer.observe(topRef.current);
        return () => observer.disconnect();
    }, [minLoadedPage, isLoadingPrev, loading]);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories');
            setCategories(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const buildFilterBody = (page) => {
        const body = { page, limit: productsPerPage, sortBy };
        if (activeSearch) body.search = activeSearch;
        if (selectedCategories.length > 0) body.categories = selectedCategories;
        if (selectedPriceBucket) {
            const bucket = priceBuckets.find(b => b.label === selectedPriceBucket);
            if (bucket) body.priceBuckets = [bucket];
        } else if (priceRange.min || priceRange.max) {
            if (priceRange.min) body.minPrice = Number(priceRange.min);
            if (priceRange.max) body.maxPrice = Number(priceRange.max);
        }
        if (minRating) body.rating = Number(minRating);
        return body;
    };

    const fetchProducts = async (page, replace = false) => {
        try {
            const body = buildFilterBody(page);
            const response = await api.post('/products/filter', body);
            const newProducts = response.data.products || [];
            const total = response.data.total || 0;
            const pages = response.data.pages || 1;
            setTotalProducts(total);
            setTotalPages(pages);
            setPagesData(prev => {
                const next = replace ? {} : { ...prev };
                next[page] = newProducts;
                return next;
            });
            setMinLoadedPage(prev => Math.min(prev, page));
            setMaxLoadedPage(prev => Math.max(prev, page));
        } catch (error) {
            console.error('Error fetching products:', error);
            if (replace) {
                setPagesData({});
                setTotalProducts(0);
                setTotalPages(1);
                setMinLoadedPage(1);
                setMaxLoadedPage(1);
            }
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setActiveSearch(searchInput);
    };

    const handleCategoryToggle = (categoryId) => {
        setSelectedCategories(prev => {
            if (prev.includes(categoryId)) return prev.filter(id => id !== categoryId);
            return [...prev, categoryId];
        });
    };

    const handlePriceBucketChange = (bucketLabel) => {
        setSelectedPriceBucket(bucketLabel);
        setPriceRange({ min: '', max: '' });
    };

    const handleCustomPriceChange = () => {
        setSelectedPriceBucket('');
    };

    const handleRatingChange = (rating) => {
        setMinRating(rating === minRating ? '' : rating);
    };

    const handleSortChange = (newSort) => {
        setSortBy(newSort);
    };

    const clearFilters = () => {
        setSearchInput('');
        setActiveSearch('');
        setSelectedCategories([]);
        setPriceRange({ min: '', max: '' });
        setSelectedPriceBucket('');
        setMinRating('');
        setSortBy('newest');
        navigate('/products');
    };

    const getDiscount = (oldPrice, price) => {
        return Math.round(((oldPrice - price) / oldPrice) * 100);
    };

    const hasActiveFilters = activeSearch || selectedCategories.length > 0 || priceRange.min || priceRange.max || selectedPriceBucket || minRating || sortBy !== 'newest';

    if (loading && products.length === 0) {
        return (
            <section className="py-8 bg-gray-50 min-h-screen">
                <div className="max-w-[100rem] mx-auto px-4">
                    <h1 className="text-3xl font-bold mb-8 text-[#5c2d16]">All Products</h1>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[1,2,3,4,5,6,7,8].map(i => (
                            <div key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden animate-pulse">
                                <div className="h-64 bg-gray-200"></div>
                                <div className="p-5 space-y-3">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <>
            <PopUpModal />
            <section className="py-8 bg-gray-50 min-h-screen">
                <div className="max-w-[100rem] mx-auto px-4">
                    {/* Back Button */}
                    <button 
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-gray-600 hover:text-[#5c2d16] mb-6 transition group"
                >
                    <BsChevronLeft className="text-xl group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium">Back to Home</span>
                </button>

                {/* Mobile Filter Toggle */}
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden w-full bg-white border border-gray-300 text-[#5c2d16] px-6 py-3 rounded-lg mb-4 flex items-center justify-center gap-2 font-medium hover:bg-gray-50 transition"
                >
                    <BsFilter className="text-xl" />
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                </button>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Filters Sidebar */}
                    <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-72 lg:sticky lg:top-24 lg:h-[calc(100vh-6rem)] lg:overflow-y-auto no-scrollbar max-lg:relative`}> 
                        <div className="bg-white rounded-lg border border-gray-200 p-5">
                            {/* Search Filter */}
                            <div className="mb-6">
                                <h3 className="font-bold text-lg mb-4 text-[#5c2d16]">Search</h3>
                                <form onSubmit={handleSearch} className="flex items-center gap-2">
                                    <div className="relative flex-1">
                                        <BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                                        <input
                                            type="text"
                                            placeholder="Search products..."
                                            value={searchInput}
                                            onChange={(e) => setSearchInput(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5c2d16] focus:border-transparent text-sm"
                                            aria-label="Search products"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="shrink-0 h-[44px] w-[44px] flex items-center justify-center bg-[#5c2d16] text-white rounded-lg hover:bg-gray-800 transition"
                                        aria-label="Search"
                                        title="Search"
                                    >
                                        <BsSearch className="text-lg" />
                                    </button>
                                </form>
                            </div>

                            {/* Category Filter */}
                            <div className="mb-6">
                                <h3 className="font-bold text-lg mb-4 text-[#5c2d16]">Categories</h3>
                                <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar">
                                    {categories.map(cat => (
                                        <label key={cat._id} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition">
                                            <input
                                                type="checkbox"
                                                checked={selectedCategories.includes(cat._id)}
                                                onChange={() => handleCategoryToggle(cat._id)}
                                                className="w-4 h-4 text-[#5c2d16] rounded focus:ring-[#5c2d16]"
                                            />
                                            <span className="text-sm text-gray-700">{cat.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Price Filter */}
                            <div className="mb-6">
                                <h3 className="font-bold text-lg mb-4 text-[#5c2d16]">Price Range</h3>
                                {/* Price Buckets */}
                                <div className="space-y-2 mb-4">
                                    {priceBuckets.map(bucket => (
                                        <label key={bucket.label} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition">
                                            <input
                                                type="radio"
                                                name="priceBucket"
                                                checked={selectedPriceBucket === bucket.label}
                                                onChange={() => handlePriceBucketChange(bucket.label)}
                                                className="w-4 h-4 text-[#5c2d16] focus:ring-[#5c2d16]"
                                            />
                                            <span className="text-sm text-gray-700">{bucket.label}</span>
                                        </label>
                                    ))}
                                </div>
                                {/* Custom Price Range */}
                                <div className="pt-4 border-t border-gray-200">
                                    <p className="text-sm font-medium text-[#5c2d16] mb-3">Custom Range</p>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            value={priceRange.min}
                                            onChange={(e) => { setPriceRange(prev => ({ ...prev, min: e.target.value })); handleCustomPriceChange(); }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#5c2d16] focus:border-transparent"
                                        />
                                        <span className="self-center text-gray-500">-</span>
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            value={priceRange.max}
                                            onChange={(e) => { setPriceRange(prev => ({ ...prev, max: e.target.value })); handleCustomPriceChange(); }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#5c2d16] focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Rating Filter */}
                            <div className="mb-6">
                                <h3 className="font-bold text-lg mb-4 text-[#5c2d16]">Minimum Rating</h3>
                                <div className="space-y-2">
                                    {[4, 3, 2, 1].map(rating => (
                                        <label key={rating} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition">
                                            <input
                                                type="radio"
                                                name="rating"
                                                checked={minRating === rating.toString()}
                                                onChange={() => handleRatingChange(rating.toString())}
                                                className="w-4 h-4 text-[#5c2d16] focus:ring-[#5c2d16]"
                                            />
                                            <div className="flex items-center gap-1">
                                                {[...Array(rating)].map((_, i) => (
                                                    <FaStar key={i} className="text-yellow-400 text-sm" />
                                                ))}
                                                <span className="text-sm ml-1 text-gray-700">& Up</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Clear Filters */}
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="w-full bg-[#5c2d16] text-white px-4 py-3 rounded-lg hover:bg-gray-800 transition flex items-center justify-center gap-2 font-medium"
                                >
                                    <BsX className="text-xl" />
                                    Clear All Filters
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="flex-1" ref={gridRef}>
                        {/* Sort and Results Count */}
                        <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <p className="text-gray-700">
                                    Showing <span className="font-bold text-[#5c2d16]">{products.length}</span> of <span className="font-bold text-[#5c2d16]">{totalProducts}</span> products
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="text-sm text-[#5c2d16] font-medium">Sort by:</label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => handleSortChange(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5c2d16] focus:border-transparent text-sm"
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="priceAsc">Price: Low to High</option>
                                    <option value="priceDesc">Price: High to Low</option>
                                    <option value="rating">Highest Rated</option>
                                </select>
                            </div>
                        </div>

                        {/* Active Filters Display */}
                        {hasActiveFilters && (
                            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-sm font-semibold text-[#5c2d16]">Active Filters:</span>
                                    {activeSearch && (
                                        <span className="px-3 py-1 bg-gray-100 border border-gray-300 text-[#5c2d16] rounded-lg text-sm flex items-center gap-2">
                                            Search: "{activeSearch}"
                                            <button onClick={() => { setSearchInput(''); setActiveSearch(''); }} className="hover:text-gray-600">
                                                <BsX className="text-lg" />
                                            </button>
                                        </span>
                                    )}
                                    {selectedCategories.map(catId => {
                                        const cat = categories.find(c => c._id === catId);
                                        return cat ? (
                                            <span key={catId} className="px-3 py-1 bg-gray-100 border border-gray-300 text-[#5c2d16] rounded-lg text-sm flex items-center gap-2">
                                                {cat.name}
                                                <button onClick={() => handleCategoryToggle(catId)} className="hover:text-gray-600">
                                                    <BsX className="text-lg" />
                                                </button>
                                            </span>
                                        ) : null;
                                    })}
                                    {selectedPriceBucket && (
                                        <span className="px-3 py-1 bg-gray-100 border border-gray-300 text-[#5c2d16] rounded-lg text-sm flex items-center gap-2">
                                            {selectedPriceBucket}
                                            <button onClick={() => setSelectedPriceBucket('')} className="hover:text-gray-600">
                                                <BsX className="text-lg" />
                                            </button>
                                        </span>
                                    )}
                                    {(priceRange.min || priceRange.max) && !selectedPriceBucket && (
                                        <span className="px-3 py-1 bg-gray-100 border border-gray-300 text-[#5c2d16] rounded-lg text-sm flex items-center gap-2">
                                            ₹{priceRange.min || '0'} - ₹{priceRange.max || '∞'}
                                            <button onClick={() => setPriceRange({ min: '', max: '' })} className="hover:text-gray-600">
                                                <BsX className="text-lg" />
                                            </button>
                                        </span>
                                    )}
                                    {minRating && (
                                        <span className="px-3 py-1 bg-gray-100 border border-gray-300 text-[#5c2d16] rounded-lg text-sm flex items-center gap-2">
                                            {minRating}+ ⭐
                                            <button onClick={() => setMinRating('')} className="hover:text-gray-600">
                                                <BsX className="text-lg" />
                                            </button>
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Top sentinel for upward loading */}
                        <div ref={topRef} />

                        {/* Products Grid */}
                        {products.length > 0 ? (
                            <>
                                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                                    {products.map((product) => (
                                        <div
                                            key={product._id}
                                            className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer flex flex-col"
                                            onClick={() => navigate(`/products/${product.slug || product._id}`)}
                                        >
                                            {/* Product Image */}
                                            <div className="relative overflow-hidden h-48 sm:h-64 bg-gray-50">
                                                {/* First Image */}
                                                <img
                                                    src={product.images?.[0] || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect width="400" height="400" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E'}
                                                    alt={product.name}
                                                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${product.images?.[1] ? 'group-hover:opacity-0' : 'group-hover:scale-105'}`}
                                                    onError={(e) => {
                                                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect width="400" height="400" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E';
                                                    }}
                                                />
                                                {/* Second Image (shown on hover) */}
                                                {product.images?.[1] && (
                                                    <img
                                                        src={product.images[1]}
                                                        alt={product.name}
                                                        className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                                        onError={(e) => { e.target.style.display = 'none'; }}
                                                    />
                                                )}
                                                {/* Badges - Top Left */}
                                                <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-col gap-1 sm:gap-2 z-10">
                                                    {product.discountPrice && product.discountPrice < product.price && (
                                                        <div className="bg-[#5c2d16] text-white text-xs font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded">
                                                            {getDiscount(product.price, product.discountPrice)}% OFF
                                                        </div>
                                                    )}
                                                </div>
                                                {/* Out of Stock Overlay */}
                                                {product.stock <= 0 && (
                                                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                                                        <span className="bg-white text-[#5c2d16] px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-bold text-xs sm:text-sm">
                                                            Out of Stock
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            {/* Product Info */}
                                            <div className="p-3 sm:p-5 flex-1 flex flex-col">
                                                <h3 className="font-semibold text-[#5c2d16] mb-2 line-clamp-2 text-sm sm:text-base min-h-[2.5rem] sm:min-h-[3rem] group-hover:text-gray-600 transition">
                                                    {product.name}
                                                </h3>
                                                {/* Rating */}
                                                {product.averageRating > 0 && (
                                                    <div className="flex items-center gap-1 sm:gap-2 mb-2 sm:mb-3">
                                                        <div className="flex items-center gap-0.5 sm:gap-1">
                                                            <FaStar className="text-yellow-400 text-xs sm:text-sm" />
                                                            <span className="text-xs sm:text-sm font-medium text-[#5c2d16]">{product.averageRating.toFixed(1)}</span>
                                                        </div>
                                                        <span className="text-xs text-gray-500">({product.numReviews || 0})</span>
                                                    </div>
                                                )}
                                                <div className="mt-auto">
                                                    {/* Price */}
                                                    <div className="flex items-baseline gap-1 sm:gap-2 mb-2 sm:mb-3">
                                                        <span className="text-lg sm:text-2xl font-bold text-[#5c2d16]">₹{product.discountPrice || product.price}</span>
                                                        {product.discountPrice && product.discountPrice < product.price && (
                                                            <span className="text-xs sm:text-sm text-gray-400 line-through">₹{product.price}</span>
                                                        )}
                                                    </div>
                                                    {/* Pack Options Info */}
                                                    {product.packOptions && product.packOptions.length > 0 && (
                                                        <p className="text-xs text-gray-600 mb-2 sm:mb-3 hidden sm:block">Pack options available</p>
                                                    )}
                                                    {/* View Button */}
                                                    <button 
                                                        className="w-full bg-[#5c2d16] text-white py-2 sm:py-3 rounded-lg hover:bg-gray-800 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base"
                                                        disabled={product.stock <= 0}
                                                        onClick={(e) => { e.stopPropagation(); navigate(`/products/${product.slug || product._id}`); }}
                                                    >
                                                        <BsCartPlus className="text-base sm:text-lg" />
                                                        <span className="hidden sm:inline">{product.stock <= 0 ? 'Out of Stock' : 'View Product'}</span>
                                                        <span className="sm:hidden">{product.stock <= 0 ? 'Out' : 'View'}</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {/* Sentinel Loader for Infinite Scroll */}
                                <div ref={bottomRef} className="h-12 flex items-center justify-center mt-6">
                                    {(isLoadingNext || isLoadingPrev) && (
                                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                                            <span className="inline-block h-4 w-4 border-2 border-gray-300 border-t-[#5c2d16] rounded-full animate-spin"></span>
                                            Loading products...
                                        </div>
                                    )}
                                    {maxLoadedPage >= totalPages && products.length > 0 && (
                                        <div className="text-gray-500 text-sm">You've reached the end</div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                                <p className="text-[#5c2d16] text-xl font-medium mb-2">No products found</p>
                                <p className="text-gray-600 mb-6">{activeSearch || selectedCategories.length > 0 ? 'Try adjusting your filters to find what you\'re looking for' : 'No products available at the moment'}</p>
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="bg-[#5c2d16] text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition font-medium"
                                    >
                                        Clear Filters & View All Products
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
        </>
    );
};

export default ProductsPage;
