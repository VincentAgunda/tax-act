import React, { useState, useEffect, useMemo } from "react";
import { getAllActs } from "../utils/supabaseUtils";
import ActCard from "../components/ActCard";
import SearchFilter from "../components/SearchFilter";
import { motion, AnimatePresence } from "framer-motion";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useNavigate } from "react-router-dom";

/**
 * FIXED: SidebarContent is now outside the main component.
 * This prevents the sidebar from re-mounting every time the state changes.
 */
const SidebarContent = ({ 
  actsByYear, 
  collapsedYears, 
  toggleYear, 
  setCollapsedYears, 
  navigate,
  onItemClick 
}) => {
  const allCollapsed = Object.values(collapsedYears).every(Boolean);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header section of Sidebar */}
      <div className="p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <MenuBookIcon className="text-blue-600" fontSize="small" />
          Directory
        </h3>

        <button
          onClick={() => {
            const newState = {};
            Object.keys(actsByYear).forEach((year) => {
              newState[year] = !allCollapsed;
            });
            setCollapsedYears(newState);
          }}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
        >
          {allCollapsed ? "Expand All" : "Collapse All"}
        </button>
      </div>

      {/* Scrollable list of years/acts */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
        {Object.entries(actsByYear).map(([year, list]) => (
          <div key={year} className="group">
            <button
              onClick={() => toggleYear(year)}
              className={`w-full flex items-center justify-between p-3 rounded-lg text-sm transition-colors ${
                !collapsedYears[year]
                  ? "bg-gray-50 text-blue-700 font-semibold"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span className="flex items-center gap-2">
                {year}
                <span className="bg-gray-200 text-gray-600 text-[10px] px-2 py-0.5 rounded-full">
                  {list.length}
                </span>
              </span>

              <ExpandMoreIcon
                fontSize="small"
                className={`transition-transform duration-200 ${
                  collapsedYears[year] ? "-rotate-90 text-gray-400" : "rotate-0 text-blue-600"
                }`}
              />
            </button>

            <AnimatePresence initial={false}>
              {!collapsedYears[year] && (
                <motion.ul
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  {list.map((a) => (
                    <li key={a.id} className="pl-4 pr-2 py-1">
                      <button
                        onClick={() => {
                          navigate(`/act/${a.id}`);
                          if (onItemClick) onItemClick(); // Close mobile sidebar
                        }}
                        className="w-full text-left text-sm text-gray-500 hover:text-blue-600 hover:translate-x-1 transition-all truncate block py-1 border-l-2 border-transparent hover:border-blue-300 pl-3"
                        title={a.title}
                      >
                        {a.title}
                      </button>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Footer section of Sidebar */}
      <div className="p-4 border-t border-gray-100 bg-gray-50 mt-auto">
        <button
          onClick={() => {
            navigate("/compare");
            if (onItemClick) onItemClick();
          }}
          className="w-full py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium shadow-lg hover:bg-black transition-transform active:scale-95"
        >
          Compare Acts
        </button>
      </div>
    </div>
  );
};

const ActsExplorer = ({ embedded = false }) => {
  const [acts, setActs] = useState([]);
  const [filteredActs, setFilteredActs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ category: "", status: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [collapsedYears, setCollapsedYears] = useState({});
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  const navigate = useNavigate();
  const itemsPerPage = 9;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllActs();
        const normalized = data.map((a) => ({ ...a, year: a.year || "Unknown" }));
        setActs(normalized);
        setFilteredActs(normalized);
      } catch (err) {
        console.error("Error fetching acts:", err);
      }
    };
    fetchData();
  }, []);

  // Filter Logic
  useEffect(() => {
    let result = acts;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (i) =>
          i.title?.toLowerCase().includes(q) ||
          i.description?.toLowerCase().includes(q)
      );
    }
    Object.entries(filters).forEach(([key, val]) => {
      if (val) result = result.filter((i) => i[key] === val);
    });
    setFilteredActs(result);
    setCurrentPage(1);
  }, [searchTerm, filters, acts]);

  // Pagination
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredActs.slice(start, start + itemsPerPage);
  }, [filteredActs, currentPage]);

  const totalPages = Math.ceil(filteredActs.length / itemsPerPage);

  // Grouping by Year
  const actsByYear = useMemo(() => {
    const grouped = {};
    acts.forEach((a) => {
      const y = a.year;
      if (!grouped[y]) grouped[y] = [];
      grouped[y].push(a);
    });
    const sortedYears = Object.keys(grouped).sort((a, b) => Number(b) - Number(a));
    const ordered = {};
    sortedYears.forEach((y) => (ordered[y] = grouped[y]));
    return ordered;
  }, [acts]);

  const toggleYear = (year) =>
    setCollapsedYears((prev) => ({ ...prev, [year]: !prev[year] }));

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

  // Shared props for Sidebar
  const sidebarProps = {
    actsByYear,
    collapsedYears,
    toggleYear,
    setCollapsedYears,
    navigate,
  };

  return (
    <div className="flex flex-col h-screen bg-[#F3F4F6] overflow-hidden">
      
      {/* MOBILE SIDEBAR OVERLAY & DRAWER */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black z-[60] lg:hidden"
            />

            {/* Sidebar Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[85%] max-w-xs bg-white z-[70] shadow-2xl lg:hidden flex flex-col overflow-hidden"
            >
              {/* Close Button Inside Drawer */}
              <div className="absolute top-4 right-4 z-[80]">
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <CloseIcon fontSize="small" />
                </button>
              </div>

              {/* Sidebar Content Inside Mobile Drawer */}
              <SidebarContent 
                {...sidebarProps} 
                onItemClick={() => setIsMobileSidebarOpen(false)} 
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* MOBILE HEADER */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-30 relative">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <MenuIcon className="text-gray-600" />
          </button>
          <span className="font-bold text-lg tracking-tight">Acts Explorer</span>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-2 rounded ${
            showFilters ? "bg-blue-50 text-blue-600" : "text-gray-500"
          }`}
        >
          <FilterListIcon />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden lg:block w-72 h-full flex-shrink-0 z-20 shadow-sm border-r border-gray-200 bg-white">
          <SidebarContent {...sidebarProps} />
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto scroll-smooth bg-[#F3F4F6]">
          {!embedded && (
            <section className="relative h-64 md:h-80 w-full overflow-hidden flex items-center justify-center">
              <div
                className="absolute inset-0 bg-gray-900 opacity-40"
                style={{
                  backgroundImage: `url(/acts-bg.jpg)`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <div className="relative z-10 text-center px-4">
                <motion.h1
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-3xl md:text-5xl font-extrabold text-white mb-2 tracking-tight"
                >
                  Legislative Acts
                </motion.h1>
                <p className="text-gray-200 text-sm md:text-base max-w-xl mx-auto">
                  Comprehensive digital archive of all acts, regulations, and bylaws.
                </p>
              </div>
            </section>
          )}

          <div className="container mx-auto px-4 md:px-8 py-8 max-w-7xl">
            {/* Search Filter Bar */}
            <div className={`mb-8 ${!showFilters && "hidden md:block"}`}>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1">
                <SearchFilter
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  filters={filters}
                  setFilters={setFilters}
                  filterOptions={filterOptions}
                />
              </div>
            </div>

            {/* List Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                {searchTerm || filters.category || filters.status
                  ? "Search Results"
                  : "Recent Acts"}
              </h2>

              <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
                {filteredActs.length} Documents
              </span>
            </div>

            {/* Content Grid */}
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {currentItems.map((item, index) => (
                  <ActCard key={item.id} act={item} index={index} />
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Empty State */}
            {currentItems.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <MenuBookIcon style={{ fontSize: 60, opacity: 0.2 }} className="mb-4" />
                <p className="text-lg font-medium">No acts match your search.</p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilters({ category: "", status: "" });
                  }}
                  className="mt-4 text-blue-600 hover:underline"
                >
                  Clear filters
                </button>
              </div>
            )}

            {/* Pagination UI */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-12 mb-8">
                <div className="flex gap-2 bg-white p-2 rounded-lg shadow-sm border border-gray-200">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      onClick={() => setCurrentPage(n)}
                      className={`w-10 h-10 rounded-md font-medium text-sm transition-all ${
                        currentPage === n
                          ? "bg-gray-900 text-white shadow-md scale-105"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ActsExplorer;