import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logoImage from "../assets/LogoHorizental.png";

const Navbar = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
    window.location.reload(); // refresh UI
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/60 dark:bg-black/40 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 h-20">
        
        {/* Logo */}
        <Link to="/" className="flex items-center h-full group">
          <img
            src={logoImage}
            alt="Logo"
            className="h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        {/* Links */}
        <div className="flex items-center gap-6 text-sm font-medium">
          <Link to="/" className="hover:text-blue-500 transition">Home</Link>
          <Link to="/add" className="hover:text-blue-500 transition">Sell</Link>
          <Link to="/chat" className="hover:text-blue-500 transition">Chat</Link>
          <Link
            to="/plans"
            className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition"
          >
            Plans
          </Link>
          {isLoggedIn ? (
            <>
              {/* Avatar + Dropdown */}
              <div className="relative">
                <div
                  onClick={() => setOpen(!open)}
                  className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold cursor-pointer hover:scale-105 transition"
                >
                  U
                </div>

                {open && (
                  <div className="absolute right-0 mt-3 w-44 bg-white dark:bg-gray-900 rounded-xl shadow-lg border p-2 animate-fadeIn">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                    >
                      Profile
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-red-100 dark:hover:bg-red-900 text-red-500 rounded-lg"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link
              to="/login"
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-5 py-2 rounded-full hover:scale-105 transition shadow-md"
            >
              Login
            </Link>
          )}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;