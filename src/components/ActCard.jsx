import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import AddIcon from "@mui/icons-material/Add";

const ActCard = ({ act }) => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  const handleInnerClick = (e) => {
    e.stopPropagation();
  };

  const handleShowMoreClick = (e) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="relative rounded-2xl shadow-lg backdrop-blur-lg border border-white/40 
                   bg-gradient-to-br from-[#fdfdfd] via-[#f8f8f9] to-[#f5f5f7] p-6 
                   cursor-pointer"
      onClick={() => navigate(`/act/${act.id}`)}
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{act.title}</h3>

      <div onClick={handleInnerClick}>
        <AnimatePresence initial={false}>
          <motion.div
            key={expanded ? "expanded" : "collapsed"}
            initial={{ opacity: 0, maxHeight: 0 }}
            animate={{ opacity: 1, maxHeight: expanded ? 500 : 72 }}
            exit={{ opacity: 0, maxHeight: 0 }}
            transition={{ duration: 0.35 }}
            className="overflow-hidden"
          >
            <p className={`text-gray-600 text-sm ${expanded ? "mb-4" : "line-clamp-3"}`}>
              {act.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-between items-center mt-3 mb-4 text-xs text-gray-500">
        <span>Year: {act.year}</span>
        <span>{act.category || "General"}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          to={`/act/${act.id}`}
          onClick={handleInnerClick}
          className="flex items-center px-3 py-1 rounded-md text-sm font-medium 
                      bg-[#d6d8e0] text-black shadow-sm hover:bg-[#c6c8d0] transition"
        >
          View Details
        </Link>
        <button
          onClick={handleShowMoreClick}
          className="px-3 py-1 rounded-md text-sm font-medium text-gray-900 
                      bg-[#FFD600] hover:bg-[#e6c200] transition shadow-sm"
        >
          {expanded ? "Show Less" : "Show More"}
        </button>
      </div>

      <motion.div
        whileHover={{ rotate: 90, scale: 1.1 }}
        transition={{ duration: 0.3 }}
        className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-black 
                    flex items-center justify-center shadow-lg"
      >
        <Link
          to={`/act/${act.id}`}
          onClick={handleInnerClick}
          className="flex items-center justify-center w-full h-full"
        >
          <AddIcon className="text-white text-lg" />
        </Link>
      </motion.div>
    </motion.div>
  );
};

export default ActCard;
