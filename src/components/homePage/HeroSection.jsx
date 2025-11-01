import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

// Sample JSON data for slider images with links
const heroData = [
  {
    id: 1,
    title: "Relax & Rejuvenate",
    subtitle: "Experience luxury spa treatments",
    image: "https://oppositehq.com/static/5393bd49ec2b5cbdd1bdefb756cc7e35/7b1eb/0_herounit_kapiva_a00fba4552.jpg",
    link: "/relax-rejuvenate",
  },
  {
    id: 2,
    title: "Holistic Wellness",
    subtitle: "Mind, Body & Soul care",
    image: "https://oppositehq.com/static/7ea659e627c831366ff9173d34d5837b/13969/3_solution1_kapiva_858d79b4ec.jpg",
    link: "/services/holistic-wellness",
  },
  {
    id: 3,
    title: "Luxury Spa Experience",
    subtitle: "Book your appointment now",
    image: "https://oppositehq.com/static/00e7a036cb2e0f2b61937dfc90356eb9/13969/20_aloeplus2_kapiva_e065e3887a.jpg",
    link: "/luxury-spa",
  },
];

const HeroSection = () => {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  // Auto slider every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === heroData.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrent(current === heroData.length - 1 ? 0 : current + 1);
  const prevSlide = () => setCurrent(current === 0 ? heroData.length - 1 : current - 1);
  const handleClick = (link) => navigate(link);

  return (
    <section className="relative w-full">
      {/* Hero Slider */}
      <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden">
        {heroData.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute top-0 left-0 w-full h-full transition-opacity duration-700 ${index === current ? "opacity-100 z-10" : "opacity-0 z-0"
              } cursor-pointer`}
            onClick={() => handleClick(slide.link)}
          >
            <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
            
          </div>
        ))}

        {/* Slider Controls */}
        <button
          onClick={prevSlide}
          className="absolute top-1/2 left-2 md:left-6 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-full p-4 md:p-5 hover:bg-opacity-80 transition z-20"
        >
          <FaArrowLeft className="text-gray-800 text-xl md:text-2xl" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute top-1/2 right-2 md:right-6 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-full p-4 md:p-5 hover:bg-opacity-80 transition z-20"
        >
          <FaArrowRight className="text-gray-800 text-xl md:text-2xl" />
        </button>

        {/* Slider Dots */}
        <div className="absolute bottom-4 w-full flex justify-center space-x-3 z-20">
          {heroData.map((_, idx) => (
            <button key={idx} onClick={() => setCurrent(idx)} className="focus:outline-none">
              <span className={`text-xl ${idx === current ? "text-white" : "text-gray-400"}`}>●</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
