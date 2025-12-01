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
        <section className="py-14 bg-gray-50">
            <div className="max-w-[99rem] mx-auto px-4">

                {/* HEADER */}
                <div className="mb-8 animate-fadeIn">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                        Explore Categories
                    </h2>
                    <p className="text-gray-500 text-sm sm:text-base mt-1">
                        Browse through our curated product categories
                    </p>
                </div>

                {/* SLIDER */}
                {allItems.length > 0 ? (
                    <div className="relative animate-fadeInUp">
                        <Swiper
                            modules={[Navigation, Pagination, Autoplay]}
                            slidesPerView={2}
                            spaceBetween={16}
                            speed={700}
                            grabCursor={true}
                            loop={allItems.length > 6}
                            autoplay={{
                                delay: 2500,
                                disableOnInteraction: false,
                            }}
                            navigation={{
                                nextEl: ".cat-next",
                                prevEl: ".cat-prev",
                            }}
                            pagination={{
                                clickable: true,
                                el: ".cat-pagination",
                            }}
                            breakpoints={{
                                640: { slidesPerView: 3 },
                                768: { slidesPerView: 4 },
                                1024: { slidesPerView: 5 },
                                1280: { slidesPerView: 6 },
                            }}
                            className="pb-12"
                        >
                            {allItems.map((item) => (
                                <SwiperSlide key={item._id}>
                                    <div
                                        onClick={() => handleCategory(item)}
                                        className="group bg-white rounded-xl border border-gray-200 shadow-sm 
                                        hover:shadow-lg transition-all duration-300 cursor-pointer 
                                        flex flex-col items-center p-5 min-h-[150px]
                                        hover:-translate-y-[3px] hover:border-gray-300"
                                    >
                                        {/* IMAGE */}
                                        {item.image ? (
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                loading="lazy"
                                                className="w-16 h-16 rounded-full object-cover border 
                                                shadow-sm mb-3 transition-transform duration-300
                                                group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 rounded-full bg-gradient-to-br 
                                            from-gray-100 to-gray-300 flex items-center justify-center text-3xl
                                            shadow-sm mb-3 transition-transform duration-300 group-hover:scale-110">
                                                {item.isAllProducts ? "🛍️" : "📦"}
                                            </div>
                                        )}

                                        {/* TITLE */}
                                        <h3
                                            className={`text-sm text-center leading-tight line-clamp-2 
                                            ${item.isAllProducts
                                                    ? "font-bold text-gray-900"
                                                    : "font-semibold text-gray-800"
                                                }`}
                                        >
                                            {item.name}
                                        </h3>
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>

                        {/* NAVIGATION BUTTONS */}
                        <button
                            className="cat-prev hidden md:flex absolute left-[-3.25rem] top-[45%] 
                            -translate-y-1/2 w-10 h-10 bg-white shadow-lg rounded-full border 
                            items-center justify-center text-gray-700 hover:bg-gray-800 
                            hover:text-white transition-all duration-300"
                        >
                            <FiChevronLeft size={22} />
                        </button>

                        <button
                            className="cat-next hidden md:flex absolute right-[-3.25rem] top-[45%] 
                            -translate-y-1/2 w-10 h-10 bg-white shadow-lg rounded-full border 
                            items-center justify-center text-gray-700 hover:bg-gray-800 
                            hover:text-white transition-all duration-300"
                        >
                            <FiChevronRight size={22} />
                        </button>

                        {/* PAGINATION */}
                        <div className="cat-pagination mt-5 flex justify-center gap-1" />
                    </div>
                ) : (
                    <p className="text-center text-gray-600 py-10 bg-white border rounded-xl shadow-sm">
                        No categories available
                    </p>
                )}
            </div>

            {/* BULLET STYLING */}
            <style>{`
                .swiper-pagination-bullet {
                    width: 8px;
                    height: 8px;
                    background: #d1d5db;
                    opacity: 1;
                    transition: 0.3s;
                }
                .swiper-pagination-bullet-active {
                    width: 22px;
                    border-radius: 999px;
                    background: #111827;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(5px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn { animation: fadeIn 0.4s ease-out; }

                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeInUp { animation: fadeInUp 0.6s ease-out; }
            `}</style>
        </section>
    );
};

export default CategoryCards;
