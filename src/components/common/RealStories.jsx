import React, { useState } from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";

const RealStories = () => {
  const reviews = [
    {
      id: 1,
      name: "Priya Sharma",
      image: "https://randomuser.me/api/portraits/women/68.jpg",
      rating: 5,
      comment:
        "I’ve been using the Ayurvedic Hair Oil for 2 months. My hair feels stronger, shinier, and healthier than ever. Truly life-changing!",
    },
    {
      id: 2,
      name: "Rohit Kumar",
      image: "https://randomuser.me/api/portraits/men/45.jpg",
      rating: 4.5,
      comment:
        "The Herbal Face Cream improved my skin texture significantly. Highly recommend for anyone looking for natural skincare.",
    },
    {
      id: 3,
      name: "Anjali Verma",
      image: "https://randomuser.me/api/portraits/women/12.jpg",
      rating: 5,
      comment:
        "Organic Body Scrub is amazing! My skin feels smooth and fresh. Love the natural ingredients and the fragrance.",
    },
    {
      id: 4,
      name: "Sanjay Singh",
      image: "https://randomuser.me/api/portraits/men/22.jpg",
      rating: 4,
      comment:
        "Ayurvedic Tea helped me relax and feel more energized. A must-try for anyone stressed out.",
    },
    {
      id: 5,
      name: "Neha Mehta",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
      rating: 5,
      comment:
        "The products are authentic and effective. I love the quality and the results are visible quickly.",
    },
  ];

  const [current, setCurrent] = useState(0);

  const prevSlide = () => {
    setCurrent(current === 0 ? reviews.length - 1 : current - 1);
  };

  const nextSlide = () => {
    setCurrent(current === reviews.length - 1 ? 0 : current + 1);
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) stars.push(<FaStar key={i} className="text-yellow-400" />);
      else if (rating >= i - 0.5)
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
      else stars.push(<FaRegStar key={i} className="text-yellow-400" />);
    }
    return stars;
  };

  // Determine card width based on number of cards per view
  const cardsPerView = 4; // show 4 cards at once
  const cardWidth = 100 / cardsPerView + "%";

  return (
    <section className="py-16 bg-gray-50 relative">
      <div className="max-w-[100rem] mx-auto px-4">
        <h1 className="text-4xl font-bold mb-12 text-gray-800 text-center">
          Real People, Real Stories
        </h1>

        {/* Slider */}
        <div className="relative overflow-hidden">
          <div
            className="flex transition-transform duration-500"
            style={{ transform: `translateX(-${current * (100 / cardsPerView)}%)` }}
          >
            {reviews.map((review) => (
              <div
                key={review.id}
                className="px-2"
                style={{ flex: `0 0 ${cardWidth}` }}
              >
                <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center text-center hover:shadow-xl transition">
                  <img
                    src={review.image}
                    alt={review.name}
                    className="w-20 h-20 rounded-full object-cover mb-4"
                  />
                  <h3 className="text-lg font-semibold text-gray-800">{review.name}</h3>
                  <div className="flex justify-center mt-2 mb-4">{renderStars(review.rating)}</div>
                  <p className="text-gray-600 text-sm">{review.comment}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-white p-2 rounded-full shadow hover:bg-gray-100 transition"
          >
            <BsChevronLeft size={24} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-white p-2 rounded-full shadow hover:bg-gray-100 transition"
          >
            <BsChevronRight size={24} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default RealStories;
