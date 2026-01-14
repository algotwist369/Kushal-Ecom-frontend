import React, { memo } from "react";
import { useNavigate } from "react-router-dom";
import { BsCartPlus } from "react-icons/bs";
import { FaStar } from "react-icons/fa";

// Fallback image SVG data URI
const FALLBACK_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect width="400" height="400" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E';

// Utility function to calculate discount percentage
const getDiscount = (oldPrice, price) => {
    return Math.round(((oldPrice - price) / oldPrice) * 100);
};

const CategoryCard = ({ product, onAddToCart }) => {
    const navigate = useNavigate();

    const displayPrice = product.discountPrice || product.price;
    const hasDiscount = product.discountPrice && product.discountPrice < product.price;
    const isOutOfStock = product.stock <= 0;

    const handleCardClick = () => {
        navigate(`/products/${product.slug || product._id}`);
    };

    const handleAddToCartClick = (e) => {
        e.stopPropagation();
        if (!isOutOfStock) {
            onAddToCart(product, e);
        }
    };

    const handleImageError = (e) => {
        e.target.src = FALLBACK_IMAGE;
    };

    const handleSecondImageError = (e) => {
        e.target.style.display = 'none';
    };

    return (
        <div
            className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer flex flex-col"
            style={{ height: '100%', minHeight: '300px' }}
            onClick={handleCardClick}
        >
            {/* Product Image */}
            <div className="relative overflow-hidden h-48 sm:h-64">
                {/* First Image */}
                <img
                    src={product.images?.[0] || FALLBACK_IMAGE}
                    alt={product.name}
                    className={`absolute inset-0 w-full h-full object-contain bg-white transition-opacity duration-300 
                ${product.images?.[1] ? "group-hover:opacity-0" : "group-hover:scale-105"}
            `}
                    onError={handleImageError}
                    loading="lazy"
                />

                {/* Second Image (hover image) */}
                {product.images?.[1] && (
                    <img
                        src={product.images[1]}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-contain bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        onError={handleSecondImageError}
                        loading="lazy"
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
                {isOutOfStock && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                        <span className="bg-white text-[#5c2d16] px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-bold text-xs sm:text-sm">
                            Out of Stock
                        </span>
                    </div>
                )}
            </div>

            {/* Product Info */}
            <div className="p-3 sm:p-5 gap-4 flex flex-col">
           
                           {/* Product Name */}
                           <h3 className="font-semibold text-[#5c2d16] line-clamp-2 text-sm sm:text-base min-h-[2.5rem] sm:min-h-[3rem] group-hover:text-gray-600 transition">
                               {product.name}
                           </h3>
           
                           {/* Rating */}
                           {product.averageRating > 0 && (
                               <div className="flex items-center gap-1 sm:gap-2 mb-2 sm:mb-3">
                                   <div className="flex items-center gap-0.5 sm:gap-1">
                                       <FaStar className="text-yellow-400 text-xs sm:text-sm" />
                                       <span className="text-xs sm:text-sm font-medium text-[#5c2d16]">
                                           {product.averageRating.toFixed(1)}
                                       </span>
                                   </div>
                                   <span className="text-xs text-gray-500">
                                       ({product.numReviews || 0})
                                   </span>
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
           
                               {/* Pack Options */}
                               {product.packOptions && product.packOptions.length > 0 && (
                                   <p className="text-xs text-gray-600 mb-2 sm:mb-3 hidden sm:block">
                                       Pack options available
                                   </p>
                               )}
           
                               {/* Add to Cart */}
                               <button
                                   className="w-full bg-[#5c2d16] text-white py-2 sm:py-3 rounded-lg hover:bg-gray-800 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base"
                                   disabled={isOutOfStock}
                                   onClick={handleAddToCartClick}
                                   aria-label={isOutOfStock ? 'Out of stock' : `Add ${product.name} to cart`}
                               >
                                   <BsCartPlus className="text-base sm:text-lg" />
                                   <span className="hidden sm:inline">
                                       {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                                   </span>
                                   <span className="sm:hidden">
                                       {isOutOfStock ? 'Out' : 'Add'}
                                   </span>
                               </button>
           
                           </div>
                       </div>
        </div>
    );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(CategoryCard);
