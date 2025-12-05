import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

const heroData = [
  {
    id: 1,
    large_image: "https://res.cloudinary.com/dywfufrta/image/upload/v1764763788/Omega_3_Capsules_1290_x_630_px_cabcmo.png",
    mobile_image: "https://res.cloudinary.com/dywfufrta/image/upload/v1764763792/OMEGA_3_552_x_630_px_ypqh1s.png",
    product_url: "/products/fytage-omega-3-softgel-capsules-i-30-capsules",
  },
];

const HeroSection = () => {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  // Auto slide
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === heroData.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrent(current === heroData.length - 1 ? 0 : current + 1);
  const prevSlide = () => setCurrent(current === 0 ? heroData.length - 1 : current - 1);

  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative w-full h-[450px] md:h-[600px]">
        {heroData.map((slide, index) => (
          <div
            key={slide.id}
            onClick={() => navigate(slide.product_url)}
            className={`absolute top-0 left-0 w-full h-full transition-opacity duration-700 ease-in-out 
              ${index === current ? "opacity-100 z-10" : "opacity-0 z-0"} cursor-pointer`}
          >
            <picture>
              {/* Mobile First */}
              <source media="(max-width: 768px)" srcSet={slide.mobile_image} />
              <img
                src={slide.large_image}
                alt={`Slide-${slide.id}`}
                loading="lazy"
                className="w-full h-full object-contain md:object-cover"
              />
            </picture>
          </div>
        ))}

        {/* Controls */}
        <button
          onClick={prevSlide}
          className="absolute top-1/2 left-4 md:left-6 -translate-y-1/2 bg-white/60 hover:bg-white/80 backdrop-blur-sm 
          rounded-full p-3 md:p-4 shadow-md transition z-20"
        >
          <FaArrowLeft className="text-gray-800 text-lg md:text-xl" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute top-1/2 right-4 md:right-6 -translate-y-1/2 bg-white/60 hover:bg-white/80 backdrop-blur-sm 
          rounded-full p-3 md:p-4 shadow-md transition z-20"
        >
          <FaArrowRight className="text-gray-800 text-lg md:text-xl" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-5 w-full flex justify-center gap-3 z-20">
          {heroData.map((_, idx) => (
            <span
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`cursor-pointer text-2xl transition 
                ${idx === current ? "text-white drop-shadow-lg" : "text-gray-400"}`}
            >
              ●
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
