import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { getHeroImages } from "../../services/adminService";

const HeroSection = () => {
  const [current, setCurrent] = useState(0);
  const [heroData, setHeroData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch hero images from API
  useEffect(() => {
    const fetchHeroImages = async () => {
      try {
        const result = await getHeroImages();
        if (result.success && result.data?.images) {
          setHeroData(result.data.images);
        }
      } catch (error) {
        console.error("Error fetching hero images:", error);
        // Fallback to empty array if API fails
        setHeroData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHeroImages();
  }, []);

  // Auto slide
  useEffect(() => {
    if (heroData.length === 0) return;

    const timer = setInterval(() => {
      setCurrent((prev) =>
        prev === heroData.length - 1 ? 0 : prev + 1
      );
    }, 5000);
    return () => clearInterval(timer);
  }, [heroData.length]);

  const nextSlide = () =>
    setCurrent(current === heroData.length - 1 ? 0 : current + 1);

  const prevSlide = () =>
    setCurrent(current === 0 ? heroData.length - 1 : current - 1);

  // Don't render if loading or no data
  if (loading) {
    return (
      <section className="relative w-full overflow-hidden">
        <div className="relative w-full h-[450px] md:h-[600px] bg-gray-200 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </section>
    );
  }

  if (heroData.length === 0) {
    return null; // Don't render hero section if no images
  }

  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative w-full h-[450px] md:h-[650px]">
        {heroData.map((slide, index) => (
          <div
            key={index}
            onClick={() => slide.product_url && navigate(slide.product_url)}
            className={`absolute top-0 left-0 w-full h-full transition-opacity duration-700 ease-in-out 
          ${index === current ? "opacity-100 z-10" : "opacity-0 z-0"} 
          ${slide.product_url ? "cursor-pointer" : ""}`}
          >
            <picture>
              {/* Mobile First */}
              <source
                media="(max-width: 768px)"
                srcSet={slide.mobile_image}
              />

              {/* Desktop Image */}
              <img
                src={slide.large_image}
                alt={`Hero Slide ${index + 1}`}
                loading="lazy"
                className="w-full h-full
                       object-contain
                       md:object-contain
                       md:w-[1900px]
                       md:h-[650px]
                       mx-auto"
              />
            </picture>
          </div>
        ))}

        {/* Controls - Only show if more than one slide */}
        {heroData.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute top-1/2 left-4 md:left-6 -translate-y-1/2 bg-white/60 hover:bg-white/80 backdrop-blur-sm 
          rounded-full p-3 md:p-4 shadow-md transition z-20"
              aria-label="Previous slide"
            >
              <FaArrowLeft className="text-gray-800 text-lg md:text-xl" />
            </button>

            <button
              onClick={nextSlide}
              className="absolute top-1/2 right-4 md:right-6 -translate-y-1/2 bg-white/60 hover:bg-white/80 backdrop-blur-sm 
          rounded-full p-3 md:p-4 shadow-md transition z-20"
              aria-label="Next slide"
            >
              <FaArrowRight className="text-gray-800 text-lg md:text-xl" />
            </button>
          </>
        )}

        {/* Dots - Only show if more than one slide */}
        {heroData.length > 1 && (
          <div className="absolute bottom-5 w-full flex justify-center gap-3 z-20">
            {heroData.map((_, idx) => (
              <span
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`cursor-pointer text-2xl transition 
              ${idx === current
                    ? "text-white drop-shadow-lg"
                    : "text-gray-400"
                  }`}
                aria-label={`Go to slide ${idx + 1}`}
              >
                ●
              </span>
            ))}
          </div>
        )}
      </div>
    </section>

  );
};

export default HeroSection;
