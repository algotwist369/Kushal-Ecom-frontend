import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { getHeroImages } from "../../services/adminService";

const HeroSection = () => {
  const [current, setCurrent] = useState(0);
  const [heroData, setHeroData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch hero images
  useEffect(() => {
    const fetchHeroImages = async () => {
      try {
        const result = await getHeroImages();
        if (result.success && result.data?.images) {
          setHeroData(result.data.images);
        }
      } catch (error) {
        console.error("Error fetching hero images:", error);
        setHeroData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHeroImages();
  }, []);

  // Auto slide
  useEffect(() => {
    if (!heroData.length) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === heroData.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [heroData.length]);

  const nextSlide = () =>
    setCurrent(current === heroData.length - 1 ? 0 : current + 1);
  const prevSlide = () =>
    setCurrent(current === 0 ? heroData.length - 1 : current - 1);

  // Loading spinner
  if (loading) {
    return (
      <section className="w-full overflow-hidden">
        <div className="flex items-center justify-center bg-gray-200">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-800"></div>
        </div>
      </section>
    );
  }

  if (!heroData.length) return null;

  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative w-full">
        {heroData.map((slide, index) => (
          <div className={`w-full ${index === current ? "block" : "hidden"}`}>
            <picture>
              <source media="(max-width:768px)" srcSet={slide.mobile_image} />
              <img
                src={slide.large_image}
                alt={`Hero Slide ${index + 1}`}
                className={`w-full h-auto object-contain ${slide.product_url ? "cursor-pointer" : ""}`}
                loading="lazy"
                onClick={() => slide.product_url && navigate(slide.product_url)}
              />
            </picture>
          </div>
        ))}

        {/* Arrows */}
        {heroData.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 
                bg-white/70 hover:bg-white rounded-full p-2 md:p-3 z-20"
            >
              <FaArrowLeft className="text-gray-800 text-lg md:text-xl" />
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 
                bg-white/70 hover:bg-white rounded-full p-2 md:p-3 z-20"
            >
              <FaArrowRight className="text-gray-800 text-lg md:text-xl" />
            </button>
          </>
        )}

        {/* Dots */}
        {heroData.length > 1 && (
          <div className="absolute bottom-4 w-full flex justify-center gap-2 z-20">
            {heroData.map((_, idx) => (
              <span
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`cursor-pointer text-xl 
                  ${idx === current ? "text-white" : "text-gray-400"}`}
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
