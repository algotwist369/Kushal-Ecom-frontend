import React, { useState } from "react";

const UnlockOffers = () => {
    const [email, setEmail] = useState("");
    const [subscribed, setSubscribed] = useState(false);

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (!email) return alert("Please enter your email!");
        setSubscribed(true);
        setEmail("");
    };

    return (
        <section className="bg-[#fff8f7] py-16 px-6 flex justify-center">
            <div className="max-w-3xl w-full bg-white shadow-lg rounded-2xl p-8 text-center">
                <h1 className="text-3xl font-bold text-[#381d1b] mb-3">
                    Unlock Offers & Subscribe for Content
                </h1>
                <p className="text-gray-600 mb-6">
                    Join our wellness community to get exclusive discounts, updates, and
                    expert health tips right in your inbox.
                </p>

                {!subscribed ? (
                    <form
                        onSubmit={handleSubscribe}
                        className="flex flex-col sm:flex-row justify-center items-center gap-3"
                    >
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="border border-gray-300 px-4 py-3 rounded-full w-full sm:w-2/3 focus:outline-none focus:border-[#381d1b]"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <button
                            type="submit"
                            className="bg-[#381d1b] text-white px-6 py-3 rounded-full hover:bg-[#4d2623] transition"
                        >
                            Subscribe
                        </button>
                    </form>
                ) : (
                    <div className="text-green-600 font-medium mt-4">
                        ✅ You’re subscribed! Check your inbox for exciting offers.
                    </div>
                )}

                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-gray-700">
                    <div>
                        <img
                            src="https://img.icons8.com/color/96/discount--v1.png"
                            alt="Offers"
                            className="mx-auto w-16 h-16"
                        />
                        <p className="font-medium mt-2">Exclusive Discounts</p>
                    </div>
                    <div>
                        <img
                            src="https://img.icons8.com/color/96/news.png"
                            alt="Content"
                            className="mx-auto w-16 h-16"
                        />
                        <p className="font-medium mt-2">Health & Wellness Tips</p>
                    </div>
                    <div>
                        <img
                            src="https://img.icons8.com/color/96/gift--v1.png"
                            alt="Rewards"
                            className="mx-auto w-16 h-16"
                        />
                        <p className="font-medium mt-2">Special Rewards</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default UnlockOffers;
