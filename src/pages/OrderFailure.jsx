import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BsXCircleFill, BsArrowLeft } from 'react-icons/bs';

const OrderFailure = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const errorMessage = location.state?.message || "Something went wrong while processing your order.";

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-2xl mx-auto px-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                    {/* Error Icon */}
                    <div className="mb-6">
                        <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                            <BsXCircleFill className="text-5xl text-red-600" />
                        </div>
                    </div>

                    {/* Error Message */}
                    <h1 className="text-3xl font-bold text-[#5c2d16] mb-2">
                        Order Failed
                    </h1>
                    <p className="text-gray-600 mb-6">
                        {errorMessage}
                    </p>

                    {/* Error Details */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
                        <div className="text-left">
                            <h3 className="font-semibold text-[#5c2d16] mb-2">Possible Reasons:</h3>
                            <ul className="text-sm text-gray-700 space-y-1">
                                <li>• Payment was cancelled or declined</li>
                                <li>• Network connection interrupted</li>
                                <li>• Some items went out of stock</li>
                                <li>• Session expired</li>
                            </ul>
                        </div>
                    </div>

                    {/* What to Do Next */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
                        <div className="text-left">
                            <h3 className="font-semibold text-[#5c2d16] mb-2">What to do next?</h3>
                            <ul className="text-sm text-gray-700 space-y-1">
                                <li>• Check your cart and try placing the order again</li>
                                <li>• Verify your payment details</li>
                                <li>• Ensure you have a stable internet connection</li>
                                <li>• Contact support if the issue persists</li>
                            </ul>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <button
                            onClick={() => navigate('/checkout')}
                            className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition font-semibold flex items-center justify-center gap-2"
                        >
                            <BsArrowLeft />
                            Try Again
                        </button>
                        <button
                            onClick={() => navigate('/cart')}
                            className="w-full bg-white text-gray-700 py-3 px-6 rounded-lg border-2 border-gray-300 hover:bg-gray-50 transition font-semibold"
                        >
                            View Cart
                        </button>
                        <button
                            onClick={() => navigate('/products')}
                            className="w-full text-gray-600 hover:text-[#5c2d16] py-2 font-medium"
                        >
                            Continue Shopping
                        </button>
                    </div>
                </div>

                {/* Support Info */}
                <div className="mt-6 text-center">
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <h3 className="font-semibold text-[#5c2d16] mb-2">Need Help?</h3>
                        <p className="text-sm text-gray-600 mb-3">
                            Our support team is here to assist you
                        </p>
                        <div className="space-y-1 text-sm">
                            <p className="text-gray-700">
                                <span className="font-medium">Email:</span> 
                            </p>
                            <p className="text-gray-700">
                                <span className="font-medium">Phone:</span> +91 1800-XXX-XXXX
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderFailure;

