import React from "react";
import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaLinkedinIn,
} from "react-icons/fa";
import logoUrl from "../../assets/logo/prolific-logo.png";

const footerSections = [
  {
    title: "Quick Links",
    links: [
      { name: "Home", link: "/" },
      { name: "Products", link: "/products" },
      { name: "About Us", link: "/about" },
      { name: "Contact", link: "/contact" },
    ],
  },
  {
    title: "Top Selling Products",
    links: [
      {
        name: "Best Hair Growth Oil",
        link: "/products/gleam-glisten-vata-bhringadi-hair-oil-100ml-strength-to-hair-reduces-hair-fall-promotes-hair-growth",
      },
      {
        name: "Diabetes & Chronic Care",
        link: "/products/atharva-madhunasini-capsules-control-reduces-blood-sugar-levels-30-caps",
      },
      {
        name: "Beauty Care",
        link: "/products/glow-more-again-cucumber-aloevera-gel-suitable-for-all-type-of-skin-60gm",
      },
    ],
  },
];

const socialLinks = [
  {
    icon: FaFacebookF,
    link: "https://www.facebook.com/share/1C8SzAFHn4",
  },
  {
    icon: FaInstagram,
    link: "https://www.instagram.com/prolifichealingherbs",
  },
  {
    icon: FaTwitter,
    link: "https://x.com/prolifichealing",
  },
  {
    icon: FaLinkedinIn,
    link: "https://www.linkedin.com/company/prolific-healing-herbs",
  },
];

const Footer = () => {
  return (
    <footer className="bg-[#111827] text-gray-300">
      <div className="max-w-[100rem] mx-auto px-6 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Brand Section */}
        <div>
          <img
            src={logoUrl}
            alt="Prolific Healing Herbs"
            className="h-16 mb-4 brightness-200"
          />

          <p className="text-sm leading-relaxed text-gray-400 mb-6">
            Prolific Healing Herbs blends modern production technology with
            advanced quality measures to deliver trusted herbal personal care
            and healthcare products.
          </p>

          <div className="flex gap-4">
            {socialLinks.map(({ icon: Icon, link }, i) => (
              <a
                key={i}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-800 hover:bg-green-600 transition"
              >
                <Icon className="text-sm" />
              </a>
            ))}
          </div>
        </div>

        {/* Dynamic Link Sections */}
        {footerSections.map((section, i) => (
          <div key={i}>
            <h3 className="text-lg font-semibold text-white mb-4">
              {section.title}
            </h3>

            <ul className="space-y-2 text-sm">
              {section.links.map((item, idx) => (
                <li key={idx}>
                  <Link
                    to={item.link}
                    className="hover:text-green-500 transition"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Newsletter */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            Newsletter
          </h3>

          <p className="text-sm text-gray-400 mb-4">
            Subscribe to receive updates, offers, and wellness tips.
          </p>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              placeholder="Your email"
              className="flex-1 px-3 py-2 rounded-md text-sm text-[#5c2d16] focus:outline-none"
            />
            <button className="bg-green-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 py-5 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Prolific Healing Herbs. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
