import React from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn } from "react-icons/fa";

const Footer = () => {
  const quickLinks = [
    { name: "Home", link: "/" },
    { name: "Products", link: "/products" },
    { name: "Categories", link: "/categories" },
    { name: "About Us", link: "/about" },
    { name: "Contact", link: "/contact" },
  ];

  const productLinks = [
    { name: "Ayurvedic Hair Oil", link: "/products/ayurvedic-hair-oil" },
    { name: "Herbal Face Cream", link: "/products/herbal-face-cream" },
    { name: "Organic Body Scrub", link: "/products/organic-body-scrub" },
    { name: "Ayurvedic Tea", link: "/products/ayurvedic-tea" },
  ];

  const socialLinks = [
    { icon: <FaFacebookF />, link: "https://facebook.com" },
    { icon: <FaInstagram />, link: "https://instagram.com" },
    { icon: <FaTwitter />, link: "https://twitter.com" },
    { icon: <FaLinkedinIn />, link: "https://linkedin.com" },
  ];

  return (
    <footer className="bg-[#5c2d16] text-gray-200 pt-12">
      <div className="max-w-[100rem] mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">

        {/* Brand */}
        <div>
          <img 
            src="/src/assets/logo/prolific-logo.png" 
            alt="Prolific Healing Herbs" 
            className="h-16 w-auto object-contain mb-4 brightness-200"
          />
          <p className="text-gray-400 mb-4">
            Natural, Ayurvedic, and holistic wellness products for a healthier lifestyle.
          </p>
          <div className="flex gap-4">
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.link}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-green-600 transition"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
          <ul className="space-y-2">
            {quickLinks.map((link, index) => (
              <li key={index}>
                <Link to={link.link} className="hover:text-green-600 transition">
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Products */}
        <div>
          <h3 className="font-semibold text-lg mb-4">Products</h3>
          <ul className="space-y-2">
            {productLinks.map((product, index) => (
              <li key={index}>
                <Link to={product.link} className="hover:text-green-600 transition">
                  {product.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="font-semibold text-lg mb-4">Newsletter</h3>
          <p className="text-gray-400 mb-4">Subscribe to get latest updates and offers.</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              placeholder="Your email"
              className="p-2 rounded-md w-full focus:outline-none text-[#5c2d16]"
            />
            <button className="bg-green-600 px-4 py-2 rounded-md hover:bg-green-700 transition">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800 mt-12 pt-6 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} Prolific Healing Herbs. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
