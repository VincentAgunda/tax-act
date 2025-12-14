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

/* ======================================================
   SIDEBAR CONTENT (IOS SAFE)
====================================================== */
const SidebarContent = ({
  actsByYear,
  collapsedYears,
  toggleYear,
  setCollapsedYears,
  navigate,
  onItemClick,
}) => {
  const allCollapsed = Object.values(collapsedYears).every(Boolean);

  return (
    <div className="flex flex-col h-full bg-white w-full relative z-10">
      {/* Header */}
      <div className="shrink-0 p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-20">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <MenuBookIcon className="text-blue-600" fontSize="small" />
          Directory
        </h3>

        <button
          onClick={() => {
            const next = {};
            Object.keys(actsByYear).forEach((y) => (next[y] = !allCollapsed));
            setCollapsedYears(next);
          }}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
        >
          {allCollapsed ? "Expand All" : "Collapse All"}
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {Object.entries(actsByYear).map(([year, list]) => (
          <div key={year}>
            <button
              onClick={() => toggleYear(year)}
              className={`w-full flex items-center justify-between p-3 rounded-lg text-sm ${
                !collapsedYears[year]
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span className="flex items-center gap-2">
                {year}
                <span className="text-[10px] px-2 py-0.5 rounded-full border bg-white">
                  {list.length}
                </span>
              </span>

              <ExpandMoreIcon
                fontSize="small"
                className={`transition-transform ${
                  collapsedYears[year]
                    ? "-rotate-90 text-gray-400"
                    : "rotate-0 text-blue-600"
                }`}
              />
            </button>

            <AnimatePresence initial={false}>
              {!collapsedYears[year] && (
                <motion.ul
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  {list.map((a) => (
                    <li key={a.id} className="pl-4 py-1">
                      <button
                        onClick={() => {
                          navigate(`/act/${a.id}`);
                          onItemClick?.();
                        }}
                        className="block w-full text-left text-sm text-gray-600 hover:text-blue-600 truncate py-2 border-l-2 border-transparent hover:border-blue-400 pl-3"
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

      {/* Footer */}
      <div className="shrink-0 p-4 border-t bg-gray-50">
        <button
          onClick={() => {
            navigate("/compare");
            onItemClick?.();
          }}
          className="w-full py-3 rounded-lg bg-gray-900 text-white text-sm hover:bg-black"
        >
          Compare Acts
        </button>
      </div>
    </div>
  );
};

/* ======================================================
   MAIN EXPLORER
====================================================== */
const ActsExplorer = ({ embedded = false }) => {
  const [acts, setActs] = useState([]);
  const [filteredActs, setFilteredActs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ category: "", status: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [collapsedYears, setCollapsedYears] = useState({});
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Set default filter visibility (True for desktop, False for mobile logic if needed, currently True)
  const [showFilters, setShowFilters] = useState(true);

  const navigate = useNavigate();
  const itemsPerPage = 9;

  useEffect(() => {
    getAllActs().then((data) => {
      const normalized = data.map((a) => ({ ...a, year: a.year || "Unknown" }));
      setActs(normalized);
      setFilteredActs(normalized);
    });
  }, []);

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
    Object.entries(filters).forEach(([k, v]) => {
      if (v) result = result.filter((i) => i[k] === v);
    });
    setFilteredActs(result);
    setCurrentPage(1);
  }, [searchTerm, filters, acts]);

  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredActs.slice(start, start + itemsPerPage);
  }, [filteredActs, currentPage]);

  const totalPages = Math.ceil(filteredActs.length / itemsPerPage);

  const actsByYear = useMemo(() => {
    const g = {};
    acts.forEach((a) => {
      if (!g[a.year]) g[a.year] = [];
      g[a.year].push(a);
    });
    return Object.fromEntries(
      Object.keys(g)
        .sort((a, b) => Number(b) - Number(a))
        .map((y) => [y, g[y]])
    );
  }, [acts]);

  const sidebarProps = {
    actsByYear,
    collapsedYears,
    toggleYear: (y) =>
      setCollapsedYears((p) => ({ ...p, [y]: !p[y] })),
    setCollapsedYears,
    navigate,
  };

  return (
    <div className="flex flex-col h-screen bg-[#F3F4F6] lg:overflow-hidden">
      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden isolate">
            {/* BACKDROP – NO BLUR (IOS FIX) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSidebarOpen(false)}
              className="absolute inset-0 bg-black/60"
            />

            {/* DRAWER */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              className="absolute inset-y-0 left-0 w-80 max-w-[85vw] bg-white shadow-2xl flex flex-col z-[110]"
            >
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="absolute top-4 -right-12 p-2 bg-white rounded-full shadow-lg"
              >
                <CloseIcon fontSize="small" />
              </button>

              <SidebarContent
                {...sidebarProps}
                onItemClick={() => setIsMobileSidebarOpen(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MOBILE HEADER */}
      <header className="lg:hidden bg-white border-b px-4 py-3 flex justify-between items-center sticky top-0 z-40">
        <button onClick={() => setIsMobileSidebarOpen(true)} className="p-1">
          <MenuIcon className="text-gray-700" />
        </button>
        
        <h1 className="text-lg font-bold text-gray-800">Explorer</h1>

        <button 
          onClick={() => setShowFilters((s) => !s)} 
          className={`p-1 transition-colors ${showFilters ? 'text-blue-600 bg-blue-50 rounded-md' : 'text-gray-600'}`}
        >
          <FilterListIcon />
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden lg:block w-72 border-r bg-white">
          <SidebarContent {...sidebarProps} />
        </aside>

        {/* MAIN */}
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
          <div className="container mx-auto px-4 py-8 max-w-6xl">
            
            {/* FILTER SECTION WITH ANIMATION */}
            <AnimatePresence initial={false}>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                  animate={{ height: "auto", opacity: 1, marginBottom: 24 }}
                  exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <SearchFilter
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    filters={filters}
                    setFilters={setFilters}
                    filterOptions={[
                      {
                        type: "category",
                        label: "Categories",
                        values: [
                          "Income Tax",
                          "Corporate Tax",
                          "Property Tax",
                          "Sales Tax",
                        ],
                      },
                      {
                        type: "status",
                        label: "Status",
                        values: ["Active", "Draft", "Archived"],
                      },
                    ]}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* RESULTS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {currentItems.map((a, i) => (
                <ActCard key={a.id} act={a} index={i} />
              ))}
            </div>
            
            {/* EMPTY STATE */}
            {currentItems.length === 0 && (
                <div className="text-center py-20 text-gray-500">
                    <p>No acts found matching your criteria.</p>
                </div>
            )}

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-10 gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => setCurrentPage(n)}
                    className={`w-9 h-9 rounded-md text-sm font-semibold transition-colors ${
                      currentPage === n
                        ? "bg-blue-600 text-white"
                        : "bg-white border hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ActsExplorer;