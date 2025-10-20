import React, { useState, useEffect, useMemo } from "react";
import { getAllActs, getAllPDFs } from "../utils/supabaseUtils";
import ActCard from "../components/ActCard";
import SearchFilter from "../components/SearchFilter";
import { motion } from "framer-motion";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from "@mui/icons-material/Add";

// 🔹 Apple-style Bouncy Fade & Drop Variant
const bouncyDrop = {
  hidden: { opacity: 0, y: 60, scale: 0.95 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 160,
      damping: 15,
      delay: i * 0.1,
      mass: 0.8,
      restDelta: 0.001,
    },
  }),
};

// ✅ Memoized PDF Card with Animated Preview
const PdfCard = React.memo(({ pdf, index }) => {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <motion.div
      custom={index}
      variants={bouncyDrop}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      whileHover={{
        scale: 1.04,
        boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
      }}
      transition={{ type: "spring", stiffness: 200, damping: 18 }}
      className="relative bg-gradient-to-br from-white via-[#fafafa] to-[#f3f3f4]
                 rounded-2xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-all duration-300"
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{pdf.title}</h3>
      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{pdf.description}</p>

      <div className="flex justify-between items-center mb-4 text-xs text-gray-500">
        <span>Version: {pdf.version}</span>
        <span>{pdf.status}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        <a
          href={pdf.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center px-3 py-1 rounded-md text-sm font-medium 
                     bg-white/80 text-gray-800 shadow-sm hover:bg-white transition"
        >
          <VisibilityIcon fontSize="small" className="mr-1" />
          View
        </a>

        <button
          onClick={() => setShowPreview(!showPreview)}
          className="px-3 py-1 rounded-md text-sm font-medium 
                     bg-gray-100/80 text-gray-700 hover:bg-gray-200 transition shadow-sm"
        >
          {showPreview ? "Hide Preview" : "Show Preview"}
        </button>
      </div>

      {showPreview && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mt-4 border-t border-gray-200 pt-4"
        >
          <iframe
            src={pdf.file_url}
            className="w-full h-64 rounded-lg border border-gray-300"
            title={`Preview of ${pdf.title}`}
          />
        </motion.div>
      )}

      {/* Floating Add Button */}
      <motion.div
        whileHover={{ rotate: 90, scale: 1.15 }}
        transition={{ type: "spring", stiffness: 250, damping: 12 }}
        className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-black 
                   flex items-center justify-center shadow-lg cursor-pointer"
      >
        <AddIcon className="text-white text-lg" />
      </motion.div>
    </motion.div>
  );
});

// ✅ Main ActsExplorer Component
const ActsExplorer = ({ embedded = false }) => {
  const [acts, setActs] = useState([]);
  const [pdfs, setPdfs] = useState([]);
  const [filteredActs, setFilteredActs] = useState([]);
  const [filteredPdfs, setFilteredPdfs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [contentType, setContentType] = useState("acts");
  const [filters, setFilters] = useState({ category: "", status: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const actsData = await getAllActs();
        const pdfsData = await getAllPDFs();
        setActs(actsData);
        setFilteredActs(actsData);
        setPdfs(pdfsData);
        setFilteredPdfs(pdfsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  // 🔹 Search & Filter logic
  useEffect(() => {
    let result = contentType === "acts" ? acts : pdfs;

    if (searchTerm) {
      result = result.filter(
        (item) =>
          item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value) result = result.filter((item) => item[key] === value);
    });

    if (contentType === "acts") setFilteredActs(result);
    else setFilteredPdfs(result);
    setCurrentPage(1);
  }, [searchTerm, filters, acts, pdfs, contentType]);

  const currentItems = useMemo(() => {
    const data = contentType === "acts" ? filteredActs : filteredPdfs;
    const start = (currentPage - 1) * itemsPerPage;
    return data.slice(start, start + itemsPerPage);
  }, [filteredActs, filteredPdfs, contentType, currentPage]);

  const totalPages = Math.ceil(
    (contentType === "acts" ? filteredActs.length : filteredPdfs.length) /
      itemsPerPage
  );

  const filterOptions = [
    {
      type: "category",
      label: "Categories",
      values: ["Income Tax", "Corporate Tax", "Property Tax", "Sales Tax"],
    },
    {
      type: "status",
      label: "Status",
      values: ["Active", "Draft", "Archived"],
    },
  ];

  return (
    <div className="bg-[#f5f5f7] text-black min-h-screen">
      {/* ✅ Hero Section */}
      {!embedded && (
        <section
          id="hero-section"
          className="relative h-[45vh] flex flex-col items-center justify-center text-center overflow-hidden"
          style={{
            backgroundImage: `url(/acts-bg.jpg)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <motion.div
            variants={bouncyDrop}
            initial="hidden"
            animate="visible"
            className="relative z-10 px-4"
          >
            <MenuBookIcon fontSize="large" className="mb-4 text-white" />
            <motion.h1
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 150, damping: 12 }}
              className="text-4xl md:text-5xl font-bold mb-4 text-white drop-shadow-md"
            >
              Documents Explorer
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
              className="text-lg text-gray-200 max-w-2xl mx-auto"
            >
              Browse, filter, and search through all tax documents with ease.
            </motion.p>
          </motion.div>
        </section>
      )}

      {/* ✅ Explorer Section */}
      <section
        id="acts-section"
        className={`${embedded ? "pt-0" : "pt-12"} scroll-mt-[100px] bg-[#f5f5f7] text-black pb-12`}
      >
        <div className="container mx-auto px-6">
          {/* Toggle Buttons */}
          <motion.div
            variants={bouncyDrop}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex justify-center mb-6"
          >
            <div className="flex space-x-4">
              <button
                onClick={() => setContentType("acts")}
                className={`px-4 py-2 rounded-md font-medium transition flex items-center shadow-sm ${
                  contentType === "acts"
                    ? "bg-black text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                <MenuBookIcon className="mr-2" />
                Acts
              </button>
              <button
                onClick={() => setContentType("pdfs")}
                className={`px-4 py-2 rounded-md font-medium transition flex items-center shadow-sm ${
                  contentType === "pdfs"
                    ? "bg-black text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                <PictureAsPdfIcon className="mr-2" />
                PDFs
              </button>
            </div>
          </motion.div>

          {/* Search & Filter */}
          <motion.div
            variants={bouncyDrop}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-gradient-to-br from-[#ffffff] to-[#f5f5f7] shadow-sm rounded-xl p-6 mb-10 border border-gray-200/60"
          >
            <SearchFilter
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filters={filters}
              setFilters={setFilters}
              filterOptions={filterOptions}
            />
          </motion.div>

          {/* Cards Grid with stagger */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={{
              visible: {
                transition: { staggerChildren: 0.12, delayChildren: 0.15 },
              },
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {currentItems.map((item, index) =>
              contentType === "acts" ? (
                <ActCard key={item.id} act={item} index={index} />
              ) : (
                <PdfCard key={item.id} pdf={item} index={index} />
              )
            )}
          </motion.div>

          {/* Empty State */}
          {currentItems.length === 0 && (
            <p className="text-center text-gray-500 mt-8">
              No {contentType} found.
            </p>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div
              variants={bouncyDrop}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="flex justify-center mt-10"
            >
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (number) => (
                  <button
                    key={number}
                    onClick={() => setCurrentPage(number)}
                    className={`mx-1 px-4 py-2 rounded-md font-medium transition shadow-sm ${
                      currentPage === number
                        ? "bg-[#34353A] text-white"
                        : "bg-[#E5E5E5] text-black hover:bg-[#D1D1D1]"
                    }`}
                  >
                    {number}
                  </button>
                )
              )}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ActsExplorer;
