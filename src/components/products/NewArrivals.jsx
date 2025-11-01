import React from "react";
import { useNavigate } from "react-router-dom";
import { BsCartPlus } from "react-icons/bs";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

const NewArrivals = () => {
    const navigate = useNavigate();

    const products = [
        {
            id: 1,
            name: "Kapiva Turmeric Juice",
            price: 499,
            oldPrice: 699,
            rating: 4.5,
            image: "https://cdn.shopify.com/s/files/1/0271/4160/0126/products/turmericjuice.jpg",
            link: "/products/kapiva-turmeric-juice",
        },
        {
            id: 2,
            name: "Kapiva Ashwagandha Capsules",
            price: 699,
            oldPrice: 899,
            rating: 5,
            image: "https://cdn.shopify.com/s/files/1/0271/4160/0126/products/ashwagandha.jpg",
            link: "/products/kapiva-ashwagandha-capsules",
        },
        {
            id: 3,
            name: "Kapiva Aloe Vera Gel",
            price: 399,
            oldPrice: 499,
            rating: 4,
            image: "https://cdn.shopify.com/s/files/1/0271/4160/0126/products/aloeveragel.jpg",
            link: "/products/kapiva-aloe-vera-gel",
        },
        {
            id: 4,
            name: "Kapiva Triphala Juice",
            price: 599,
            oldPrice: 799,
            rating: 4.5,
            image: "https://cdn.shopify.com/s/files/1/0271/4160/0126/products/triphalajuice.jpg",
            link: "/products/kapiva-triphala-juice",
        },
    ];

    // Calculate discount %
    const getDiscount = (oldPrice, price) =>
        Math.round(((oldPrice - price) / oldPrice) * 100);

    // Render star rating
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

    return (
        <section className="py-16 bg-gray-50">
            <div className="max-w-[100rem] mx-auto px-4">
                <h1 className="text-4xl font-bold  text-gray-800 mb-12">
                    New Arrivals
                </h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <div
                            key={product.id}
                            className="relative bg-white shadow-md rounded-2xl overflow-hidden hover:shadow-xl transition cursor-pointer"
                        >
                            {/* Discount Badge */}
                            {product.oldPrice > product.price && (
                                <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                                    {getDiscount(product.oldPrice, product.price)}% OFF
                                </div>
                            )}

                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-60 object-cover"
                                onClick={() => navigate(product.link)}
                            />
                            <div className="p-4">
                                <h3
                                    className="text-lg font-semibold mb-2 hover:text-green-600"
                                    onClick={() => navigate(product.link)}
                                >
                                    {product.name}
                                </h3>

                                {/* Star Rating */}
                                <div className="flex items-center mb-2">{renderStars(product.rating)}</div>

                                <div className="flex justify-between items-center mt-4">
                                    <div className="flex gap-2 items-center">
                                        <span className="font-semibold text-green-600">₹{product.price}</span>
                                        {product.oldPrice > product.price && (
                                            <span className="font-semibold text-gray-400 line-through">
                                                ₹{product.oldPrice}
                                            </span>
                                        )}
                                    </div>
                                    <button className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition">
                                        <BsCartPlus />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* View All New Arrivals */}
                <div className="mt-8 flex justify-center">
                    <button
                        onClick={() => navigate("/products")}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
                    >
                        View All Products
                    </button>
                </div>
            </div>
        </section>
    );
};

export default NewArrivals;
