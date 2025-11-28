import React from "react";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";

const Footer = () => {
  return (
    <footer className="bg-black text-gray-400 mt-auto pt-14 pb-10">
      <div className="container mx-auto px-6">

        {/* --- TOP GRID --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* ABOUT */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">TaxActs Manager</h3>
            <p className="text-sm leading-relaxed">
              Your comprehensive platform for exploring, comparing, and staying up to date 
              with tax legislation. Designed for researchers, tax experts, students, 
              and policy professionals.
            </p>

            {/* Socials */}
            <div className="flex items-center space-x-4 mt-5 text-gray-500">
              <a href="#" className="hover:text-white"><FacebookIcon fontSize="small" /></a>
              <a href="#" className="hover:text-white"><TwitterIcon fontSize="small" /></a>
              <a href="#" className="hover:text-white"><LinkedInIcon fontSize="small" /></a>
              <a href="#" className="hover:text-white"><InstagramIcon fontSize="small" /></a>
            </div>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="#acts" className="hover:text-white transition">Browse Acts</a></li>
              <li><a href="#compare" className="hover:text-white transition">Compare Versions</a></li>
              <li><a href="#news" className="hover:text-white transition">Latest News</a></li>
              <li><a href="#contact" className="hover:text-white transition">Contact Us</a></li>
            </ul>
          </div>

          {/* SUPPORT */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Support</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-white transition">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition">FAQs</a></li>
              <li><a href="#" className="hover:text-white transition">API Access</a></li>
              <li><a href="#" className="hover:text-white transition">Report an Issue</a></li>
            </ul>
          </div>

          {/* CONTACT INFO */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li>Email: <a href="#" className="hover:text-white">support@taxacts.com</a></li>
              <li>Phone: <span className="text-gray-300">+254 700 123 456</span></li>
              <li>Location: <span className="text-gray-300">Nairobi, Kenya</span></li>
              <li className="text-gray-300">Mon - Fri • 9:00am - 5:00pm</li>
            </ul>
          </div>
        </div>

        {/* --- DIVIDER --- */}
        <div className="border-t border-gray-800 mt-12 pt-6"></div>

        {/* --- BOTTOM --- */}
        <div className="flex flex-col md:flex-row justify-between text-center md:text-left">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} TaxActs Manager. All rights reserved.
          </p>

          <div className="flex gap-6 text-sm mt-4 md:mt-0">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
            <a href="#" className="hover:text-white">Cookies</a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
