import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsChevronLeft, BsShieldCheck, BsLock, BsEye, BsEnvelope, BsInfoCircle, BsCheck2Circle } from 'react-icons/bs';
import PopUpModal from '../components/common/PopUpModal';
import SEO from '../components/common/SEO';

const PrivacyPolicyPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const sections = [
        {
            title: "Information We Collect",
            icon: <BsInfoCircle className="text-2xl" />,
            content: (
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                    <li><strong>Personal Data</strong>: Name, email, phone, shipping/billing address, payment details (via secure processors).</li>
                    <li><strong>Order Data</strong>: Product purchases, order history, delivery preferences.</li>
                    <li><strong>Usage Data</strong>: IP address, browser type, pages visited, time spent (via cookies).</li>
                    <li><strong>Communication Data</strong>: Inquiries sent to prolifichealingherbs@gmail.com.</li>
                </ul>
            )
        },
        {
            title: "How We Use Your Data",
            icon: <BsCheck2Circle className="text-2xl" />,
            content: (
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                    <li>Process and ship orders.</li>
                    <li>Send order confirmations, shipping updates, and promotional emails (with opt-out).</li>
                    <li>Improve site functionality and customer experience.</li>
                    <li>Comply with legal obligations (e.g., tax records).</li>
                    <li>Personalize recommendations for natural healing herbs.</li>
                </ul>
            )
        },
        {
            title: "Cookies & Tracking",
            icon: <BsEye className="text-2xl" />,
            content: (
                <p className="text-gray-600 leading-relaxed">
                    We use essential cookies for site functionality and analytics cookies (Google Analytics) for traffic insights. Manage preferences via browser settings or our cookie banner.
                </p>
            )
        },
        {
            title: "Data Sharing",
            icon: <BsShieldCheck className="text-2xl" />,
            content: (
                <div className="space-y-3">
                    <p className="text-gray-600">We share data only with:</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                        <li>Shipping carriers (e.g., India Post, DTDC).</li>
                        <li>Payment gateways (e.g., Razorpay, PayPal).</li>
                        <li>Legal authorities if required.</li>
                    </ul>
                    <p className="text-[#5c2d16] font-semibold">No data is sold to third parties.</p>
                </div>
            )
        },
        {
            title: "Data Security",
            icon: <BsLock className="text-2xl" />,
            content: (
                <p className="text-gray-600 leading-relaxed">
                    SSL encryption protects data transmission. Access is restricted to authorized staff. While we use robust measures, no online system is fully risk-free.
                </p>
            )
        },
        {
            title: "Your Rights",
            icon: <BsEnvelope className="text-2xl" />,
            content: (
                <div className="space-y-3">
                    <p className="text-gray-600 italic">Email prolifichealingherbs@gmail.com to:</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                        <li>Access, correct, or delete your data.</li>
                        <li>Opt out of marketing.</li>
                        <li>Request data portability.</li>
                    </ul>
                    <p className="text-gray-600">We respond within 30 days.</p>
                </div>
            )
        }
    ];

    return (
        <>
            <SEO 
                title="Privacy Policy"
                description="Learn how Prolific Healing Herbs collects, uses, and protects your personal data. We are committed to your privacy and data security."
                keywords={['Privacy Policy', 'Data Protection', 'Prolific Healing Herbs Privacy']}
            />
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
                            Privacy Policy
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Detailed Privacy Policy – Prolific Healing Herbs
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-5xl mx-auto px-4 py-12">
                    <div className="prose prose-brown max-w-none">
                        <p className="text-gray-700 text-lg mb-10 leading-relaxed border-l-4 border-[#5c2d16] pl-6 py-2 bg-gray-50">
                            Prolific Healing Herbs is committed to protecting your privacy. This policy details how we collect, use, share, and safeguard your personal data when you purchase herbal products or visit our site.
                        </p>

                        <div className="grid md:grid-cols-2 gap-8">
                            {sections.map((section, idx) => (
                                <div key={idx} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="bg-[#5c2d16] p-2.5 rounded-lg text-white">
                                            {section.icon}
                                        </div>
                                        <h2 className="text-xl font-bold text-gray-900 m-0">{section.title}</h2>
                                    </div>
                                    <div className="text-sm">
                                        {section.content}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 space-y-6 text-gray-700">
                            <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-6">
                                <h3 className="text-lg font-bold text-yellow-800 mb-2">Children’s Privacy</h3>
                                <p className="text-sm">Our services are not for users under 18. We don’t knowingly collect their data.</p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-lg font-bold text-[#5c2d16] mb-2">Third-Party Links</h3>
                                    <p className="text-sm">Our site may link to external sites (e.g., payment processors). We’re not responsible for their privacy practices.</p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-[#5c2d16] mb-2">Policy Changes</h3>
                                    <p className="text-sm">Updates will be posted here with date. Continued use implies acceptance.</p>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
                                <p><strong>Last Updated</strong>: March 8, 2026</p>
                                <p>Contact: <a href="mailto:prolifichealingherbs@gmail.com" className="text-[#5c2d16] hover:underline">prolifichealingherbs@gmail.com</a></p>
                            </div>
                        </div>

                        <div className="text-center pt-12">
                            <button
                                onClick={() => navigate('/products')}
                                className="bg-[#5c2d16] text-white px-10 py-3.5 rounded-xl hover:bg-gray-800 transition-all font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PrivacyPolicyPage;
