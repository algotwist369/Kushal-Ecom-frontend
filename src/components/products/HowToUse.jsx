import React from "react";

const HowToUse = () => {
    const steps = [
        {
            id: 1,
            title: "Step 1: Shake the Bottle",
            description: "Shake the product well before use to mix all the herbal ingredients properly.",
            image: "https://oppositehq.com/static/00e7a036cb2e0f2b61937dfc90356eb9/13969/20_aloeplus2_kapiva_e065e3887a.jpg",
        },
        {
            id: 2,
            title: "Step 2: Measure the Dosage",
            description: "Take 30 ml of the juice using a measuring cup or spoon provided.",
            image: "https://oppositehq.com/static/7ea659e627c831366ff9173d34d5837b/13969/3_solution1_kapiva_858d79b4ec.jpg",
        },
        {
            id: 3,
            title: "Step 3: Consume After Meals",
            description: "Drink the juice twice daily after meals for best results.",
            image: "https://oppositehq.com/static/5393bd49ec2b5cbdd1bdefb756cc7e35/7b1eb/0_herounit_kapiva_a00fba4552.jpg",
        },
        {
            id: 4,
            title: "Step 4: Follow a Healthy Routine",
            description: "Combine with a balanced diet and regular exercise for optimal results.",
            image: "https://images.unsplash.com/photo-1556228724-4b8b08a0b9b1?auto=format&fit=crop&w=800&q=80",
        },
    ];

    return (
        <section className="py-16 bg-gray-50">
            <div className="max-w-[100rem] mx-auto px-4">
                <h1 className="text-4xl font-bold mb-12 text-center text-gray-800">
                    How to Use
                </h1>

                <div className="space-y-12">
                    {steps.map((step, index) => (
                        <div
                            key={step.id}
                            className={`flex flex-col md:flex-row items-center md:gap-12 ${index % 2 !== 0 ? "md:flex-row-reverse" : ""
                                }`}
                        >
                            <img
                                src={step.image}
                                alt={step.title}
                                className="w-full md:w-1/2 h-64 object-cover rounded-lg shadow-lg"
                            />
                            <div className="mt-4 md:mt-0 md:w-1/2">
                                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                                    {step.title}
                                </h2>
                                <p className="text-gray-600">{step.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowToUse;
