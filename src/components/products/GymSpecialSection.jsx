import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import { BsCartPlus } from 'react-icons/bs';
import api from '../../api/axiosConfig';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const GymSpecialSection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryId, setCategoryId] = useState(null);

  useEffect(() => {
    fetchGymProducts();
  }, []);

  const fetchGymProducts = async () => {
    try {
      // First, get all categories to find the Gym category
      const categoriesResponse = await api.get('/categories');
      const categories = categoriesResponse.data.categories || categoriesResponse.data || [];
      
      // Find category that matches "Gym" or "Fitness" (case insensitive)
      const gymCategory = categories.find(cat => 
        cat.name.toLowerCase().includes('gym') || 
        cat.name.toLowerCase().includes('fitness') ||
        cat.name.toLowerCase().includes('workout')
      );

      if (gymCategory) {
        setCategoryId(gymCategory._id);
        
        // Fetch products for this category
        const response = await api.post('/products/filter', {
          categories: [gymCategory._id],
          page: 1,
          limit: 8
        });
        
        setProducts(response.data.products || []);
      } else {
        // If no gym category found, fetch some random products
        const response = await api.post('/products/filter', {
          page: 1,
          limit: 8
        });
        setProducts(response.data.products || []);
      }
    } catch (error) {
      console.error('Error fetching gym products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product, e) => {
    e.stopPropagation();
    
    if (!user) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    if (product.stock <= 0) {
      toast.error('Product is out of stock');
      return;
    }

    try {
      await api.post('/cart/add', {
        productId: product._id,
        quantity: 1
      });
      toast.success('Added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    }
  };

  const getDiscount = (price, discountPrice) => {
    return Math.round(((price - discountPrice) / price) * 100);
  };

  if (loading) {
    return (
      <section className="py-8 sm:py-12 bg-gray-50" id="gym-section">
        <div className="max-w-[100rem] mx-auto px-4">
          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Special for Gym Enthusiasts
            </h2>
            <p className="text-sm sm:text-base text-gray-600">Power up your fitness journey</p>
          </div>
          
          {/* Poster */}
          <div className="mb-6 sm:mb-8 rounded-lg overflow-hidden">
            <img 
              src="https://cdn.shopify.com/s/files/1/0570/2054/7125/files/Pure_Himalayan_Shilajit_pc.webp?v=1706165537" 
              alt="Special for Gym Enthusiasts" 
              className="w-full h-48 sm:h-64 md:h-80 object-cover"
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

  if (!products || products.length === 0) {
    return null; // Don't show section if no products
  }

  return (
    <section className="py-8 sm:py-12 bg-gray-50" id="gym-section">
      <div className="max-w-[100rem] mx-auto px-4">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Special for Gym Enthusiasts
          </h2>
          <p className="text-sm sm:text-base text-gray-600">Power up your fitness journey</p>
        </div>

        {/* Poster Banner */}
        <div className="mb-6 sm:mb-8 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition">
          <img 
            src="https://cdn.shopify.com/s/files/1/0570/2054/7125/files/Pure_Himalayan_Shilajit_pc.webp?v=1706165537" 
            alt="Special for Gym Enthusiasts" 
            className="w-full h-48 sm:h-64 md:h-80 object-cover cursor-pointer"
            onClick={() => categoryId && navigate(`/products?category=${categoryId}`)}
          />
        </div>

        <div className="gym-slider relative">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={12}
            slidesPerView={2}
            grabCursor={true}
            loop={products.length > 4}
            autoHeight={false}
            watchSlidesProgress={true}
            navigation={{
              nextEl: '.gym-swiper-button-next',
              prevEl: '.gym-swiper-button-prev',
            }}
            pagination={{
              clickable: true,
              el: '.gym-swiper-pagination',
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
            {products.map((product) => {
              const displayPrice = product.discountPrice || product.price;
              const hasDiscount = product.discountPrice && product.discountPrice < product.price;

              return (
                <SwiperSlide key={product._id}>
                  <div
                    className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer flex flex-col"
                    style={{ height: '100%', minHeight: '400px' }}
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
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      )}
                      
                      {/* Badges - Top Left */}
                      <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-col gap-1 sm:gap-2 z-10">
                        {hasDiscount && (
                          <div className="bg-gray-900 text-white text-xs font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded">
                            {getDiscount(product.price, product.discountPrice)}% OFF
                          </div>
                        )}
                      </div>

                      {/* Out of Stock Overlay */}
                      {product.stock <= 0 && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                          <span className="bg-white text-gray-900 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-bold text-xs sm:text-sm">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-3 sm:p-5 flex-1 flex flex-col">
                      {/* Product Name */}
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm sm:text-base min-h-[2.5rem] sm:min-h-[3rem] group-hover:text-gray-600 transition">
                        {product.name}
                      </h3>

                      {/* Rating */}
                      {product.averageRating > 0 && (
                        <div className="flex items-center gap-1 sm:gap-2 mb-2 sm:mb-3">
                          <div className="flex items-center gap-0.5 sm:gap-1">
                            <FaStar className="text-yellow-400 text-xs sm:text-sm" />
                            <span className="text-xs sm:text-sm font-medium text-gray-900">{product.averageRating.toFixed(1)}</span>
                          </div>
                          <span className="text-xs text-gray-500">({product.numReviews || 0})</span>
                        </div>
                      )}

                      <div className="mt-auto">
                        {/* Price */}
                        <div className="flex items-baseline gap-1 sm:gap-2 mb-2 sm:mb-3">
                          <span className="text-lg sm:text-2xl font-bold text-gray-900">
                            ₹{displayPrice}
                          </span>
                          {hasDiscount && (
                            <span className="text-xs sm:text-sm text-gray-400 line-through">
                              ₹{product.price}
                            </span>
                          )}
                        </div>

                        {/* Add to Cart Button */}
                        <button 
                          className="w-full bg-gray-900 text-white py-2 sm:py-3 rounded-lg hover:bg-gray-800 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base"
                          disabled={product.stock <= 0}
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            if (product.stock > 0) {
                              handleAddToCart(product, e);
                            }
                          }}
                        >
                          <BsCartPlus className="text-base sm:text-lg" />
                          <span className="hidden sm:inline">{product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                          <span className="sm:hidden">{product.stock <= 0 ? 'Out' : 'Add'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>

          {/* Custom Navigation Buttons - Hidden on mobile, visible on md+ */}
          <button className="gym-swiper-button-prev hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 z-10 bg-white border-2 border-gray-300 rounded-full w-10 h-10 items-center justify-center hover:border-gray-900 hover:bg-gray-900 hover:text-white transition shadow-md disabled:opacity-30 disabled:cursor-not-allowed">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button className="gym-swiper-button-next hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-10 bg-white border-2 border-gray-300 rounded-full w-10 h-10 items-center justify-center hover:border-gray-900 hover:bg-gray-900 hover:text-white transition shadow-md disabled:opacity-30 disabled:cursor-not-allowed">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Custom Pagination */}
          <div className="gym-swiper-pagination flex justify-center mt-4"></div>
        </div>

        {/* View All Button */}
        {categoryId && (
          <div className="mt-6 sm:mt-8 flex justify-center">
            <button
              onClick={() => navigate(`/products?category=${categoryId}`)}
              className="bg-gray-900 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg hover:bg-gray-800 transition font-semibold text-sm sm:text-base"
            >
              View All Gym Products →
            </button>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .gym-slider .swiper-slide {
          height: auto;
          display: flex;
          width: calc((100% - 12px) / 2) !important;
        }
        @media (min-width: 640px) {
          .gym-slider .swiper-slide {
            width: calc((100% - 16px) / 2) !important;
          }
        }
        @media (min-width: 768px) {
          .gym-slider .swiper-slide {
            width: calc((100% - 32px) / 3) !important;
          }
        }
        @media (min-width: 1024px) {
          .gym-slider .swiper-slide {
            width: calc((100% - 60px) / 4) !important;
          }
        }
        .gym-slider .swiper-slide > div {
          width: 100%;
        }
        .gym-slider .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          background: #d1d5db;
          opacity: 1;
          transition: all 0.3s;
        }
        .gym-slider .swiper-pagination-bullet-active {
          width: 24px;
          border-radius: 4px;
          background: #111827;
        }
        .gym-swiper-button-prev.swiper-button-disabled,
        .gym-swiper-button-next.swiper-button-disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
      `}} />
    </section>
  );
};

export default GymSpecialSection;
