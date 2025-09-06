import React, { useState, useEffect } from "react";
import { getAllNews } from "../utils/firebaseUtils";
import NewsCard from "../components/NewsCard";
import SearchFilter from "../components/SearchFilter";
import { motion } from "framer-motion";
import NewspaperIcon from "@mui/icons-material/Newspaper";

const fadeIn = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

const NewsFeed = () => {
  const [news, setNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    category: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const newsData = await getAllNews();
        // Add default values for status and version if missing
        const processedNews = newsData.map(item => ({
          ...item,
          status: item.status || "Published",
          version: item.version || "1.0.0"
        }));
        setNews(processedNews);
        setFilteredNews(processedNews);
      } catch (error) {
        console.error("Error fetching news:", error);
      }
    };

    fetchNews();
  }, []);

  useEffect(() => {
    let result = news;

    if (searchTerm) {
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase())
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
    <div className="bg-[#AAAAAA] text-black min-h-screen">
      {/* Hero Section */}
      <section
        className="relative h-[50vh] flex flex-col items-center justify-center text-center"
        style={{
          backgroundImage: `url(/news-bg.jpg)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="relative z-10 px-4"
        >
          <NewspaperIcon fontSize="large" className="mb-4 text-white" />
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white">
            News Feed
          </h1>
          <p className="text-lg text-gray-200 max-w-2xl mx-auto">
            Stay updated with the latest tax legislation news and events.
          </p>
        </motion.div>
      </section>

      {/* Filters & Search */}
      <section className="bg-[#F5F5F5] text-black py-12">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="bg-white shadow-md rounded-lg p-6 mb-10"
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
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
            <div className="flex justify-center mt-10">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (number) => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`mx-1 px-4 py-2 rounded-md font-medium transition ${
                      currentPage === number
                        ? "bg-[#34353A] text-white"
                        : "bg-[#E5E5E5] text-black hover:bg-[#D1D1D1]"
                    }`}
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