import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BsChevronLeft, BsShieldCheck, BsHeart, BsAward, BsPeople } from 'react-icons/bs';
import PopUpModal from '../components/common/PopUpModal';

const AboutPage = () => {
    const navigate = useNavigate();

    return (
        <>
            <PopUpModal />
            <div className="bg-white min-h-screen">
            {/* Hero Section */}
            <div className="bg-gray-50 border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
                    {/* Back Button */}
                    <button 
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition group"
                    >
                        <BsChevronLeft className="text-xl group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium">Back to Home</span>
                    </button>

                    <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">About Us</h1>
                    <p className="text-lg text-gray-600 max-w-3xl">
                        Your trusted partner in natural wellness and Ayurvedic healthcare solutions
                    </p>
                </div>
            </div>

            {/* Our Story Section */}
            <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
                <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Story</h2>
                        <div className="space-y-4 text-gray-600">
                            <p>
                                Founded in 2020, our journey began with a simple mission: to make authentic 
                                Ayurvedic products accessible to everyone seeking natural wellness solutions. 
                                What started as a small family business has grown into a trusted name in 
                                holistic healthcare.
                            </p>
                            <p>
                                We believe in the ancient wisdom of Ayurveda combined with modern scientific 
                                research. Every product in our collection is carefully selected and tested to 
                                ensure it meets our stringent quality standards.
                            </p>
                            <p>
                                Today, we serve thousands of customers across India, helping them achieve 
                                better health naturally. Our commitment to quality, authenticity, and customer 
                                satisfaction remains unwavering.
                            </p>
                        </div>
                    </div>
                    <div className="rounded-lg overflow-hidden shadow-lg">
                        <img 
                            src="https://images.unsplash.com/photo-1599481238640-4c1288750d7a?w=800&q=80" 
                            alt="Our Story" 
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                {/* Our Values */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Values</h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center hover:shadow-lg transition">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 text-white rounded-full mb-4">
                                <BsShieldCheck className="text-2xl" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Quality First</h3>
                            <p className="text-gray-600 text-sm">
                                We source only the finest ingredients and maintain strict quality control at every step.
                            </p>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center hover:shadow-lg transition">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 text-white rounded-full mb-4">
                                <BsHeart className="text-2xl" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Customer Care</h3>
                            <p className="text-gray-600 text-sm">
                                Your health and satisfaction are our top priorities. We're here to support your wellness journey.
                            </p>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center hover:shadow-lg transition">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 text-white rounded-full mb-4">
                                <BsAward className="text-2xl" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Authenticity</h3>
                            <p className="text-gray-600 text-sm">
                                100% genuine Ayurvedic formulations following traditional practices and modern standards.
                            </p>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center hover:shadow-lg transition">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 text-white rounded-full mb-4">
                                <BsPeople className="text-2xl" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Community</h3>
                            <p className="text-gray-600 text-sm">
                                Building a community of health-conscious individuals embracing natural wellness.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Why Choose Us */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 sm:p-12 mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why Choose Us</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold">
                                    ✓
                                </div>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-2">100% Natural Products</h3>
                                <p className="text-gray-600 text-sm">
                                    All our products are made from pure, natural ingredients without harmful chemicals or additives.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold">
                                    ✓
                                </div>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-2">Certified & Tested</h3>
                                <p className="text-gray-600 text-sm">
                                    Each product is certified and tested for safety, efficacy, and quality standards.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold">
                                    ✓
                                </div>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-2">Expert Guidance</h3>
                                <p className="text-gray-600 text-sm">
                                    Our team of Ayurvedic experts is available to help you choose the right products.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold">
                                    ✓
                                </div>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-2">Fast & Secure Delivery</h3>
                                <p className="text-gray-600 text-sm">
                                    Quick shipping with secure packaging to ensure products reach you in perfect condition.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold">
                                    ✓
                                </div>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-2">Affordable Pricing</h3>
                                <p className="text-gray-600 text-sm">
                                    Premium quality at competitive prices, with regular offers and discounts.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold">
                                    ✓
                                </div>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-2">Customer Satisfaction</h3>
                                <p className="text-gray-600 text-sm">
                                    Over 10,000+ happy customers with 4.5+ average rating across all products.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Our Mission */}
                <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
                    <div className="rounded-lg overflow-hidden shadow-lg order-2 md:order-1">
                        <img 
                            src="https://images.unsplash.com/photo-1545239351-1141bd82e8a6?w=800&q=80" 
                            alt="Our Mission" 
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="order-1 md:order-2">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
                        <p className="text-gray-600 mb-4">
                            To promote holistic health and wellness by providing authentic, high-quality 
                            Ayurvedic products that are rooted in ancient wisdom and backed by modern science.
                        </p>
                        <p className="text-gray-600 mb-4">
                            We strive to make Ayurveda accessible and affordable to everyone, empowering 
                            individuals to take charge of their health naturally.
                        </p>
                        <div className="bg-gray-900 text-white p-6 rounded-lg mt-6">
                            <p className="font-semibold mb-2">Our Commitment:</p>
                            <p className="text-gray-200 text-sm">
                                "To be India's most trusted Ayurvedic wellness brand, touching millions of 
                                lives with the healing power of nature."
                            </p>
                        </div>
                    </div>
                </div>

                {/* Statistics */}
                <div className="bg-gray-900 text-white rounded-lg p-8 sm:p-12 mb-16">
                    <h2 className="text-3xl font-bold mb-8 text-center">Our Impact</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="text-4xl sm:text-5xl font-bold mb-2">10K+</div>
                            <div className="text-gray-300 text-sm">Happy Customers</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl sm:text-5xl font-bold mb-2">500+</div>
                            <div className="text-gray-300 text-sm">Products</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl sm:text-5xl font-bold mb-2">4.5</div>
                            <div className="text-gray-300 text-sm">Average Rating</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl sm:text-5xl font-bold mb-2">5+</div>
                            <div className="text-gray-300 text-sm">Years Experience</div>
                        </div>
                    </div>
                </div>

                {/* Team Section */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Meet Our Team</h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            {
                                name: 'Dr. Priya Sharma',
                                role: 'Chief Ayurvedic Consultant',
                                image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&q=80'
                            },
                            {
                                name: 'Rajesh Kumar',
                                role: 'Quality Control Head',
                                image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80'
                            },
                            {
                                name: 'Anjali Verma',
                                role: 'Product Development',
                                image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80'
                            },
                            {
                                name: 'Vikram Singh',
                                role: 'Customer Relations',
                                image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80'
                            }
                        ].map((member, idx) => (
                            <div key={idx} className="text-center">
                                <div className="mb-4 rounded-full overflow-hidden w-32 h-32 mx-auto border-4 border-gray-200">
                                    <img 
                                        src={member.image} 
                                        alt={member.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <h3 className="font-bold text-gray-900 mb-1">{member.name}</h3>
                                <p className="text-sm text-gray-600">{member.role}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Certifications */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 sm:p-12 mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Certifications</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            'ISO 9001:2015',
                            'GMP Certified',
                            'Ayush Approved',
                            'Organic India'
                        ].map((cert, idx) => (
                            <div key={idx} className="bg-white border-2 border-gray-900 rounded-lg p-6 text-center">
                                <div className="text-3xl mb-2">🏆</div>
                                <p className="font-semibold text-gray-900 text-sm">{cert}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA Section */}
                <div className="text-center bg-gray-900 text-white rounded-lg p-8 sm:p-12">
                    <h2 className="text-3xl font-bold mb-4">Start Your Wellness Journey Today</h2>
                    <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                        Discover our range of authentic Ayurvedic products and experience the power of natural healing.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => navigate('/products')}
                            className="bg-white text-gray-900 px-8 py-3 rounded-lg hover:bg-gray-100 transition font-semibold"
                        >
                            Explore Products
                        </button>
                        <button
                            onClick={() => navigate('/contact')}
                            className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg hover:bg-white hover:text-gray-900 transition font-semibold"
                        >
                            Contact Us
                        </button>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};

export default AboutPage;

