import React from "react";
import HeroSection from "./HeroSection";

const HeroDetails = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <HeroSection />
            {/* You can add more sections below hero if needed */}
            <div className="max-w-[100rem] mx-auto py-16 px-4">
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6">
                    Welcome to Our Spa
                </h2>
                <p className="text-gray-600 text-lg md:text-xl">
                    Explore our wide range of spa treatments and holistic wellness
                    services. Click on the hero slides above to learn more.
                </p>
            </div>
        </div>
    );
};

export default HeroDetails;
