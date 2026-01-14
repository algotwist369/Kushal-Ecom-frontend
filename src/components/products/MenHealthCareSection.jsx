import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import CategoryCard from './CategoryCard';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const MenHealthCareSection = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryId, setCategoryId] = useState(null);

  // Memoize fetchMenHealthProducts to prevent unnecessary recreations
  const fetchMenHealthProducts = useCallback(async (signal) => {
    setLoading(true);
    setError(null);

    try {
      // First, get all categories to find the Men Health category
      const categoriesResponse = await api.get('/categories', { signal });
      const categories = categoriesResponse.data.categories || categoriesResponse.data || [];

      // Find category that matches "Men" or "Male" (case insensitive)
      const menCategory = categories.find(cat =>
        cat.name.toLowerCase().includes('men') ||
        cat.name.toLowerCase().includes('man') ||
        cat.name.toLowerCase().includes('male') ||
        cat.name.toLowerCase().includes('gents')
      );

      if (menCategory) {
        setCategoryId(menCategory._id);

        // Fetch products for this category
        const response = await api.post('/products/filter', {
          categories: [menCategory._id],
          page: 1,
          limit: 8
        }, { signal });

        setProducts(response.data.products || []);
      }
      // If no men category found, don't show the section (products stays empty)
    } catch (err) {
      // Don't set error if request was cancelled
      if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
        console.error('Error fetching men health products:', err);
        const errorMessage = err.response?.data?.message || err.message || 'Failed to load men health products';
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch men health products on mount
  useEffect(() => {
    const abortController = new AbortController();

    fetchMenHealthProducts(abortController.signal);

    // Cleanup: abort pending request on unmount
    return () => {
      abortController.abort();
    };
  }, [fetchMenHealthProducts]);

  // Memoize handleAddToCart to prevent unnecessary recreations
  const handleAddToCart = useCallback(async (product, e) => {
    e.stopPropagation();



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
    fetchMenHealthProducts(abortController.signal);
  };

  // Banner click handler
  const handleBannerClick = useCallback(() => {
    if (categoryId) {
      navigate(`/products?category=${categoryId}`);
    }
  }, [categoryId, navigate]);

  // Loading state
  if (loading) {
    return (
      <section className="py-8 sm:py-12 bg-gray-50" id="men-health-section">
        <div className="max-w-[100rem] mx-auto px-4">
          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#5c2d16] mb-2">
              Men Health Care
            </h2>
            <p className="text-sm sm:text-base text-gray-600">Strength and vitality for modern men</p>
          </div>

          {/* Poster */}
          <div className="mb-6 sm:mb-8 rounded-lg overflow-hidden">
            <img
              src="/category/man_health.jpeg"
              alt="Men Health Care"
              className="w-full h-48 sm:h-64 md:h-[35rem] object-cover"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {[1, 2, 3, 4].map(i => (
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
      <section className="py-8 sm:py-12 bg-gray-50" id="men-health-section">
        <div className="max-w-[100rem] mx-auto px-4">
          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#5c2d16] mb-2">
              Men Health Care
            </h2>
            <p className="text-sm sm:text-base text-gray-600">Strength and vitality for modern men</p>
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

  // Empty state - don't show section if no products
  if (!products || products.length === 0) {
    return null;
  }

  // Main content
  return (
    <section className="py-8 sm:py-12 bg-gray-50" id="men-health-section">
      <div className="max-w-[100rem] mx-auto px-4">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#5c2d16] mb-2">
            Men Health Care
          </h2>
          <p className="text-sm sm:text-base text-gray-600">Strength and vitality for modern men</p>
        </div>

        {/* Poster Banner */}
        <div className="mb-6 sm:mb-8 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition">
          <img
            src="/category/man_health.jpeg"
            alt="Men Health Care"
            className="w-full h-full object-contain cursor-pointer"
            onClick={handleBannerClick}
          />
        </div>

        <div className="men-health-slider relative">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={12}
            slidesPerView={2}
            grabCursor={true}
            loop={products.length > 4}
            autoHeight={false}
            watchSlidesProgress={true}
            navigation={{
              nextEl: '.men-health-swiper-button-next',
              prevEl: '.men-health-swiper-button-prev',
            }}
            pagination={{
              clickable: true,
              el: '.men-health-swiper-pagination',
            }}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            breakpoints={{
              640: {
                slidesPerView: 2,
                spaceBetween: 16,
              },
              768: {
                slidesPerView: 3,
                spaceBetween: 16,
              },
              1024: {
                slidesPerView: 4,
                spaceBetween: 20,
              },
            }}
            className="pb-12"
          >
            {products.map((product) => (
              <SwiperSlide key={product._id}>
                <CategoryCard
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Navigation Buttons - Hidden on mobile, visible on md+ */}
          <button className="men-health-swiper-button-prev hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 z-10 bg-white border-2 border-gray-300 rounded-full w-10 h-10 items-center justify-center hover:border-[#5c2d16] hover:bg-[#5c2d16] hover:text-white transition shadow-md disabled:opacity-30 disabled:cursor-not-allowed">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button className="men-health-swiper-button-next hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-10 bg-white border-2 border-gray-300 rounded-full w-10 h-10 items-center justify-center hover:border-[#5c2d16] hover:bg-[#5c2d16] hover:text-white transition shadow-md disabled:opacity-30 disabled:cursor-not-allowed">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Custom Pagination */}
          <div className="men-health-swiper-pagination flex justify-center mt-4"></div>
        </div>

        {/* View All Button */}
        {categoryId && (
          <div className="mt-6 sm:mt-8 flex justify-center">
            <button
              onClick={handleBannerClick}
              className="bg-[#5c2d16] text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg hover:bg-gray-800 transition font-semibold text-sm sm:text-base"
            >
              View All Men Health Products →
            </button>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .men-health-slider .swiper-slide {
          height: auto;
          display: flex;
          width: calc((100% - 12px) / 2) !important;
        }
        @media (min-width: 640px) {
          .men-health-slider .swiper-slide {
            width: calc((100% - 16px) / 2) !important;
          }
        }
        @media (min-width: 768px) {
          .men-health-slider .swiper-slide {
            width: calc((100% - 32px) / 3) !important;
          }
        }
        @media (min-width: 1024px) {
          .men-health-slider .swiper-slide {
            width: calc((100% - 60px) / 4) !important;
          }
        }
        .men-health-slider .swiper-slide > div {
          width: 100%;
        }
        .men-health-slider .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          background: #d1d5db;
          opacity: 1;
          transition: all 0.3s;
        }
        .men-health-slider .swiper-pagination-bullet-active {
          width: 24px;
          border-radius: 4px;
          background: #111827;
        }
        .men-health-swiper-button-prev.swiper-button-disabled,
        .men-health-swiper-button-next.swiper-button-disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
      `}} />
    </section>
  );
};

export default MenHealthCareSection;
