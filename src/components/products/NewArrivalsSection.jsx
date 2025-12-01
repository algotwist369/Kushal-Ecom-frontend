import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import NewArrivalsCard from './NewArrivalsCard';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const NewArrivalsSection = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Memoize fetchNewArrivals to prevent unnecessary recreations
  const fetchNewArrivals = useCallback(async (signal) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/products/new-arrivals?limit=12', { signal });
      setProducts(response.data.products || []);
    } catch (err) {
      // Don't set error if request was cancelled
      if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
        console.error('Error fetching new arrivals:', err);
        // Don't show error if it's just a 404 or empty result
        if (err.response?.status !== 404) {
          const errorMessage = err.response?.data?.message || err.message || 'Failed to load new arrivals';
          setError(errorMessage);
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch new arrivals on mount
  useEffect(() => {
    const abortController = new AbortController();

    fetchNewArrivals(abortController.signal);

    // Cleanup: abort pending request on unmount
    return () => {
      abortController.abort();
    };
  }, [fetchNewArrivals]);

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
    fetchNewArrivals(abortController.signal);
  };

  // Loading state
  if (loading) {
    return (
      <section className="py-8 sm:py-12 bg-gray-50" id="newarrivals-section">
        <div className="max-w-[100rem] mx-auto px-4">
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#5c2d16]">
                New Arrivals
              </h2>
            </div>
            <p className="text-sm sm:text-base text-gray-600">Discover our latest products</p>
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
      <section className="py-8 sm:py-12 bg-gray-50" id="newarrivals-section">
        <div className="max-w-[100rem] mx-auto px-4">
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#5c2d16]">
                New Arrivals
              </h2>
            </div>
            <p className="text-sm sm:text-base text-gray-600">Discover our latest products</p>
          </div>
          <div className="text-center py-12 sm:py-16 bg-red-50 border-2 border-red-200 rounded-lg px-4">
            <svg className="mx-auto h-16 sm:h-20 w-16 sm:w-20 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-lg sm:text-xl font-bold text-red-700 mb-2">Failed to Load New Arrivals</h3>
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

  // Empty state - don't show section if no new arrivals
  if (!products || products.length === 0) {
    return null;
  }

  // Main content
  return (
    <section className="py-8 sm:py-12 bg-gray-50" id="newarrivals-section">
      <div className="max-w-[100rem] mx-auto px-4">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#5c2d16]">
              New Arrivals
            </h2>
          </div>
          <p className="text-sm sm:text-base text-gray-600">Discover our latest products</p>
        </div>

        <div className="newarrivals-slider relative">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={12}
            slidesPerView={2}
            grabCursor={true}
            loop={products.length > 4}
            autoHeight={false}
            watchSlidesProgress={true}
            navigation={{
              nextEl: '.newarrivals-swiper-button-next',
              prevEl: '.newarrivals-swiper-button-prev',
            }}
            pagination={{
              clickable: true,
              el: '.newarrivals-swiper-pagination',
            }}
            autoplay={{
              delay: 4500,
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
                <NewArrivalsCard
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Navigation Buttons - Hidden on mobile, visible on md+ */}
          <button className="newarrivals-swiper-button-prev hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 z-10 bg-white border-2 border-gray-300 rounded-full w-10 h-10 items-center justify-center hover:border-[#5c2d16] hover:bg-[#5c2d16] hover:text-white transition shadow-md disabled:opacity-30 disabled:cursor-not-allowed">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button className="newarrivals-swiper-button-next hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-10 bg-white border-2 border-gray-300 rounded-full w-10 h-10 items-center justify-center hover:border-[#5c2d16] hover:bg-[#5c2d16] hover:text-white transition shadow-md disabled:opacity-30 disabled:cursor-not-allowed">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Custom Pagination */}
          <div className="newarrivals-swiper-pagination flex justify-center mt-4"></div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .newarrivals-slider .swiper-slide {
          height: auto;
          display: flex;
          width: calc((100% - 12px) / 2) !important;
        }
        @media (min-width: 640px) {
          .newarrivals-slider .swiper-slide {
            width: calc((100% - 16px) / 2) !important;
          }
        }
        @media (min-width: 768px) {
          .newarrivals-slider .swiper-slide {
            width: calc((100% - 32px) / 3) !important;
          }
        }
        @media (min-width: 1024px) {
          .newarrivals-slider .swiper-slide {
            width: calc((100% - 60px) / 4) !important;
          }
        }
        .newarrivals-slider .swiper-slide > div {
          width: 100%;
        }
        .newarrivals-slider .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          background: #d1d5db;
          opacity: 1;
          transition: all 0.3s;
        }
        .newarrivals-slider .swiper-pagination-bullet-active {
          width: 24px;
          border-radius: 4px;
          background: #111827;
        }
        .newarrivals-swiper-button-prev.swiper-button-disabled,
        .newarrivals-swiper-button-next.swiper-button-disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
      `}} />
    </section>
  );
};

export default NewArrivalsSection;
