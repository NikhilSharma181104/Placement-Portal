import React, { useState, useEffect } from "react";
import { auth } from "../firebase-config";
import { useNavigate, Link } from "react-router-dom";

const Navbar = ({ onLogout }) => {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (!user) {
        navigate("/");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    if (onLogout) {
      onLogout();
    } else {
      try {
        await auth.signOut();
        navigate("/");
      } catch (error) {
        console.error("Error signing out:", error);
      }
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 bg-blue-700 border-b border-gray-200 transition-all duration-300 ${
        scrolled ? "shadow-md" : ""
      }`}
    >
      
      {/* Right-pinned logo */}
      <Link
        to="/"
        className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center space-x-2 px-4 z-50"
      >
    
        <svg
          className="h-8 w-8 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
        
        <span className="text-xl font-bold text-white tracking-tight">
          Placement Portal
        </span>
      </Link>

      {/* User & Menu */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center h-16 relative">
          {user && (
            <div className="flex items-center gap-4">
              {/* User Info */}
              <div className="hidden md:flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
                <svg
                  className="h-4 w-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span className="text-sm font-medium text-blue-700 truncate max-w-[160px]">
                  {user.email}
                </span>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="hidden md:flex items-center gap-2 bg-white hover:bg-blue-700 text-blue-700 hover:text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span>Sign Out</span>
              </button>

              {/* Mobile Menu */}
              <div className="md:hidden relative">
                <button
                  onClick={toggleMenu}
                  className="flex items-center justify-center h-9 w-9 rounded-full bg-blue-100 hover:bg-blue-200 transition"
                >
                  <svg
                    className="h-5 w-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16m-7 6h7"
                    />
                  </svg>
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-lg shadow-md z-50">
                    <div className="px-4 py-2 text-sm text-gray-800 font-medium border-b">
                      {user.email}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
