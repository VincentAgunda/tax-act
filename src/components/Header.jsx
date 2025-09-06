import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance"; // New Logo ✅

const Header = () => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setIsProfileMenuOpen(false);
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const isActive = (path) => location.pathname === path;

  const toggleNavMenu = () => {
    setIsProfileMenuOpen(false);
    setIsNavMenuOpen(!isNavMenuOpen);
  };

  const toggleProfileMenu = () => {
    setIsNavMenuOpen(false);
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const closeMenus = () => {
    setIsNavMenuOpen(false);
    setIsProfileMenuOpen(false);
  };

  useEffect(() => {
    closeMenus();
  }, [location.pathname]);

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/acts", label: "Acts Explorer" },
    { path: "/compare", label: "Compare Acts" },
    { path: "/news", label: "News Feed" },
    ...(currentUser ? [{ path: "/admin", label: "Admin Dashboard" }] : []),
  ];

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* --- Left Section: Logo --- */}
        <div className="flex items-center space-x-3">
          <Link to="/" className="flex items-center space-x-2">
            <AccountBalanceIcon style={{ color: "#AAAAAA" }} fontSize="large" />
            <span className="text-lg font-bold" style={{ color: "#DDDDDD" }}>
              TaxAct
            </span>
          </Link>
        </div>

        {/* --- Right Section: Profile + Menu --- */}
        <div className="flex items-center space-x-3">
          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={toggleProfileMenu}
              className="focus:outline-none p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <AccountCircleIcon className="text-gray-700" fontSize="medium" />
            </button>

            <div
              className={`absolute right-0 top-full mt-2 w-52 bg-white rounded-lg shadow-lg py-2 z-50 ring-1 ring-black ring-opacity-5
                         transform transition-all duration-200 ease-in-out origin-top-right
                         ${
                           isProfileMenuOpen
                             ? "opacity-100 scale-100"
                             : "opacity-0 scale-95 pointer-events-none"
                         }`}
            >
              {currentUser ? (
                <>
                  <div className="px-4 py-2 text-sm text-gray-600 border-b truncate">
                    {currentUser.email}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Hamburger Menu */}
          <button
            onClick={toggleNavMenu}
            className="text-black focus:outline-none p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <MenuIcon />
          </button>
        </div>
      </div>

      {/* --- Fullscreen Slide-in Drawer Menu --- */}
      <div
        className={`fixed inset-0 z-50 bg-black bg-opacity-40 transition-opacity duration-300 ${
          isNavMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeMenus}
      >
        <div
          className={`absolute top-0 right-0 h-full w-72 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
          ${isNavMenuOpen ? "translate-x-0" : "translate-x-full"}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b">
            <span className="text-lg font-bold text-gray-800">Menu</span>
            <button onClick={closeMenus} className="p-2">
              <CloseIcon />
            </button>
          </div>
          <nav className="flex flex-col p-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-md text-base ${
                  isActive(link.path)
                    ? "font-bold bg-gray-100 text-black"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
