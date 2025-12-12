import React, { useState, useEffect, useMemo, useCallback } from "react";
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

// --- Constants ---
const ITEMS_PER_PAGE = 9;
const FILTER_OPTIONS = [
  { type: "category", label: "Categories", values: ["Income Tax", "Corporate Tax", "Property Tax", "Sales Tax"] },
  { type: "status", label: "Status", values: ["Active", "Draft", "Archived"] },
];

/**
 * OPTIMIZATION: SidebarContent extracted and Memoized.
 * It is defined outside the main component so it is not recreated on every render.
 * React.memo prevents it from re-rendering unless its specific props change.
 */
const SidebarContent = React.memo(({ 
  actsByYear, 
  collapsedYears, 
  toggleYear, 
  setCollapsedYears, 
  navigate, 
  onLinkClick 
}) => {
  
  const handleToggleAll = useCallback(() => {
      const allCollapsed = Object.values(collapsedYears).every(Boolean);
      const newState = {};
      Object.keys(actsByYear).forEach((k) => (newState[k] = !allCollapsed));
      setCollapsedYears(newState);
  }, [actsByYear, collapsedYears, setCollapsedYears]);

  const handleLinkClick = useCallback((id) => {
      navigate(`/act/${id}`);
      if (onLinkClick) onLinkClick();
  }, [navigate, onLinkClick]);

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 text-gray-800">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
        <h3 className="font-bold flex items-center gap-2">
          <MenuBookIcon className="text-blue-600" fontSize="small" />
          Directory
        </h3>
        <button 
            onClick={handleToggleAll}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
        >
            Toggle All
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
        {Object.entries(actsByYear).map(([year, list]) => (
          <div key={year} className="group">
            <button
              onClick={() => toggleYear(year)}
              className={`w-full flex items-center justify-between p-3 rounded-lg text-sm transition-colors ${
                !collapsedYears[year] ? "bg-gray-50 text-blue-700 font-semibold" : "text-gray-600 hover:bg-gray-50"
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
                className={`transition-transform duration-200 ${collapsedYears[year] ? "-rotate-90 text-gray-400" : "rotate-0 text-blue-600"}`}
              />
            </button>

            <AnimatePresence>
              {!collapsedYears[year] && (
                <motion.ul
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  {list.map((a) => (
                    <li key={a.id} className="pl-4 pr-2 py-1">
                      <button
                        onClick={() => handleLinkClick(a.id)}
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
        {Object.keys(actsByYear).length === 0 && (
           <div className="text-center py-10 text-gray-400 text-sm">No acts found</div>
        )}
      </div>
      
      {/* Bottom Action Area */}
      <div className="p-4 border-t border-gray-100 bg-gray-50 mt-auto">
        <button
            onClick={() => navigate("/compare")}
            className="w-full py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium shadow-lg shadow-gray-300/50 hover:bg-black transition-transform active:scale-95"
        >
            Compare Acts
        </button>
      </div>
    </div>
  );
});


const ActsExplorer = ({ embedded = false }) => {
  const navigate = useNavigate();

  // Data States
  const [acts, setActs] = useState([]);
  // OPTIMIZATION: Removed filteredActs state to prevent double renders. 
  // Filtering is now done via useMemo below.
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ category: "", status: "" });
  
  // UI States
  const [currentPage, setCurrentPage] = useState(1);
  const [collapsedYears, setCollapsedYears] = useState({});
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  // --- Fetching Logic ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const actsData = await getAllActs();
        // Normalize data once on fetch
        const normalized = actsData.map((a) => ({ ...a, year: a.year || "Unknown" }));
        setActs(normalized);
      } catch (error) {
        console.error("Error fetching acts:", error);
      }
    };
    fetchData();
  }, []);

  // --- OPTIMIZATION: Filtering Logic via useMemo ---
  // Calculates filtered results during render, avoiding extra state updates.
  const filteredActs = useMemo(() => {
    let result = acts;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          item.title?.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q)
      );
    }
    Object.entries(filters).forEach(([key, value]) => {
      if (value) result = result.filter((item) => item[key] === value);
    });
    return result;
  }, [acts, searchTerm, filters]);

  // Reset page when filters change
  useEffect(() => {
      setCurrentPage(1);
  }, [searchTerm, filters]);


  // --- Pagination Logic ---
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredActs.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredActs, currentPage]);

  const totalPages = Math.ceil(filteredActs.length / ITEMS_PER_PAGE);
  
  // Memoize pagination buttons to avoid regenerating array on every render
  const paginationButtons = useMemo(() => {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
  }, [totalPages]);


  // --- Grouping Logic ---
  const actsByYear = useMemo(() => {
    const grouped = {};
    acts.forEach((a) => {
      // Use the normalized year from fetch
      if (!grouped[a.year]) grouped[a.year] = [];
      grouped[a.year].push(a);
    });
    
    // Simplified sorting: numerical descending, then string descending for non-numbers
    const sortedKeys = Object.keys(grouped).sort((a, b) => {
        const numA = parseInt(a);
        const numB = parseInt(b);
        if (!isNaN(numA) && !isNaN(numB)) return numB - numA;
        return b.localeCompare(a);
    });

    const ordered = {};
    sortedKeys.forEach((k) => (ordered[k] = grouped[k]));
    return ordered;
  }, [acts]);

  const toggleYear = useCallback((year) =>
    setCollapsedYears((s) => ({ ...s, [year]: !s[year] })), []);

  const closeMobileSidebar = useCallback(() => setIsMobileSidebarOpen(false), []);


  return (
    <div className="flex flex-col h-screen bg-[#F3F4F6] overflow-hidden text-gray-800">
      
      {/* --- Mobile Header --- */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-30 relative">
        <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileSidebarOpen(true)} className="p-1 hover:bg-gray-100 rounded" aria-label="Open sidebar">
                <MenuIcon className="text-gray-600" />
            </button>
            <span className="font-bold text-lg tracking-tight">Acts Explorer</span>
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className={`p-2 rounded transition-colors ${showFilters ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`} aria-label="Toggle filters">
            <FilterListIcon />
        </button>
      </div>

      {/* --- Main Layout --- */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Desktop Sidebar (Hidden on Mobile) */}
        <aside className="hidden lg:block w-72 h-full flex-shrink-0 z-20 shadow-sm relative">
          <SidebarContent 
             actsByYear={actsByYear}
             collapsedYears={collapsedYears}
             toggleYear={toggleYear}
             setCollapsedYears={setCollapsedYears}
             navigate={navigate}
          />
        </aside>

        {/* Mobile Sidebar (Drawer) - OPTIMIZED ANIMATION */}
        <AnimatePresence>
          {isMobileSidebarOpen && (
            <>
              {/* Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }} // Faster fade for clarity
                onClick={closeMobileSidebar}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              />
              
              {/* Drawer */}
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                // Using a slightly tighter spring for a cleaner "snap" close
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed inset-y-0 left-0 w-4/5 max-w-xs z-50 shadow-2xl lg:hidden overflow-hidden h-full"
              >
                {/* Close button inside drawer area */}
                <div className="absolute top-2 right-2 z-10">
                    <button onClick={closeMobileSidebar} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors" aria-label="Close sidebar">
                        <CloseIcon fontSize="small" className="text-gray-600" />
                    </button>
                </div>
                {/* Pass callback to close sidebar on link click */}
                <SidebarContent 
                   actsByYear={actsByYear}
                   collapsedYears={collapsedYears}
                   toggleYear={toggleYear}
                   setCollapsedYears={setCollapsedYears}
                   navigate={navigate}
                   onLinkClick={closeMobileSidebar}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* --- Main Scrollable Content Area --- */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative scroll-smooth bg-[#F3F4F6]">
            
            {/* Hero Section */}
            {!embedded && (
                <section className="relative h-64 md:h-80 w-full overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 bg-gray-900" style={{ backgroundImage: `url(/acts-bg.jpg)`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.4 }} />
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
                
                {/* Search & Filters Container */}
                {/* Used Framer Motion here for smoother mobile toggle */}
                <AnimatePresence initial={false}>
                    {(showFilters || window.innerWidth >= 768) && (
                        <motion.div 
                            initial={window.innerWidth < 768 ? { height: 0, opacity: 0, marginBottom: 0 } : false}
                            animate={{ height: "auto", opacity: 1, marginBottom: 32 }}
                            exit={window.innerWidth < 768 ? { height: 0, opacity: 0, marginBottom: 0 } : false}
                            className="overflow-hidden"
                        >
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 p-1">
                                <SearchFilter
                                    searchTerm={searchTerm}
                                    setSearchTerm={setSearchTerm}
                                    filters={filters}
                                    setFilters={setFilters}
                                    filterOptions={FILTER_OPTIONS}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Results Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">
                        {searchTerm || filters.category || filters.status ? "Search Results" : "Recent Acts"}
                    </h2>
                    <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200 font-medium">
                        {filteredActs.length} Documents
                    </span>
                </div>

                {/* Grid */}
                <motion.div
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 relative z-0"
                >
                    <AnimatePresence>
                        {currentItems.map((item, index) => (
                            <ActCard key={item.id} act={item} index={index} />
                        ))}
                    </AnimatePresence>
                </motion.div>

                {/* Empty State */}
                {currentItems.length === 0 && (
                    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <MenuBookIcon style={{ fontSize: 60, opacity: 0.2 }} className="mb-4"/>
                        <p className="text-lg font-medium">No acts match your search.</p>
                        <button 
                            onClick={() => {setSearchTerm(""); setFilters({ category: "", status: "" })}}
                            className="mt-4 text-blue-600 hover:underline font-medium"
                        >
                            Clear filters
                        </button>
                    </motion.div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center mt-12 mb-8">
                        <div className="flex gap-2 bg-white p-2 rounded-lg shadow-sm border border-gray-200">
                            {paginationButtons.map((number) => (
                                <button
                                    key={number}
                                    onClick={() => setCurrentPage(number)}
                                    className={`w-10 h-10 rounded-md font-medium text-sm transition-all ${
                                        currentPage === number
                                            ? "bg-gray-900 text-white shadow-md transform scale-105"
                                            : "text-gray-600 hover:bg-gray-100"
                                    }`}
                                >
                                    {number}
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