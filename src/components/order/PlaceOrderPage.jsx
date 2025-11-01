import React from "react";
import { FaCheckCircle } from "react-icons/fa";

const PlaceOrderPage = ({ order }) => {
    // Example order data, replace with props or API data
    const sampleOrder = order || {
        id: "ORD123456",
        name: "John Doe",
        email: "john@example.com",
        phone: "9876543210",
        address: "123 Main Street, City, State, 123456",
        items: [
            { id: 1, name: "Kapiva Amla Juice 1L", qty: 2, price: 349 },
            { id: 2, name: "Kapiva Aloe Vera Juice 1L", qty: 1, price: 299 },
        ],
        subtotal: 999,
        shipping: 49,
        discount: 50,
        total: 998,
        paymentMethod: "Credit/Debit Card",
    };

    return (
        <div className="bg-gray-50 min-h-screen flex items-center justify-center py-10 px-4">
            <div className="max-w-3xl w-full bg-white p-8 rounded-2xl shadow-lg text-center">
                {/* Confirmation Icon */}
                <FaCheckCircle className="mx-auto text-green-600 text-6xl mb-4" />
                <h1 className="text-3xl font-semibold text-gray-800 mb-2">
                    Thank you for your order!
                </h1>
                <p className="text-gray-600 mb-6">
                    Your order <span className="font-semibold">{sampleOrder.id}</span> has
                    been successfully placed.
                </p>

                {/* Delivery Info */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
                    <h2 className="font-semibold mb-2 text-gray-800">Delivery Details</h2>
                    <p className="text-gray-700">{sampleOrder.name}</p>
                    <p className="text-gray-700">{sampleOrder.phone}</p>
                    <p className="text-gray-700">{sampleOrder.email}</p>
                    <p className="text-gray-700">{sampleOrder.address}</p>
                    <p className="text-gray-700 mt-2">
                        Payment Method: <span className="font-medium">{sampleOrder.paymentMethod}</span>
                    </p>
                </div>

                {/* Order Summary */}
                <div className="bg-gray-50 p-4 rounded-lg text-left mb-6">
                    <h2 className="font-semibold mb-2 text-gray-800">Order Summary</h2>
                    {sampleOrder.items.map((item) => (
                        <div
                            key={item.id}
                            className="flex justify-between border-b border-gray-200 py-2"
                        >
                            <span>
                                {item.name} x{item.qty}
                            </span>
                            <span>₹{item.price * item.qty}</span>
                        </div>
                    ))}
                    <div className="flex justify-between py-2">
                        <span>Subtotal</span>
                        <span>₹{sampleOrder.subtotal}</span>
                    </div>
                    <div className="flex justify-between py-2">
                        <span>Shipping</span>
                        <span>₹{sampleOrder.shipping}</span>
                    </div>
                    <div className="flex justify-between py-2">
                        <span>Discount</span>
                        <span>-₹{sampleOrder.discount}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg py-2 border-t border-gray-200 mt-2">
                        <span>Total</span>
                        <span>₹{sampleOrder.total}</span>
                    </div>
                </div>

                {/* Call to Action */}
                <p className="text-gray-600 mb-4">
                    You will receive an email confirmation shortly.
                </p>
                <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-all font-semibold">
                    Continue Shopping
                </button>
            </div>
        </div>
    );
};

export default PlaceOrderPage;
