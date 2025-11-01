import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BsCartPlus } from "react-icons/bs";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import api from "../../api/axiosConfig";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";

const ProductSection = ({ selectedCategory = null, searchQuery = null }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      if (isMounted) {
        await fetchProducts();
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, [selectedCategory, searchQuery]);

  const fetchProducts = async () => {
    setLoading(true);
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

      const response = await api.post('/products/filter', body);
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product, e) => {
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
  };

  const getDiscount = (oldPrice, price) => {
    return Math.round(((oldPrice - price) / oldPrice) * 100);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-gray-300" />);
      }
    }
    return stars;
  };

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
              {products.map((product) => {
                const displayPrice = product.discountPrice || product.price;
                const hasDiscount = product.discountPrice && product.discountPrice < product.price;

                return (
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
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      )}
                      
                      {/* Badges - Top Left */}
                      <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-col gap-1 sm:gap-2 z-10">
                        {hasDiscount && (
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
                      {/* Product Name */}
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
                          <span className="text-lg sm:text-2xl font-bold text-[#5c2d16]">
                            ₹{displayPrice}
                          </span>
                          {hasDiscount && (
                            <span className="text-xs sm:text-sm text-gray-400 line-through">
                              ₹{product.price}
                            </span>
                          )}
                        </div>

                        {/* Pack Options Info */}
                        {product.packOptions && product.packOptions.length > 0 && (
                          <p className="text-xs text-gray-600 mb-2 sm:mb-3 hidden sm:block">
                            Pack options available
                          </p>
                        )}

                        {/* Add to Cart Button */}
                        <button 
                          className="w-full bg-[#5c2d16] text-white py-2 sm:py-3 rounded-lg hover:bg-gray-800 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base"
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
                );
              })}
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
