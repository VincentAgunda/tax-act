import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Link as ScrollLink } from "react-scroll";
import { useAuth } from "../context/AuthContext";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import { motion, AnimatePresence } from "framer-motion";

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
    { path: "/", label: "Home", type: "link" },
    { path: "acts", label: "Acts Explorer", type: "scroll" },
    { path: "compare", label: "Compare Acts", type: "scroll" },
    { path: "news", label: "News Feed", type: "scroll" },
    ...(currentUser
      ? [{ path: "/admin", label: "Admin Dashboard", type: "link" }]
      : []),
  ];

  const HEADER_OFFSET = 80;

  const sidebarVariants = {
    hidden: { x: "100%" },
    visible: { x: 0, transition: { type: "tween", duration: 0.3 } },
    exit: { x: "100%", transition: { type: "tween", duration: 0.3 } },
  };

  const listVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <Link to="/" className="flex items-center space-x-2">
            <AccountBalanceIcon style={{ color: "#AAAAAA" }} fontSize="large" />
          </Link>
        </div>

        {/* Right Section */}
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
              className={`absolute right-0 top-full mt-2 w-52 bg-[#faf9f7] rounded-lg shadow-lg py-2 z-50 ring-1 ring-black ring-opacity-5
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
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
                  >
                    Login
                  </Link>

                  <Link
                    to="/register"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
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
            className="relative w-8 h-8 flex flex-col justify-between items-center p-2 group"
          >
            <span
              className={`block h-0.5 w-6 bg-black transform transition duration-300 ease-in-out ${
                isNavMenuOpen ? "rotate-45 translate-y-2" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-6 bg-black transition duration-300 ease-in-out ${
                isNavMenuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-6 bg-black transform transition duration-300 ease-in-out ${
                isNavMenuOpen ? "-rotate-45 -translate-y-2" : ""
              }`}
            />
          </button>

        </div>
      </div>

      {/* Full Height Slide-In Menu */}
      <AnimatePresence>
        {isNavMenuOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-black bg-opacity-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMenus}
          >
            <motion.div
              className="fixed top-0 right-0 h-screen w-80 bg-[#faf9f7] shadow-xl p-6 overflow-y-auto"
              variants={sidebarVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b pb-4 mb-6">
                <span className="text-lg font-bold text-gray-800">Menu</span>
              </div>

              <motion.nav
                className="flex flex-col space-y-4"
                variants={listVariants}
                initial="hidden"
                animate="visible"
              >
                {navLinks.map((link) =>
                  link.type === "scroll" ? (
                    <motion.div key={link.path} variants={itemVariants}>
                      <ScrollLink
                        to={link.path}
                        smooth={true}
                        duration={500}
                        offset={-HEADER_OFFSET}
                        onClick={closeMenus}
                        className={`block px-4 py-3 rounded-md text-lg cursor-pointer ${
                          isActive(link.path)
                            ? "font-bold bg-gray-200 text-black"
                            : "text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {link.label}
                      </ScrollLink>
                    </motion.div>
                  ) : (
                    <motion.div key={link.path} variants={itemVariants}>
                      <Link
                        to={link.path}
                        onClick={closeMenus}
                        className={`block px-4 py-3 rounded-md text-lg ${
                          isActive(link.path)
                            ? "font-bold bg-gray-200 text-black"
                            : "text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  )
                )}
              </motion.nav>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </header>
  );
};

export default Header;
