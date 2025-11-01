import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsChevronLeft, BsEnvelope, BsPhone, BsGeoAlt, BsClock } from 'react-icons/bs';
import toast from 'react-hot-toast';
import PopUpModal from '../components/common/PopUpModal';
import api from '../api/axiosConfig';

const ContactPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const submitPromise = api.post('/contacts/submit', formData);
            
            await toast.promise(
                submitPromise,
                {
                    loading: 'Sending your message...',
                    success: 'Message sent successfully! We\'ll get back to you soon.',
                    error: 'Failed to send message. Please try again.',
                }
            );

            const result = await submitPromise;
            
            if (result.data.success) {
                // Reset form
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    subject: '',
                    message: ''
                });
            }
        } catch (error) {
            console.error('Error submitting contact form:', error);
        } finally {
            setLoading(false);
        }
    };

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

                    <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Contact Us</h1>
                    <p className="text-lg text-gray-600 max-w-3xl">
                        Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                    </p>
                </div>
            </div>

            {/* Contact Information & Form */}
            <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
                <div className="grid lg:grid-cols-3 gap-8 mb-12">
                    {/* Contact Info Cards */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Email */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-gray-900 text-white rounded-lg flex items-center justify-center">
                                    <BsEnvelope className="text-xl" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-2">Email</h3>
                                    <p className="text-gray-600 text-sm">info@ayurvedicstore.com</p>
                                    <p className="text-gray-600 text-sm">support@ayurvedicstore.com</p>
                                </div>
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-gray-900 text-white rounded-lg flex items-center justify-center">
                                    <BsPhone className="text-xl" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-2">Phone</h3>
                                    <p className="text-gray-600 text-sm">+91 1800-123-4567 (Toll Free)</p>
                                    <p className="text-gray-600 text-sm">+91 9876543210</p>
                                </div>
                            </div>
                        </div>

                        {/* Address */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-gray-900 text-white rounded-lg flex items-center justify-center">
                                    <BsGeoAlt className="text-xl" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-2">Address</h3>
                                    <p className="text-gray-600 text-sm">
                                        123 Wellness Street,<br />
                                        Ayurveda Plaza, 2nd Floor<br />
                                        New Delhi - 110001, India
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Hours */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-gray-900 text-white rounded-lg flex items-center justify-center">
                                    <BsClock className="text-xl" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-2">Business Hours</h3>
                                    <p className="text-gray-600 text-sm">Monday - Saturday: 9:00 AM - 7:00 PM</p>
                                    <p className="text-gray-600 text-sm">Sunday: 10:00 AM - 5:00 PM</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white border border-gray-200 rounded-lg p-6 sm:p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
                            
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Your name"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                {/* Email & Phone */}
                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-2">
                                            Email <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="your@email.com"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                            required
                                            disabled={loading}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-2">
                                            Phone <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="10-digit mobile number"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                            required
                                            disabled={loading}
                                            maxLength="10"
                                        />
                                    </div>
                                </div>

                                {/* Subject */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        Subject <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        placeholder="How can we help you?"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                {/* Message */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        Message <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        placeholder="Tell us more about your inquiry..."
                                        rows="6"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Sending...' : 'Send Message'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Map Section */}
                <div className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Visit Our Store</h2>
                    <div className="rounded-lg overflow-hidden border border-gray-200 shadow-md h-96">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3502.2087607412815!2d77.20902931508044!3d28.61393948241957!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd371c7ab4a1%3A0x1a6de00c39e0e29e!2sConnaught%20Place%2C%20New%20Delhi%2C%20Delhi!5e0!3m2!1sen!2sin!4v1645123456789!5m2!1sen!2sin"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Store Location"
                        ></iframe>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 sm:p-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
                    <div className="space-y-6 max-w-3xl mx-auto">
                        {[
                            {
                                question: 'What are your shipping charges?',
                                answer: 'We offer free shipping on orders above ₹500. For orders below ₹500, a flat shipping charge of ₹49 applies.'
                            },
                            {
                                question: 'How long does delivery take?',
                                answer: 'Typically, orders are delivered within 3-5 business days. For remote areas, it may take 5-7 business days.'
                            },
                            {
                                question: 'Do you have a return policy?',
                                answer: 'Yes, we have a 7-day return policy for unopened products. Please contact our support team to initiate a return.'
                            },
                            {
                                question: 'Are your products certified?',
                                answer: 'Yes, all our products are certified by relevant authorities including AYUSH, GMP, and ISO standards.'
                            }
                        ].map((faq, idx) => (
                            <div key={idx} className="border-b border-gray-200 pb-6 last:border-b-0">
                                <h3 className="font-bold text-gray-900 mb-2 text-lg">{faq.question}</h3>
                                <p className="text-gray-600">{faq.answer}</p>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-8">
                        <p className="text-gray-600 mb-4">Still have questions?</p>
                        <a 
                            href="mailto:support@ayurvedicstore.com"
                            className="inline-block bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition font-semibold"
                        >
                            Email Us Directly
                        </a>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};

export default ContactPage;

