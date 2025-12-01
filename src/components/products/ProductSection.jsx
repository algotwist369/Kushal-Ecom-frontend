import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosConfig";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";
import ProductCard from "./ProductCard";

const ProductSection = ({ selectedCategory = null, searchQuery = null }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Memoize fetchProducts to prevent unnecessary recreations
  const fetchProducts = useCallback(async (signal) => {
    setLoading(true);
    setError(null);

    try {
      const body = {
        page: 1,
        limit: 8,
        sortBy: 'newest'
      };

      if (selectedCategory) {
        body.categories = [selectedCategory];
      }

      if (searchQuery) {
        body.search = searchQuery;
      }

      const response = await api.post('/products/filter', body, { signal });
      setProducts(response.data.products || []);
    } catch (err) {
      // Don't set error if request was cancelled
      if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
        console.error('Error fetching products:', err);
        const errorMessage = err.response?.data?.message || err.message || 'Failed to load products';
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery]);

  // Fetch products when dependencies change
  useEffect(() => {
    const abortController = new AbortController();

    fetchProducts(abortController.signal);

    // Cleanup: abort pending request on unmount or dependency change
    return () => {
      abortController.abort();
    };
  }, [fetchProducts]);

  // Memoize handleAddToCart to prevent unnecessary recreations
  const handleAddToCart = useCallback(async (product, e) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    if (product.stock <= 0) {
      toast.error('Product is out of stock');
      return;
    }

    try {
      await addToCart(product._id, 1);
    } catch (error) {
      // Error already handled in context
    }
  }, [isAuthenticated, navigate, addToCart]);

  // Retry handler for error state
  const handleRetry = () => {
    const abortController = new AbortController();
    fetchProducts(abortController.signal);
  };

  // Loading state
  if (loading) {
    return (
      <section className="py-8 sm:py-12 bg-white" id="products-section">
        <div className="max-w-[100rem] mx-auto px-4">
          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#5c2d16] mb-2">
              Our Products
            </h2>
            <p className="text-sm sm:text-base text-gray-600">Discover our premium Ayurvedic collection</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden animate-pulse">
                <div className="h-48 sm:h-64 bg-gray-200"></div>
                <div className="p-3 sm:p-5 space-y-2 sm:space-y-3">
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-2 sm:h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 sm:h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="py-8 sm:py-12 bg-white" id="products-section">
        <div className="max-w-[100rem] mx-auto px-4">
          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#5c2d16] mb-2">
              Our Products
            </h2>
            <p className="text-sm sm:text-base text-gray-600">Discover our premium Ayurvedic collection</p>
          </div>
          <div className="text-center py-12 sm:py-16 bg-red-50 border-2 border-red-200 rounded-lg px-4">
            <svg className="mx-auto h-16 sm:h-20 w-16 sm:w-20 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-lg sm:text-xl font-bold text-red-700 mb-2">Failed to Load Products</h3>
            <p className="text-sm sm:text-base text-red-600 mb-6 max-w-md mx-auto">
              {error}
            </p>
            <button
              onClick={handleRetry}
              className="bg-[#5c2d16] text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg hover:bg-gray-800 transition font-semibold text-sm sm:text-base inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Main content
  return (
    <section className="py-8 sm:py-12 bg-white" id="products-section">
      <div className="max-w-[100rem] mx-auto px-4">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#5c2d16] mb-2">
            {searchQuery ? `Search Results` : selectedCategory ? 'Filtered Products' : 'Our Products'}
          </h2>
          <p className="text-sm sm:text-base text-gray-600">Discover our premium Ayurvedic collection</p>
        </div>

        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>

            {/* View All Button */}
            <div className="mt-6 sm:mt-10 flex justify-center">
              <button
                onClick={() => navigate("/products")}
                className="bg-[#5c2d16] text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg hover:bg-gray-800 transition font-semibold text-sm sm:text-base"
              >
                View All Products →
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-8 sm:py-12 bg-gray-50 border border-gray-200 rounded-lg px-4">
            <svg className="mx-auto h-16 sm:h-24 w-16 sm:w-24 text-gray-400 mb-3 sm:mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-base sm:text-lg text-[#5c2d16] font-medium mb-2">No products available</p>
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              {selectedCategory ? 'Try browsing all products' : 'Check back soon for new arrivals'}
            </p>
            {selectedCategory && (
              <button
                onClick={() => navigate('/products')}
                className="text-[#5c2d16] hover:text-gray-600 font-semibold text-sm sm:text-base"
              >
                View All Products →
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductSection;
