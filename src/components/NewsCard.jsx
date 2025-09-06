import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NewsCard = ({ news }) => {
  const [expanded, setExpanded] = useState(false);

  // Safely handle description with fallback
  const description = news.description || news.summary || "No description available";
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow flex flex-col h-full"
    >
      {/* Thumbnail (if available) */}
      {news.image && (
        <img
          src={news.image}
          alt={news.title}
          className="w-full h-48 object-cover rounded-t-lg -mx-6 -mt-6 mb-4"
        />
      )}

      {/* Content */}
      <div className="flex flex-col flex-grow">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {news.title || "Untitled News"}
        </h3>

        {/* Status and Version */}
        <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
          <span className="px-2 py-1 bg-gray-100 rounded-full">
            {news.status || "Published"}
          </span>
          <span>v{news.version || "1.0.0"}</span>
        </div>

        {/* Description */}
        <p className="text-gray-600 mb-4 flex-grow">
          {expanded ? description : `${description.slice(0, 120)}${description.length > 120 ? "..." : ""}`}
        </p>

        {/* Extra content (if available and expanded) */}
        <AnimatePresence>
          {expanded && news.content && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="text-gray-700 mb-4"
              dangerouslySetInnerHTML={{ __html: news.content }}
            />
          )}
        </AnimatePresence>

        {/* Date and Category */}
        <div className="flex justify-between items-center text-sm text-gray-500 mt-auto">
          <span>{news.date ? new Date(news.date).toLocaleDateString() : "No date"}</span>
          <span className="px-3 py-1 bg-gray-100 rounded-full font-medium">
            {news.category || "Uncategorized"}
          </span>
        </div>

        {/* Read More Button - only show if there's more content to expand */}
        {(description.length > 120 || news.content) && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-4 bg-[#FFD100] hover:bg-[#FFD100]/90 text-black px-4 py-2 rounded font-medium transition-colors w-full"
          >
            {expanded ? "Show Less" : "Read More"}
          </button>
        )}

        {/* External link (if available) */}
        {expanded && news.link && (
          <a
            href={news.link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 text-center text-blue-600 font-medium hover:underline"
          >
            View full article →
          </a>
        )}
      </div>
    </motion.div>
  );
};

export default NewsCard;