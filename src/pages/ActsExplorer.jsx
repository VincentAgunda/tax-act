import React, { useState, useEffect } from "react";
import { getAllActs } from "../utils/firebaseUtils";
import ActCard from "../components/ActCard";
import SearchFilter from "../components/SearchFilter";
import { motion } from "framer-motion";
import MenuBookIcon from "@mui/icons-material/MenuBook";

const fadeIn = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

const ActsExplorer = () => {
  const [acts, setActs] = useState([]);
  const [filteredActs, setFilteredActs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    status: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchActs = async () => {
      try {
        const actsData = await getAllActs();
        setActs(actsData);
        setFilteredActs(actsData);
      } catch (error) {
        console.error("Error fetching acts:", error);
      }
    };

    fetchActs();
  }, []);

  useEffect(() => {
    let result = acts;

    if (searchTerm) {
      result = result.filter(
        (act) =>
          act.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          act.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    Object.keys(filters).forEach((filterType) => {
      if (filters[filterType]) {
        result = result.filter((act) => act[filterType] === filters[filterType]);
      }
    });

    setFilteredActs(result);
    setCurrentPage(1);
  }, [searchTerm, filters, acts]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredActs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredActs.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
    <div className="bg-[#AAAAAA] text-black min-h-screen">
      {/* Hero Section */}
      <section
        className="relative h-[50vh] flex flex-col items-center justify-center text-center"
        style={{
          backgroundImage: `url(/acts-bg.jpg)`,
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
          <MenuBookIcon fontSize="large" className="mb-4 text-white" />
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white">
            Acts Explorer
          </h1>
          <p className="text-lg text-gray-200 max-w-2xl mx-auto">
            Browse, filter, and search through all tax acts with ease.
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

          {/* Acts Grid */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {currentItems.map((act) => (
              <ActCard key={act.id} act={act} />
            ))}
          </motion.div>

          {filteredActs.length === 0 && (
            <p className="text-center text-gray-500 mt-8">No acts found.</p>
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
                        ? "bg-[#34353A] text-white" // Charcoal for active
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

export default ActsExplorer;