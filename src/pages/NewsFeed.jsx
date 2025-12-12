import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import NewsCard from "../components/NewsCard";
import SearchFilter from "../components/SearchFilter";
import { motion } from "framer-motion";
import NewspaperIcon from "@mui/icons-material/Newspaper";

const fadeIn = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

const NewsFeed = ({ embedded = false }) => {
  const [news, setNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    status: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const { data, error } = await supabase.from("news").select("*");
        if (error) throw error;

        const processedNews = data.map((item) => ({
          ...item,
          status: item.status || "Published",
          // Changed 'version' to 'date', prioritizing created_at timestamp if available
          date: item.created_at || new Date().toLocaleDateString(),
        }));

        setNews(processedNews);
        setFilteredNews(processedNews);
      } catch (error) {
        console.error("Error fetching news:", error.message || error);
      }
    };

    fetchNews();
  }, []);

  useEffect(() => {
    let result = news;

    if (searchTerm) {
      result = result.filter(
        (item) =>
          (item.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.description || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    Object.keys(filters).forEach((filterType) => {
      if (filters[filterType]) {
        result = result.filter((item) => item[filterType] === filters[filterType]);
      }
    });

    setFilteredNews(result);
    setCurrentPage(1);
  }, [searchTerm, filters, news]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredNews.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const filterOptions = [
    {
      type: "category",
      label: "Categories",
      values: ["Tax News", "Legislation Update", "Event", "General"],
    },
    {
      type: "status",
      label: "Status",
      values: ["Published", "Draft", "Archived"],
    },
  ];

  return (
    <div
      className={
        embedded
          ? "bg-[#f8fbff] text-black w-full"
          : "bg-[#f8fbff] text-black min-h-screen"
      }
    >
      {/* Premium Header */}
      <section
        className={
          embedded
            ? "relative h-[28vh] flex flex-col items-center justify-center text-center"
            : "relative h-[50vh] flex flex-col items-center justify-center text-center"
        }
        style={{
          backgroundColor: "#EDEAF2", // Subtle contrast header background
        }}
      >
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="relative z-10 px-4"
        >
          <NewspaperIcon
            fontSize="large"
            className="mb-4 text-gray-900 opacity-90"
          />
          <h1 className="text-3xl md:text-5xl font-semibold mb-3 text-gray-900 tracking-tight">
            News Feed
          </h1>
          <p className="text-md md:text-lg text-gray-600 max-w-2xl mx-auto">
            Stay updated with the latest tax legislation news and events.
          </p>
        </motion.div>
      </section>

      {/* Filters & Search */}
      <section className="bg-[#f8fbff] text-black py-10 md:py-14">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="bg-white shadow-sm rounded-2xl p-6 mb-10 border border-gray-100"
          >
            <SearchFilter
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filters={filters}
              setFilters={setFilters}
              filterOptions={filterOptions}
            />
          </motion.div>

          {/* News Grid */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {currentItems.map((newsItem) => (
              <NewsCard key={newsItem.id} news={newsItem} />
            ))}
          </motion.div>

          {filteredNews.length === 0 && (
            <p className="text-center text-gray-500 mt-8">No news found.</p>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-12">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (number) => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={
                      "mx-1 px-4 py-2 rounded-md font-medium transition-all duration-200 " +
                      (currentPage === number
                        ? "bg-[#dce4f7] text-gray-900"
                        : "bg-gray-200 text-gray-800 hover:bg-gray-300")
                    }
                  >
                    {number}
                  </button>
                )
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default NewsFeed;