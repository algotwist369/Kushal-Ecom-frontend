import React from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn } from "react-icons/fa";
import logoUrl from "../../assets/logo/prolific-logo.png";

const Footer = () => {
  const quickLinks = [
    { name: "Home", link: "/" },
    { name: "Products", link: "/products" },
    { name: "About Us", link: "/about" },
    { name: "Contact", link: "/contact" },
  ];

  const productLinks = [
    { name: "Best Hair Growth Oil", link: "/products/gleam-glisten-vata-bhringadi-hair-oil-100ml-strength-to-hair-reduces-hair-fall-promotes-hair-growth" },
    { name: "Diabetes & Chronic Care", link: "/products/atharva-madhunasini-capsules-control-reduces-blood-sugar-levels-30-caps" },
    { name: "Beauty Care", link: "/products/glow-more-again-cucumber-aloevera-gel-suitable-for-all-type-of-skin-60gm" },
  ];

  const socialLinks = [
    { icon: <FaFacebookF />, link: "https://www.facebook.com/share/1C8SzAFHn4" },
    { icon: <FaInstagram />, link: "https://www.instagram.com/prolifichealingherbs" },
    { icon: <FaTwitter />, link: "https://x.com/prolifichealing" },
    { icon: <FaLinkedinIn />, link: "https://www.linkedin.com/company/prolific-healing-herbs" },
  ];

  return (
    <footer className="bg-gray-800 text-gray-200 pt-12">
      <div className="max-w-[100rem] mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">

        {/* Brand */}
        <div>
          <img
            src={logoUrl}
            alt="Prolific Healing Herbs"
            className="h-16 w-auto object-contain mb-4 brightness-200"
          />
          <p className="text-gray-400 mb-4">
            Prolific Healing Herbs is one of the few facilities which
            blends modern production technology and advanced
            quality measures in the area of herbal manufacturing
            for personal care products and herbal health care
            medicines.
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
          <h3 className="font-semibold text-lg mb-4">Top Selling Products</h3>
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
