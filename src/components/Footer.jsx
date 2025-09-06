import React from "react";

const Footer = () => {
  return (
    <footer className="bg-black text-gray-400 mt-auto py-8">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Branding */}
          <div className="mb-6 md:mb-0 text-center md:text-left">
           
            <p className="text-sm mt-1">
              Your comprehensive tax legislation resource
            </p>
          </div>

          {/* Links */}
          <div className="flex space-x-8">
            <a
              href="#"
              className="text-sm hover:text-white transition-colors duration-300"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-sm hover:text-white transition-colors duration-300"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-sm hover:text-white transition-colors duration-300"
            >
              Contact
            </a>
          </div>
        </div>

        {/* Bottom */}
        <div className="text-center mt-8 pt-6 border-t border-gray-800">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} TaxActs Manager. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
