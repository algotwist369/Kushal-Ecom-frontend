import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaTruck,
  FaCheckCircle,
  FaClock,
  FaUndo,
  FaHome,
  FaMoneyBillWave,
  FaCreditCard,
} from "react-icons/fa";

const UserProductDetails = () => {
  const navigate = useNavigate();
  const [isCancelled, setIsCancelled] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const order = {
    id: "ORD12345",
    name: "Kapiva Dia Free Juice 1L",
    image:
      "https://kapiva.in/cdn/shop/products/Dia_Free_Juice_1L.jpg?v=1675155234",
    price: 499,
    quantity: 1,
    status: "Out for Delivery",
    paymentMethod: "Credit/Debit Card",
    paymentStatus: "Paid",
    deliveryDate: "2025-10-15",
    orderDate: "2025-10-10",
    address: {
      name: "Priya Sharma",
      phone: "+91 9876543210",
      fullAddress: "Flat 301, Sunrise Apartments, Andheri West, Mumbai - 400053",
    },
    description:
      "Kapiva Dia Free Juice is a blend of 11 ayurvedic herbs like Karela, Jamun, and Amla that naturally help manage blood sugar levels and improve metabolism.",
    refundPolicy:
      "If your order is damaged or incorrect, you can request a refund or replacement within 7 days of delivery.",
  };

  const handleCancelOrder = () => {
    setShowConfirm(false);
    setIsCancelled(true);
  };

  const getStatusColor = () => {
    if (isCancelled) return "text-red-600";
    if (order.status === "Delivered") return "text-green-600";
    if (order.status === "Out for Delivery") return "text-yellow-600";
    if (order.status === "Processing") return "text-gray-600";
    return "text-gray-500";
  };

  const getStatusIcon = () => {
    if (isCancelled) return <FaUndo className="text-red-500 text-xl" />;
    if (order.status === "Delivered")
      return <FaCheckCircle className="text-green-600 text-xl" />;
    if (order.status === "Out for Delivery")
      return <FaTruck className="text-yellow-500 text-xl" />;
    return <FaClock className="text-gray-500 text-xl" />;
  };

  const progressStages = [
    { name: "Order Placed", done: true },
    { name: "Processing", done: true },
    { name: "Out for Delivery", done: !isCancelled },
    { name: "Delivered", done: false },
  ];

  return (
    <section className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="text-[#381d1b] hover:underline mb-6 font-semibold"
        >
          ← Back to Orders
        </button>

        {/* Main Product Card */}
        <div className="bg-white rounded-2xl shadow-md p-6 md:flex gap-6">
          <div className="flex-shrink-0">
            <img
              src={order.image}
              alt={order.name}
              className="w-72 h-72 object-cover rounded-lg mx-auto md:mx-0"
            />
          </div>

          <div className="flex-1 mt-6 md:mt-0">
            <h1 className="text-2xl font-bold text-[#381d1b] mb-2">
              {order.name}
            </h1>
            <p className="text-gray-600 text-sm mb-2">
              Order ID: <span className="font-semibold">{order.id}</span>
            </p>
            <div className="flex items-center gap-2 mb-4">
              {getStatusIcon()}
              <p className={`font-semibold ${getStatusColor()}`}>
                {isCancelled ? "Cancelled" : order.status}
              </p>
            </div>

            <p className="text-gray-700 mb-1">
              Ordered on:{" "}
              <span className="font-medium">{order.orderDate}</span>
            </p>
            <p className="text-gray-700 mb-4">
              Expected Delivery:{" "}
              <span className="font-medium">{order.deliveryDate}</span>
            </p>

            <p className="text-gray-700 leading-relaxed mb-4">
              {order.description}
            </p>

            <div className="flex items-center gap-6">
              <p className="text-2xl font-bold text-[#381d1b]">
                ₹{order.price}
              </p>
              <p className="text-gray-600">Qty: {order.quantity}</p>
            </div>

            {!isCancelled && (
              <button
                onClick={() => setShowConfirm(true)}
                className="mt-6 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
              >
                Cancel Order
              </button>
            )}
            {isCancelled && (
              <p className="mt-6 text-red-600 font-medium">
                This order has been cancelled.
              </p>
            )}
          </div>
        </div>

        {/* Progress Section */}
        <div className="bg-white rounded-2xl shadow-md mt-10 p-6">
          <h2 className="text-xl font-semibold text-[#381d1b] mb-4">
            Order Progress
          </h2>
          <div className="flex flex-wrap justify-between relative">
            {progressStages.map((stage, idx) => (
              <div key={idx} className="flex flex-col items-center w-1/4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    stage.done ? "bg-green-600" : "bg-gray-300"
                  } text-white font-bold`}
                >
                  {idx + 1}
                </div>
                <p className="text-sm mt-2">{stage.name}</p>
                {idx < progressStages.length - 1 && (
                  <div
                    className={`absolute top-5 left-[calc(${idx * 25}%+2.5rem)] w-1/4 h-1 ${
                      stage.done ? "bg-green-500" : "bg-gray-300"
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Payment Details */}
        <div className="bg-white rounded-2xl shadow-md mt-10 p-6">
          <h2 className="text-xl font-semibold text-[#381d1b] mb-3">
            Payment Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
            <div className="flex items-center gap-2">
              <FaCreditCard className="text-[#381d1b]" />
              <p>
                <span className="font-semibold">Payment Method:</span>{" "}
                {order.paymentMethod}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <FaMoneyBillWave className="text-[#381d1b]" />
              <p>
                <span className="font-semibold">Payment Status:</span>{" "}
                {order.paymentStatus}
              </p>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white rounded-2xl shadow-md mt-10 p-6">
          <h2 className="text-xl font-semibold text-[#381d1b] mb-3">
            Shipping Address
          </h2>
          <div className="flex items-start gap-3 text-gray-700">
            <FaHome className="text-[#381d1b] mt-1" />
            <div>
              <p className="font-semibold">{order.address.name}</p>
              <p>{order.address.fullAddress}</p>
              <p>📞 {order.address.phone}</p>
            </div>
          </div>
        </div>

        {/* Refund Policy */}
        <div className="bg-white rounded-2xl shadow-md mt-10 p-6">
          <h2 className="text-xl font-semibold text-[#381d1b] mb-3">
            Refund & Replacement Policy
          </h2>
          <p className="text-gray-700">{order.refundPolicy}</p>
        </div>

        {/* Cancel Confirmation Modal */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-96 text-center">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">
                Cancel Order?
              </h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to cancel this order? This action cannot be undone.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="bg-gray-300 text-gray-800 px-5 py-2 rounded-lg hover:bg-gray-400 transition"
                >
                  No
                </button>
                <button
                  onClick={handleCancelOrder}
                  className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 transition"
                >
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default UserProductDetails;
