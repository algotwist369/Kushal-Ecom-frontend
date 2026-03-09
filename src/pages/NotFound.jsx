import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-6">
            <div className="max-w-xl text-center">

                {/* 404 */}
                <h1 className="text-8xl font-bold text-[#5C2D16]">404</h1>

                {/* Heading */}
                <h2 className="mt-4 text-2xl md:text-3xl font-semibold text-gray-800">
                    Page Not Found
                </h2>

                {/* Description */}
                <p className="mt-4 text-gray-600 leading-relaxed">
                    Oops! The page you are looking for might have been removed,
                    had its name changed, or is temporarily unavailable.
                </p>

                {/* Illustration */}
                <div className="mt-10 flex justify-center">
                    <div className="w-48 h-48 bg-[#5c2d1633] rounded-full flex items-center justify-center">
                        <span className="text-6xl">🌿</span>
                    </div>
                </div>

                {/* Buttons */}
                <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">

                    <Link
                        to="/"
                        className="px-6 py-3 bg-[#5C2D16] text-white rounded-md hover:bg-green-800 transition"
                    >
                        Go to Homepage
                    </Link>

                    <Link
                        to="/contact"
                        className="px-6 py-3 border border-[#5C2D16] text-[#5C2D16] rounded-md hover:bg-[#5C2D16] hover:text-white transition"
                    >
                        Contact Support
                    </Link>

                </div>

            </div>
        </div>
    );
};

export default NotFound;