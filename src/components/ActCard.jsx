import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import AddIcon from "@mui/icons-material/Add";

const ActCard = ({ act }) => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  // Handle card click - navigate to act detail
  const handleCardClick = () => {
    navigate(`/act/${act.id}`);
  };

  // Handle inner element clicks - prevent card navigation
  const handleInnerClick = (e) => {
    e.stopPropagation();
  };

  // Handle Show More/Less click
  const handleShowMoreClick = (e) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  // Handle link clicks inside the card
  const handleLinkClick = (e) => {
    e.stopPropagation();
  };

  return (
    <motion.div
      whileHover={{ 
        scale: 1.02,
        boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
      }}
      transition={{ 
        duration: 0.2,
        type: "spring",
        stiffness: 300,
        damping: 25
      }}
      className="relative rounded-2xl shadow-lg border border-white/40 
                 bg-gradient-to-br from-[#fdfdfd] via-[#f8f8f9] to-[#f5f5f7] p-6 
                 cursor-pointer transform-gpu will-change-transform"
      onClick={handleCardClick}
      style={{
        transformStyle: "preserve-3d",
        backfaceVisibility: "hidden",
        WebkitFontSmoothing: "antialiased"
      }}
    >
      {/* Main Card Content */}
      <div className="relative z-10">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {act.title}
        </h3>

        <div onClick={handleInnerClick} className="relative z-20">
          <AnimatePresence initial={false}>
            <motion.div
              key={expanded ? "expanded" : "collapsed"}
              initial={{ opacity: 0, maxHeight: 0 }}
              animate={{ opacity: 1, maxHeight: expanded ? 500 : 72 }}
              exit={{ opacity: 0, maxHeight: 0 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="overflow-hidden transform-gpu"
            >
              <p 
                className={`text-gray-600 text-sm leading-relaxed transform-gpu ${
                  expanded ? "mb-4" : "line-clamp-3"
                }`}
                style={{
                  textRendering: "optimizeLegibility",
                  WebkitFontSmoothing: "antialiased"
                }}
              >
                {act.description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex justify-between items-center mt-3 mb-4 text-xs text-gray-500 transform-gpu">
          <span>Year: {act.year}</span>
          <span>{act.category || "General"}</span>
        </div>

        {/* Buttons Container */}
        <div 
          className="flex flex-wrap gap-2 transform-gpu relative z-30"
          onClick={handleInnerClick}
        >
          <Link
            to={`/act/${act.id}`}
            onClick={handleLinkClick}
            className="flex items-center px-3 py-1.5 rounded-md text-sm font-medium 
                       bg-[#d6d8e0] text-black shadow-sm hover:bg-[#c6c8d0] 
                       transition-colors duration-200 transform-gpu"
          >
            View Details
          </Link>
          <button
            onClick={handleShowMoreClick}
            className="px-3 py-1.5 rounded-md text-sm font-medium text-gray-900 
                       bg-[#FFD600] hover:bg-[#e6c200] transition-colors 
                       duration-200 shadow-sm transform-gpu"
          >
            {expanded ? "Show Less" : "Show More"}
          </button>
        </div>
      </div>

      {/* Floating Add Button */}
      <motion.div
        whileHover={{ 
          rotate: 90, 
          scale: 1.1,
          boxShadow: "0 10px 20px rgba(0,0,0,0.2)"
        }}
        transition={{ duration: 0.3, type: "spring" }}
        className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-black 
                   flex items-center justify-center shadow-lg transform-gpu"
        onClick={handleInnerClick}
        style={{
          transformStyle: "preserve-3d",
          backfaceVisibility: "hidden"
        }}
      >
        <Link
          to={`/act/${act.id}`}
          onClick={handleLinkClick}
          className="flex items-center justify-center w-full h-full"
        >
          <AddIcon 
            className="text-white text-lg" 
            style={{ fontSize: "1.25rem" }}
          />
        </Link>
      </motion.div>

      {/* Card Background Overlay (for better hover effect) */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-transparent to-transparent 
                      opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50/0 to-gray-100/0 
                        rounded-2xl"></div>
      </div>
    </motion.div>
  );
};

export default ActCard;