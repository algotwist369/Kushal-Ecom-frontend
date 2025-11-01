import React from "react";
import { BsFillCheckCircleFill } from "react-icons/bs";

const WhyUs = () => {
  const points = [
    {
      id: 1,
      title: "100% Natural Ingredients",
      description:
        "We use only pure, Ayurvedic herbs and natural ingredients in all our products.",
      iconColor: "text-green-600",
    },
    {
      id: 2,
      title: "Clinically Proven",
      description:
        "Our formulations are backed by clinical studies and trusted by thousands of users.",
      iconColor: "text-gray-600",
    },
    {
      id: 3,
      title: "Sustainable & Ethical",
      description:
        "We follow eco-friendly practices and ensure ethical sourcing of all ingredients.",
      iconColor: "text-yellow-500",
    },
    {
      id: 4,
      title: "Customer Satisfaction",
      description:
        "Our customers are our priority, with a 24/7 support system and satisfaction guarantee.",
      iconColor: "text-red-500",
    },
    {
      id: 5,
      title: "Expert Guidance",
      description:
        "Our team of Ayurvedic experts provide guidance for personalized wellness solutions.",
      iconColor: "text-purple-500",
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-[100rem] mx-auto px-4">
        {/* Page Heading */}
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">
          Why Choose Us?
        </h1>

        {/* Image and Points */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Image */}
          <div>
            <img
              src="https://thehardcopy.co/wp-content/uploads/2_juice_kapiva-scaled.jpg"
              alt="Why Us"
              className="w-full h-96 object-cover rounded-2xl shadow-lg"
            />
          </div>

          {/* Right Points */}
          <div className="space-y-8">
            {points.map((point) => (
              <div key={point.id} className="flex items-start gap-4">
                <BsFillCheckCircleFill
                  className={`text-3xl mt-1 ${point.iconColor}`}
                />
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-1">
                    {point.title}
                  </h3>
                  <p className="text-gray-600">{point.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Ready to Experience the Difference?
          </h2>
          <p className="text-gray-600 mb-6">
            Join thousands of satisfied customers and start your wellness journey today.
          </p>
          <a
            href="/products"
            className="px-8 py-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
          >
            Explore Products
          </a>
        </div>
      </div>
    </section>
  );
};

export default WhyUs;
