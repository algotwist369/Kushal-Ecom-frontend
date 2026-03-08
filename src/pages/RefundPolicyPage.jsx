import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsChevronLeft, BsShieldCheck, BsEnvelope, BsClockHistory, BsTruck } from 'react-icons/bs';
import PopUpModal from '../components/common/PopUpModal';
import SEO from '../components/common/SEO';

const RefundPolicyPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <>
            <SEO 
                title="Refund Policy"
                description="Read the refund and return policy of Prolific Healing Herbs. We ensure a hassle-free shopping experience with clear refund guidelines."
                keywords={['Refund Policy', 'Return Policy', 'Prolific Healing Herbs Policies']}
            />
            <PopUpModal />

            <div className="bg-white min-h-screen">
                {/* Header */}
                <div className="bg-gray-50 border-b border-gray-200">
                    <div className="max-w-5xl mx-auto px-4 py-12 text-center md:text-left">
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center gap-2 text-gray-600 hover:text-[#5c2d16] mb-6 mx-auto md:mx-0"
                        >
                            <BsChevronLeft />
                            Back to Home
                        </button>

                        <h1 className="text-4xl font-bold text-[#5c2d16] mb-3">
                            Refund Policy – Prolific Healing Herbs
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Our commitment to your satisfaction and wellness
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
                    {/* Main Statement */}
                    <div className="bg-green-50 rounded-2xl p-8 border border-green-100 shadow-sm">
                        <p className="text-gray-800 text-lg leading-relaxed text-center italic">
                            "At Prolific Healing Herbs, customer satisfaction is our top priority. If you are not happy with your order, you can request a refund within 7 days of delivery."
                        </p>
                    </div>

                    {/* Steps Section */}
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Step 1 */}
                        <div className="flex gap-4 items-start p-6 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="bg-[#5c2d16] p-3 rounded-lg text-white">
                                <BsEnvelope className="text-2xl" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-2 text-lg">How to Start</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    Email us at <a href="mailto:prolifichealingherbs@gmail.com" className="text-[#5c2d16] font-semibold underline">prolifichealingherbs@gmail.com</a> with your order number and reason for refund.
                                </p>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="flex gap-4 items-start p-6 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="bg-[#5c2d16] p-3 rounded-lg text-white">
                                <BsShieldCheck className="text-2xl" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-2 text-lg">Eligibility</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    Refunds are issued only for <strong>unused, unopened, and undamaged</strong> products to ensure quality control.
                                </p>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="flex gap-4 items-start p-6 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="bg-[#5c2d16] p-3 rounded-lg text-white">
                                <BsClockHistory className="text-2xl" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-2 text-lg">Processing Time</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    Approved refunds will be processed to your original payment method within <strong>7–10 business days</strong>.
                                </p>
                            </div>
                        </div>

                        {/* Step 4 */}
                        <div className="flex gap-4 items-start p-6 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="bg-[#5c2d16] p-3 rounded-lg text-white">
                                <BsTruck className="text-2xl" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-2 text-lg">Shipping Fees</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    Please note that <strong>shipping fees are non-refundable</strong>. We aim for a hassle-free shopping experience.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Message */}
                    <div className="text-center pt-8 border-t border-gray-100">
                        <p className="text-gray-700 leading-relaxed max-w-2xl mx-auto">
                            Thank you for trusting <strong>Prolific Healing Herbs</strong> – your destination for natural, healing herbs and wellness products.
                        </p>
                        <div className="mt-8">
                            <button
                                onClick={() => navigate('/products')}
                                className="bg-[#5c2d16] text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition font-semibold"
                            >
                                Browse Our Products
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default RefundPolicyPage;
