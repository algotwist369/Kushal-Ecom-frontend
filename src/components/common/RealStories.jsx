import React from "react";
import { FaStar, FaQuoteRight } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const RealStories = () => {
  const reviews = [
    {
      id: 1,
      name: "Priya Sharma",
      role: "Wellness Enthusiast",
      image: "https://randomuser.me/api/portraits/women/68.jpg",
      rating: 5,
      comment:
        "I’ve been using the Ayurvedic Hair Oil for 2 months. My hair feels stronger, shinier, and healthier than ever. Truly life-changing!",
    },
    {
      id: 2,
      name: "Rohit Kumar",
      role: "Verified Buyer",
      image: "https://randomuser.me/api/portraits/men/45.jpg",
      rating: 5,
      comment:
        "The Herbal Face Cream improved my skin texture significantly. Highly recommend for anyone looking for natural skincare.",
    },
    {
      id: 3,
      name: "Anjali Verma",
      role: "Yoga Instructor",
      image: "https://randomuser.me/api/portraits/women/12.jpg",
      rating: 5,
      comment:
        "Organic Body Scrub is amazing! My skin feels smooth and fresh. Love the natural ingredients and the fragrance.",
    },
    {
      id: 4,
      name: "Sanjay Singh",
      role: "Regular Customer",
      image: "https://randomuser.me/api/portraits/men/22.jpg",
      rating: 4,
      comment:
        "Ayurvedic Tea helped me relax and feel more energized. A must-try for anyone stressed out.",
    },
    {
      id: 5,
      name: "Neha Mehta",
      role: "Verified Buyer",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
      rating: 5,
      comment:
        "The products are authentic and effective. I love the quality and the results are visible quickly.",
    },
    {
      id: 6,
      name: "Arjun Das",
      role: "Fitness Coach",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
      rating: 5,
      comment:
        "I love the protein supplements. They are natural, easy to digest, and have really helped with my recovery.",
    }
  ];

  return (
    <section className="py-16 sm:py-24 bg-[#fdfbf7] relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-[#5c2d16]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />

      <div className="max-w-[99rem] mx-auto px-4 relative z-10">
        <div className="text-center mb-12 sm:mb-16">
          <span className="text-[#5c2d16] font-semibold tracking-wider text-sm uppercase mb-3 block">Testimonials</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 font-display mb-4">
            Real People, Real Stories
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Discover how our Ayurvedic formulations are transforming lives, one story at a time.
          </p>
        </div>

        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={24}
          slidesPerView={1}
          centeredSlides={false}
          loop={true}
          speed={800}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true
          }}
          pagination={{
            clickable: true,
            el: ".stories-pagination",
            dynamicBullets: true,
          }}
          breakpoints={{
            640: { slidesPerView: 1.5, spaceBetween: 20 },
            768: { slidesPerView: 2, spaceBetween: 24 },
            1024: { slidesPerView: 3, spaceBetween: 30 },
            1280: { slidesPerView: 4, spaceBetween: 32 },
          }}
          className="pb-16 !px-1"
        >
          {reviews.map((review) => (
            <SwiperSlide key={review.id} className="h-auto">
              <div className="bg-white rounded-2xl p-8 h-full shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] transition-all duration-300 border border-gray-100 flex flex-col group relative">

                {/* Quote Icon */}
                <div className="absolute top-6 right-8 text-gray-100 group-hover:text-[#5c2d16]/10 transition-colors duration-300">
                  <FaQuoteRight size={48} />
                </div>

                {/* Stars */}
                <div className="flex gap-1 mb-6 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      size={16}
                      className={i < Math.floor(review.rating) ? "fill-current" : "text-gray-200"}
                    />
                  ))}
                </div>

                {/* Content */}
                <blockquote className="text-gray-700 text-lg leading-relaxed mb-8 flex-grow font-medium">
                  "{review.comment}"
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-4 mt-auto pt-6 border-t border-gray-100">
                  <img
                    src={review.image}
                    alt={review.name}
                    className="w-12 h-12 rounded-full object-cover ring-4 ring-gray-50"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900 leading-tight">{review.name}</h4>
                    <span className="text-xs font-semibold text-[#5c2d16] uppercase tracking-wide">{review.role}</span>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="stories-pagination flex justify-center gap-2 mt-8" />

        <style jsx>{`
            .stories-pagination .swiper-pagination-bullet {
                width: 8px;
                height: 8px;
                background: #d1d5db;
                opacity: 1;
                transition: all 0.3s ease;
            }
            .stories-pagination .swiper-pagination-bullet-active {
                width: 24px;
                background: #5c2d16;
                border-radius: 999px;
            }
        `}</style>
      </div>
    </section>
  );
};

export default RealStories;
