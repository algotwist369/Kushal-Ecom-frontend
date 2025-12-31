import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosConfig";

import { Swiper, SwiperSlide } from "swiper/react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const CategoryCards = ({ onCategorySelect }) => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch categories once
    useEffect(() => {
        (async () => {
            try {
                const res = await api.get("/categories");
                setCategories(res.data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // Memoized handler to avoid re-rendering
    const handleCategory = useCallback(
        (cat) => {
            if (cat.isAllProducts) {
                return onCategorySelect
                    ? onCategorySelect(null)
                    : navigate("/products");
            }
            return onCategorySelect
                ? onCategorySelect(cat._id)
                : navigate(`/products?category=${cat._id}`);
        },
        [navigate, onCategorySelect]
    );

    // Pre-calc items with memo for performance
    const allItems = useMemo(() => {
        if (categories.length === 0) return [];
        return [
            { _id: "all", name: "All Products", isAllProducts: true },
            ...categories,
        ];
    }, [categories]);

    // ===================== SKELETON ======================
    if (loading) {
        return (
            <section className="py-14 bg-gray-50">
                <div className="max-w-6xl mx-auto px-4 animate-fadeIn">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">
                        Explore Categories
                    </h2>

                    <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-6 gap-5">
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className="animate-pulse bg-white shadow-md rounded-xl p-5"
                            >
                                <div className="w-12 h-12 mx-auto bg-gray-200 rounded-full mb-3" />
                                <div className="h-3 w-16 mx-auto bg-gray-200 rounded" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-10 sm:py-14 bg-gray-50">
            <div className="max-w-[99rem] mx-auto px-4">

                {/* HEADER */}
                <div className="mb-6 sm:mb-8 animate-fadeIn flex flex-col sm:flex-row sm:items-end justify-between gap-2 text-center sm:text-left">
                    <div>
                        <h2 className="text-2xl text-start sm:text-3xl font-bold text-gray-900 tracking-tight">
                            Explore Categories
                        </h2>
                        <p className="text-gray-500 text-sm text-start sm:text-base mt-2 sm:mt-1">
                            Browse through our curated product categories
                        </p>
                    </div>
                </div>

                {/* SLIDER */}
                {allItems.length > 0 ? (
                    <div className="relative animate-fadeInUp">
                        <Swiper
                            modules={[Navigation, Pagination, Autoplay]}
                            slidesPerView={5}
                            spaceBetween={8}
                            speed={600}
                            grabCursor={true}
                            loop={allItems.length > 6}
                            autoplay={{
                                delay: 3000,
                                disableOnInteraction: false,
                                pauseOnMouseEnter: true
                            }}
                            navigation={{
                                nextEl: ".cat-next",
                                prevEl: ".cat-prev",
                            }}
                            pagination={{
                                clickable: true,
                                el: ".cat-pagination",
                                dynamicBullets: true,
                            }}
                            breakpoints={{
                                320: { slidesPerView: 4.5, spaceBetween: 8 },
                                400: { slidesPerView: 5, spaceBetween: 10 },
                                640: { slidesPerView: 5.5, spaceBetween: 12 },
                                768: { slidesPerView: 6, spaceBetween: 16 },
                                1024: { slidesPerView: 7, spaceBetween: 20 },
                                1280: { slidesPerView: 8, spaceBetween: 24 },
                            }}
                            className="pb-12 sm:pb-14 !px-1"
                        >
                            {allItems.map((item) => (
                                <SwiperSlide key={item._id} className="h-auto">
                                    <div
                                        onClick={() => handleCategory(item)}
                                        className="group h-full bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm 
                                        hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 cursor-pointer 
                                        flex flex-col items-center justify-center p-2 sm:p-5 min-h-[100px] sm:min-h-[160px]
                                        hover:-translate-y-1 active:scale-[0.98] relative overflow-hidden"
                                    >
                                        {/* Hover Gradient Effect */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                        {/* IMAGE */}
                                        <div className="relative z-10 mb-2 sm:mb-4">
                                            {item.image ? (
                                                <div className="relative">
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        loading="lazy"
                                                        className="w-10 h-10 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-white 
                                                        shadow-md group-hover:shadow-lg transition-transform duration-300
                                                        group-hover:scale-110"
                                                    />
                                                </div>

                                            ) : (
                                                <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-full bg-gray-50 border border-gray-100 
                                                flex items-center justify-center text-xl sm:text-3xl
                                                shadow-sm group-hover:shadow-md transition-transform duration-300 group-hover:scale-110">
                                                    {item.isAllProducts ? "🛍️" : "📦"}
                                                </div>
                                            )}
                                        </div>

                                        {/* TITLE */}
                                        <h3
                                            className={`relative z-10 text-[10px] sm:text-sm text-center leading-tight line-clamp-2 px-1
                                            ${item.isAllProducts
                                                    ? "font-bold text-gray-900 group-hover:text-[#5c2d16]"
                                                    : "font-semibold text-gray-700 group-hover:text-gray-900"
                                                } transition-colors duration-200`}
                                        >
                                            {item.name}
                                        </h3>
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>

                        {/* NAVIGATION BUTTONS */}
                        <button
                            className="cat-prev hidden lg:flex absolute left-0 top-1/2 
                            -translate-y-1/2 -translate-x-1/2 z-10 w-12 h-12 bg-white shadow-xl rounded-full border border-gray-100 
                            items-center justify-center text-gray-700 hover:bg-black hover:border-black 
                            hover:text-white transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-gray-100"
                        >
                            <FiChevronLeft size={24} />
                        </button>

                        <button
                            className="cat-next hidden lg:flex absolute right-0 top-1/2 
                            -translate-y-1/2 translate-x-1/2 z-10 w-12 h-12 bg-white shadow-xl rounded-full border border-gray-100 
                            items-center justify-center text-gray-700 hover:bg-black hover:border-black 
                            hover:text-white transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-gray-100"
                        >
                            <FiChevronRight size={24} />
                        </button>

                        {/* PAGINATION */}
                        <div className="cat-pagination !bottom-0 flex justify-center gap-1.5" />
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 bg-white border border-dashed border-gray-200 rounded-2xl">
                        <span className="text-4xl mb-3">📭</span>
                        <p className="text-gray-500 font-medium">No categories found</p>
                    </div>
                )}
            </div>

            {/* CUSTOM STYLES */}
            <style>{`
                .swiper-wrapper {
                    align-items: stretch;
                }
                .swiper-slide {
                    height: auto;
                }
                .cat-pagination .swiper-pagination-bullet {
                    width: 6px;
                    height: 6px;
                    background: #e5e7eb;
                    opacity: 1;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    margin: 0 4px !important;
                }
                .cat-pagination .swiper-pagination-bullet-active {
                    width: 24px;
                    background: #5c2d16;
                    border-radius: 999px;
                }
                
                @media (min-width: 640px) {
                    .cat-pagination .swiper-pagination-bullet {
                        width: 8px;
                        height: 8px;
                    }
                    .cat-pagination .swiper-pagination-bullet-active {
                        width: 32px;
                    }
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn { animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1); }

                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeInUp { animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
            `}</style>
        </section>
    );
};

export default CategoryCards;
