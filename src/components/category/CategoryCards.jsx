import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosConfig";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const CategoryCards = ({ onCategorySelect }) => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories');
            setCategories(response.data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryClick = (category) => {
        if (onCategorySelect) {
            // If callback provided, filter products
            onCategorySelect(category._id);
        } else {
            // Navigate to products page with category filter
            navigate(`/products?category=${category._id}`);
        }
    };

    if (loading) {
        return (
            <section className="py-8 sm:py-12 bg-gray-50">
                <div className="max-w-[100rem] mx-auto px-4">
                    <div className="mb-6 sm:mb-8">
                        <h2 className="text-2xl sm:text-3xl font-bold text-[#5c2d16] mb-2">
                            Explore Our Categories
                        </h2>
                        <p className="text-sm sm:text-base text-gray-600">Browse products by category</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                        {[1,2,3,4,5,6].map(i => (
                            <div key={i} className="animate-pulse bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
                                <div className="h-12 sm:h-16 bg-gray-200 rounded-lg mb-2 sm:mb-3"></div>
                                <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    // Prepare all items (All Products + Categories)
    const allItems = categories.length > 0 ? [
        { _id: 'all', name: 'All Products', isAllProducts: true },
        ...categories
    ] : [];

    return (
        <section className="py-8 sm:py-12 bg-gray-50">
            <div className="max-w-[100rem] mx-auto px-4">
                <div className="mb-6 sm:mb-8">
                    <h2 className="text-2xl sm:text-3xl font-bold text-[#5c2d16] mb-2">
                        Explore Our Categories
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600">Browse products by category</p>
                </div>
                
                {allItems.length > 0 ? (
                    <div className="category-slider relative">
                        <Swiper
                            modules={[Navigation, Pagination, Autoplay]}
                            spaceBetween={12}
                            slidesPerView={2}
                            grabCursor={true}
                            loop={allItems.length > 6}
                            navigation={{
                                nextEl: '.category-swiper-button-next',
                                prevEl: '.category-swiper-button-prev',
                            }}
                            pagination={{
                                clickable: true,
                                el: '.category-swiper-pagination',
                            }}
                            autoplay={{
                                delay: 3500,
                                disableOnInteraction: false,
                                pauseOnMouseEnter: true,
                            }}
                            breakpoints={{
                                640: {
                                    slidesPerView: 3,
                                    spaceBetween: 16,
                                },
                                768: {
                                    slidesPerView: 4,
                                    spaceBetween: 16,
                                },
                                1024: {
                                    slidesPerView: 5,
                                    spaceBetween: 20,
                                },
                                1280: {
                                    slidesPerView: 6,
                                    spaceBetween: 20,
                                },
                            }}
                            className="pb-12"
                        >
                            {allItems.map((item) => (
                                <SwiperSlide key={item._id}>
                                    {item.isAllProducts ? (
                                        <div
                                            onClick={() => onCategorySelect ? onCategorySelect(null) : navigate('/products')}
                                            className="group bg-white border border-gray-200 rounded-lg p-4 sm:p-5 cursor-pointer hover:shadow-lg hover:border-[#5c2d16] transition flex flex-col items-center text-center h-full"
                                        >
                                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#5c2d16] rounded-full flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
                                                <span className="text-2xl sm:text-3xl">🌿</span>
                                            </div>
                                            <h3 className="font-semibold text-[#5c2d16] text-xs sm:text-sm">All Products</h3>
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => handleCategoryClick(item)}
                                            className="group bg-white border border-gray-200 rounded-lg p-4 sm:p-5 cursor-pointer hover:shadow-lg hover:border-[#5c2d16] transition flex flex-col items-center text-center h-full"
                                        >
                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-full mb-2 sm:mb-3 group-hover:scale-110 transition-transform border-2 border-gray-200"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'flex';
                                                    }}
                                                />
                                            ) : null}
                                            <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full ${item.image ? 'hidden' : 'flex'} items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform`}>
                                                <span className="text-2xl sm:text-3xl">📦</span>
                                            </div>
                                            <h3 className="font-semibold text-[#5c2d16] text-xs sm:text-sm line-clamp-2">
                                                {item.name}
                                            </h3>
                                        </div>
                                    )}
                                </SwiperSlide>
                            ))}
                        </Swiper>

                        {/* Custom Navigation Buttons - Hidden on mobile, visible on md+ */}
                        <button className="category-swiper-button-prev hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 z-10 bg-white border-2 border-gray-300 rounded-full w-10 h-10 items-center justify-center hover:border-[#5c2d16] hover:bg-[#5c2d16] hover:text-white transition shadow-md disabled:opacity-30 disabled:cursor-not-allowed">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button className="category-swiper-button-next hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-10 bg-white border-2 border-gray-300 rounded-full w-10 h-10 items-center justify-center hover:border-[#5c2d16] hover:bg-[#5c2d16] hover:text-white transition shadow-md disabled:opacity-30 disabled:cursor-not-allowed">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>

                        {/* Custom Pagination */}
                        <div className="category-swiper-pagination flex justify-center mt-4"></div>
                    </div>
                ) : (
                    <div className="text-center py-8 sm:py-12 bg-white border border-gray-200 rounded-lg">
                        <p className="text-sm sm:text-base text-gray-600">No categories available</p>
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                .category-slider .swiper-pagination-bullet {
                    width: 8px;
                    height: 8px;
                    background: #d1d5db;
                    opacity: 1;
                    transition: all 0.3s;
                }
                .category-slider .swiper-pagination-bullet-active {
                    width: 24px;
                    border-radius: 4px;
                    background: #111827;
                }
                .category-swiper-button-prev.swiper-button-disabled,
                .category-swiper-button-next.swiper-button-disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                }
            `}} />
        </section>
    );
};

export default CategoryCards;
