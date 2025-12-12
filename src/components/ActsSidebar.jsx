import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getAllActs } from "../utils/supabaseUtils";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import DescriptionIcon from "@mui/icons-material/Description";

const ActsSidebar = ({ isOpen, onClose, currentActId, onSelectAct }) => {
  const [acts, setActs] = useState([]);
  const [groupedActs, setGroupedActs] = useState({});
  const [expandedYears, setExpandedYears] = useState([]);
  const [expandedVersions, setExpandedVersions] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActs();
  }, []);

  useEffect(() => {
    if (currentActId && acts.length > 0) {
      const currentAct = acts.find(act => act.id === currentActId);
      if (currentAct) {
        const year = currentAct.year || new Date(currentAct.created_at).getFullYear();
        // Auto-expand current year and version
        setExpandedYears(prev => [...new Set([...prev, year])]);
        
        const versionPrefix = currentAct.version.split('.')[0];
        setExpandedVersions(prev => ({
          ...prev,
          [year]: [...new Set([...(prev[year] || []), versionPrefix])]
        }));
      }
    }
  }, [currentActId, acts]);

  const fetchActs = async () => {
    try {
      const actsData = await getAllActs();
      setActs(actsData || []);
      groupActsByYear(actsData || []);
    } catch (error) {
      console.error("Error fetching acts:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const groupActsByYear = (actsData) => {
    const grouped = {};
    
    actsData.forEach(act => {
      const year = act.year || new Date(act.created_at).getFullYear();
      if (!grouped[year]) {
        grouped[year] = {};
      }
      
      // Group by version number (major.minor)
      const versionPrefix = act.version.split('.')[0];
      if (!grouped[year][versionPrefix]) {
        grouped[year][versionPrefix] = [];
      }
      
      grouped[year][versionPrefix].push(act);
    });
    
    setGroupedActs(grouped);
  };

  const toggleYear = (year) => {
    if (expandedYears.includes(year)) {
      setExpandedYears(expandedYears.filter(y => y !== year));
      // Also collapse all versions for this year
      setExpandedVersions(prev => {
        const newVersions = { ...prev };
        delete newVersions[year];
        return newVersions;
      });
    } else {
      setExpandedYears([...expandedYears, year]);
    }
  };

  const toggleVersion = (year, versionPrefix) => {
    const key = `${year}-${versionPrefix}`;
    setExpandedVersions(prev => {
      const yearVersions = prev[year] || [];
      if (yearVersions.includes(versionPrefix)) {
        return {
          ...prev,
          [year]: yearVersions.filter(v => v !== versionPrefix)
        };
      } else {
        return {
          ...prev,
          [year]: [...yearVersions, versionPrefix]
        };
      }
    });
  };

  const getVersionBadgeColor = (version) => {
    const num = parseInt(version);
    if (num >= 10) return "bg-purple-500 text-white";
    if (num >= 5) return "bg-blue-500 text-white";
    if (num >= 2) return "bg-green-500 text-white";
    return "bg-yellow-500 text-white";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800";
      case "Draft": return "bg-yellow-100 text-yellow-800";
      case "Archived": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="w-64 bg-white border-r border-gray-200 h-screen p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 shadow-lg z-40 overflow-y-auto"
        >
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MenuBookIcon className="text-gray-700" />
                <h2 className="text-lg font-semibold text-gray-800">Acts Explorer</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-md hover:bg-gray-100 text-gray-500"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-600">
              {acts.length} acts organized by year and version
            </p>
          </div>

          <div className="p-4">
            {Object.keys(groupedActs)
              .sort((a, b) => b - a)
              .map(year => (
                <div key={year} className="mb-4">
                  <button
                    onClick={() => toggleYear(year)}
                    className="flex items-center justify-between w-full text-left p-2 rounded-lg hover:bg-gray-50 mb-1 group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">
                        {year}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {Object.keys(groupedActs[year]).length} versions
                      </span>
                    </div>
                    {expandedYears.includes(year) ? (
                      <ExpandLessIcon className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                    ) : (
                      <ExpandMoreIcon className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                    )}
                  </button>
                  
                  <AnimatePresence>
                    {expandedYears.includes(year) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="ml-2 border-l-2 border-gray-200 pl-3 space-y-3"
                      >
                        {Object.keys(groupedActs[year])
                          .sort((a, b) => b - a)
                          .map(versionPrefix => (
                            <div key={versionPrefix}>
                              <button
                                onClick={() => toggleVersion(year, versionPrefix)}
                                className="flex items-center justify-between w-full text-left p-2 rounded hover:bg-gray-50 mb-1 group"
                              >
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs px-2 py-1 rounded-full ${getVersionBadgeColor(versionPrefix)}`}>
                                    v{versionPrefix}.x
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {groupedActs[year][versionPrefix].length} act(s)
                                  </span>
                                </div>
                                {expandedVersions[year]?.includes(versionPrefix) ? (
                                  <ExpandLessIcon className="w-3 h-3 text-gray-400" />
                                ) : (
                                  <ExpandMoreIcon className="w-3 h-3 text-gray-400" />
                                )}
                              </button>
                              
                              <AnimatePresence>
                                {expandedVersions[year]?.includes(versionPrefix) && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="ml-2 border-l border-gray-100 pl-3 space-y-1"
                                  >
                                    {groupedActs[year][versionPrefix]
                                      .sort((a, b) => b.version.localeCompare(a.version))
                                      .map(act => (
                                        <button
                                          key={act.id}
                                          onClick={() => onSelectAct && onSelectAct(act)}
                                          className={`block w-full text-left p-2 rounded text-sm transition-all ${
                                            act.id === currentActId
                                              ? "bg-blue-50 text-blue-700 border-l-2 border-blue-500"
                                              : "text-gray-700 hover:bg-gray-50 hover:border-l-2 hover:border-gray-300"
                                          }`}
                                        >
                                          <div className="flex items-start gap-2">
                                            <DescriptionIcon className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
                                            <div className="flex-1 min-w-0">
                                              <div className="flex items-center justify-between">
                                                <span className="font-medium truncate">{act.title}</span>
                                                <span className="text-xs bg-gray-100 px-1 rounded ml-2 flex-shrink-0">
                                                  {act.version}
                                                </span>
                                              </div>
                                              {act.category && (
                                                <div className="flex items-center gap-1 mt-1">
                                                  <span className={`text-xs px-1.5 py-0.5 rounded ${getStatusColor(act.status)}`}>
                                                    {act.status}
                                                  </span>
                                                  <span className="text-xs text-gray-500 truncate">
                                                    {act.category}
                                                  </span>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </button>
                                      ))}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            
            {Object.keys(groupedActs).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <MenuBookIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No acts found</p>
              </div>
            )}
          </div>

          {/* Quick Stats Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center">
                <div className="font-semibold text-gray-700">{acts.length}</div>
                <div className="text-gray-500">Total Acts</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-700">
                  {acts.filter(a => a.status === "Active").length}
                </div>
                <div className="text-gray-500">Active</div>
              </div>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

export default ActsSidebar;