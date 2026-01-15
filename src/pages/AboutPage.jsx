import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BsChevronLeft, BsGeoAlt, BsStar, BsHeartPulse } from 'react-icons/bs';
import PopUpModal from '../components/common/PopUpModal';

const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <PopUpModal />

      <div className="bg-white min-h-screen">
        {/* Header */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-4 py-12">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-[#5c2d16] mb-6"
            >
              <BsChevronLeft />
              Back to Home
            </button>

            <h1 className="text-4xl font-bold text-[#5c2d16] mb-3">
              About Prolific Healing Herbs
            </h1>
            <p className="text-gray-600 text-lg">
              Trusted herbal & Ayurvedic wellness store in Navi Mumbai
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-5xl mx-auto px-4 py-12 space-y-10">
          {/* Intro */}
          <div>
            <p className="text-gray-700 leading-relaxed">
              <strong>Prolific Healing Herbs (प्रॉलिफिक हीलिंग हर्ब्स)</strong> is a
              trusted herbal medicine store located in <strong>Sanpada, Navi Mumbai</strong>.
              We provide authentic Ayurvedic and herbal products to support natural
              healing and everyday wellness.
            </p>
          </div>

          {/* Highlights */}
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="border rounded-lg p-6 text-center">
              <BsStar className="text-3xl mx-auto mb-3 text-[#5c2d16]" />
              <h3 className="font-bold text-[#5c2d16] mb-1">4.6★ Rating</h3>
              <p className="text-sm text-gray-600">Rated by 42+ customers</p>
            </div>

            <div className="border rounded-lg p-6 text-center">
              <BsHeartPulse className="text-3xl mx-auto mb-3 text-[#5c2d16]" />
              <h3 className="font-bold text-[#5c2d16] mb-1">Natural Wellness</h3>
              <p className="text-sm text-gray-600">
                Herbal & Ayurvedic medicines you can trust
              </p>
            </div>

            <div className="border rounded-lg p-6 text-center">
              <BsGeoAlt className="text-3xl mx-auto mb-3 text-[#5c2d16]" />
              <h3 className="font-bold text-[#5c2d16] mb-1">Local Store</h3>
              <p className="text-sm text-gray-600">
                Serving Navi Mumbai customers
              </p>
            </div>
          </div>

          {/* Services */}
          <div>
            <h2 className="text-2xl font-bold text-[#5c2d16] mb-4">
              What We Offer
            </h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>In-store shopping</li>
              <li>In-store pick-up</li>
              <li>Delivery service</li>
              <li>Guidance on herbal & Ayurvedic products</li>
            </ul>
          </div>

          {/* Address */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-[#5c2d16] mb-2">
              Visit Our Store
            </h2>
            <p className="text-gray-700">
              Office No.15, Yashovardhan C.H.S. Ltd, Plot No. 35,  
              Sector 8, Sanpada, Navi Mumbai, Maharashtra 400705
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Open Monday – Saturday: 9:00 AM – 7:00 PM
            </p>
          </div>

          {/* CTA */}
          <div className="text-center pt-6">
            <button
              onClick={() => navigate('/contact')}
              className="bg-[#5c2d16] text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition font-semibold"
            >
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutPage;
