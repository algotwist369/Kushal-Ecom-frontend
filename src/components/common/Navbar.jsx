import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { BsCart4, BsHouseDoor, BsGrid, BsBoxSeam } from "react-icons/bs";
import { FaUserCircle } from "react-icons/fa";
import { IoMdMenu, IoMdClose } from "react-icons/io";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../context/CartContext";
import logoUrl from "../../assets/logo/prolific-logo.png";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const { user, isAuthenticated, logout } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef(null);
  const cartCount = getCartCount();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/login');
  };

  // Navigation links
  const navLinks = [
    { name: "Home", path: "/", icon: <BsHouseDoor /> },
    { name: "Products", path: "/products", icon: <BsGrid /> },
    { name: "My Orders", path: "/orders", icon: <BsBoxSeam />, authRequired: true }
  ];

  const isActivePath = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-[100rem] mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img
            src={logoUrl}
            alt="Prolific Healing Herbs"
            className="h-12 w-auto object-contain"
          />
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            // Skip auth-required links if not authenticated
            if (link.authRequired && !isAuthenticated) return null;

            const isActive = isActivePath(link.path);

            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg font-medium transition ${isActive
                    ? 'bg-[#5c2d16] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Desktop Right Side */}
        <div className="hidden md:flex items-center gap-4">
          {/* Cart Icon (non-admin only) */}
          {user?.role !== 'admin' && (
            <Link to="/cart" className="relative group">
              <BsCart4 className="text-2xl text-[#5c2d16] hover:text-gray-600 transition" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#5c2d16] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          {/* User Profile Dropdown (when logged in) */}
          {isAuthenticated ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:border-[#5c2d16] transition"
              >
                <FaUserCircle className="text-2xl text-[#5c2d16]" />
                <span className="text-sm font-medium text-[#5c2d16] hidden lg:block">
                  {user?.name?.split(' ')[0]}
                </span>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 border border-gray-200">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-semibold text-[#5c2d16]">{user?.name}</p>
                    <p className="text-xs text-gray-600 mt-1">{user?.email}</p>
                    {user?.role === 'admin' && (
                      <span className="inline-block mt-2 px-2 py-1 bg-[#5c2d16] text-white text-xs font-semibold rounded">
                        Admin
                      </span>
                    )}
                  </div>

                  {user?.role === 'admin' ? (
                    // Admin-only menu items
                    <Link
                      to="/admin"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-4 py-2 text-[#5c2d16] hover:bg-gray-100 font-medium transition-colors"
                    >
                      <span>Admin Dashboard</span>
                    </Link>
                  ) : (
                    // Regular user menu items
                    <>
                      <Link
                        to="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        My Profile
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setShowUserMenu(false)}
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        My Orders
                      </Link>
                    </>
                  )}
                  <hr className="my-2" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors font-medium"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 bg-[#5c2d16] text-white rounded-lg hover:bg-gray-800 transition font-medium"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile Right Side */}
        <div className="md:hidden flex items-center gap-3">
          {/* Cart Icon (Mobile - non-admin only) */}
          {user?.role !== 'admin' && (
            <Link to="/cart" className="relative">
              <BsCart4 className="text-2xl text-[#5c2d16] hover:text-gray-600 transition" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#5c2d16] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button
            className="text-gray-700 focus:outline-none"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <IoMdClose className="text-3xl" />
            ) : (
              <IoMdMenu className="text-3xl" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 py-4 px-4 space-y-2">
          {/* Navigation Links */}
          {navLinks.map((link) => {
            // Skip auth-required links if not authenticated
            if (link.authRequired && !isAuthenticated) return null;

            const isActive = isActivePath(link.path);

            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${isActive
                    ? 'bg-[#5c2d16] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                  }`}
                onClick={() => setMenuOpen(false)}
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            );
          })}

          {/* Cart (Mobile) for non-admin */}
          {user?.role !== 'admin' && (
            <Link
              to="/cart"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition"
              onClick={() => setMenuOpen(false)}
            >
              <BsCart4 className="text-xl" />
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="ml-auto bg-[#5c2d16] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          {/* User Menu (Mobile) */}
          {isAuthenticated ? (
            <>
              <div className="border-t border-gray-200 pt-4 mt-4">
                <p className="text-xs text-gray-500 mb-2 px-4">Logged in as</p>
                <p className="font-semibold text-[#5c2d16] px-4">{user?.name}</p>
                <p className="text-sm text-gray-600 px-4">{user?.email}</p>
                {user?.role === 'admin' && (
                  <span className="inline-block mt-2 ml-4 px-3 py-1 bg-[#5c2d16] text-white text-xs font-semibold rounded">
                    Admin
                  </span>
                )}
              </div>

              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#5c2d16] hover:bg-gray-100 font-medium transition"
                  onClick={() => setMenuOpen(false)}
                >
                  <span>🎛️</span>
                  <span>Admin Dashboard</span>
                </Link>
              )}

              {user?.role !== 'admin' && (
                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                  onClick={() => setMenuOpen(false)}
                >
                  <FaUserCircle className="text-xl" />
                  <span>My Profile</span>
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 font-medium transition"
              >
                <span>Logout</span>
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#5c2d16] text-white hover:bg-gray-800 font-medium transition"
              onClick={() => setMenuOpen(false)}
            >
              <FaUserCircle className="text-xl" />
              <span>Login</span>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
