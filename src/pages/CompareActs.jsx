import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { motion } from "framer-motion";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";

const fadeIn = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

const CompareActs = () => {
  const [acts, setActs] = useState([]);
  const [pdfs, setPdfs] = useState([]);
  const [leftItem, setLeftItem] = useState(null);
  const [rightItem, setRightItem] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [comparisonType, setComparisonType] = useState("acts"); // "acts" or "pdfs"

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch acts
        const { data: actsData, error: actsError } = await supabase.from("acts").select("*");
        if (actsError) throw actsError;
        setActs(actsData || []);

        // Fetch PDFs
        const { data: pdfsData, error: pdfsError } = await supabase.from("pdfs").select("*");
        if (pdfsError) throw pdfsError;
        setPdfs(pdfsData || []);
      } catch (error) {
        console.error("Error fetching data:", error.message);
        setError("Failed to load data");
      }
    };

    fetchData();
  }, []);

  const compareItems = async () => {
    if (!leftItem || !rightItem) {
      setError(`Please select two ${comparisonType} to compare`);
      return;
    }

    if (leftItem.id === rightItem.id) {
      setError("Please select two different items to compare");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (comparisonType === "acts") {
        // Compare acts by their content
        const differences = compareText(leftItem.content, rightItem.content);
        
        setComparison({
          left: leftItem,
          right: rightItem,
          differences,
          type: "acts",
          stats: {
            changes: differences.length,
            leftLength: leftItem.content.length,
            rightLength: rightItem.content.length
          }
        });
      } else {
        // For PDFs, we'll compare metadata since text extraction is complex
        const differences = compareMetadata(leftItem, rightItem);
        
        setComparison({
          left: leftItem,
          right: rightItem,
          differences,
          type: "pdfs",
          stats: {
            changes: differences.length
          }
        });
      }
    } catch (error) {
      console.error("Error comparing items:", error);
      setError("Failed to compare items. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Simple text comparison for acts
  const compareText = (text1, text2) => {
    // Strip HTML tags for comparison
    const stripHtml = (html) => {
      const tmp = document.createElement('DIV');
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || '';
    };
    
    const content1 = stripHtml(text1);
    const content2 = stripHtml(text2);
    
    const lines1 = content1.split('\n');
    const lines2 = content2.split('\n');
    const differences = [];
    
    const maxLines = Math.max(lines1.length, lines2.length);
    
    for (let i = 0; i < maxLines; i++) {
      const line1 = lines1[i] || '';
      const line2 = lines2[i] || '';
      
      if (line1.trim() !== line2.trim()) {
        differences.push({
          line: i + 1,
          left: line1,
          right: line2,
          type: line1 && line2 ? 'modified' : line1 ? 'removed' : 'added'
        });
      }
    }
    
    return differences;
  };

  // Compare PDF metadata
  const compareMetadata = (pdf1, pdf2) => {
    const differences = [];
    
    // Compare titles
    if (pdf1.title !== pdf2.title) {
      differences.push({
        field: "Title",
        left: pdf1.title,
        right: pdf2.title
      });
    }
    
    // Compare descriptions
    if (pdf1.description !== pdf2.description) {
      differences.push({
        field: "Description",
        left: pdf1.description,
        right: pdf2.description
      });
    }
    
    // Compare categories
    if (pdf1.category !== pdf2.category) {
      differences.push({
        field: "Category",
        left: pdf1.category,
        right: pdf2.category
      });
    }
    
    // Compare versions
    if (pdf1.version !== pdf2.version) {
      differences.push({
        field: "Version",
        left: pdf1.version,
        right: pdf2.version
      });
    }
    
    // Compare status
    if (pdf1.status !== pdf2.status) {
      differences.push({
        field: "Status",
        left: pdf1.status,
        right: pdf2.status
      });
    }
    
    return differences;
  };

  const resetComparison = () => {
    setLeftItem(null);
    setRightItem(null);
    setComparison(null);
    setError(null);
  };

  return (
    <div className="bg-[#DCDCDC] text-black min-h-screen">
      <section
        className="relative h-[40vh] flex flex-col items-center justify-center text-center"
        style={{
          backgroundImage: `url(/compare-bg.jpg)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="relative z-10 px-4"
        >
          <CompareArrowsIcon fontSize="large" className="mb-4 text-white" />
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Compare Documents
          </h1>
          <p className="text-lg text-gray-200 max-w-2xl mx-auto">
            Select two documents to see how they differ.
          </p>
        </motion.div>
      </section>

      <section className="bg-gray-50 text-black py-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-8 mb-12"
          >
            <h2 className="text-2xl font-bold mb-8 text-center">
              Select Documents to Compare
            </h2>
            
            {/* Tab Switcher */}
            <div className="flex justify-center mb-8">
              <div className="flex space-x-4 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => { setComparisonType("acts"); resetComparison(); }}
                  className={`px-4 py-2 rounded-md font-medium transition ${
                    comparisonType === "acts"
                      ? "bg-black text-white"
                      : "bg-transparent text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  <MenuBookIcon className="mr-2" />
                  Compare Acts
                </button>
                <button
                  onClick={() => { setComparisonType("pdfs"); resetComparison(); }}
                  className={`px-4 py-2 rounded-md font-medium transition ${
                    comparisonType === "pdfs"
                      ? "bg-black text-white"
                      : "bg-transparent text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  <PictureAsPdfIcon className="mr-2" />
                  Compare PDFs
                </button>
              </div>
            </div>
            
            {error && (
              <Alert severity="error" className="mb-6">
                {error}
              </Alert>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Left Document Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First {comparisonType === "acts" ? "Act" : "PDF"}
                </label>
                <select
                  value={leftItem?.id || ""}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    const items = comparisonType === "acts" ? acts : pdfs;
                    setLeftItem(items.find(item => item.id === selectedId) || null);
                  }}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-800"
                >
                  <option value="">Select a {comparisonType === "acts" ? "act" : "PDF"}</option>
                  {(comparisonType === "acts" ? acts : pdfs).map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title} {item.version && `(v${item.version})`}
                    </option>
                  ))}
                </select>
                
                {leftItem && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-md">
                    <p className="font-medium">{leftItem.title}</p>
                    <p className="text-sm text-gray-600">Version: {leftItem.version}</p>
                    {leftItem.category && <p className="text-sm text-gray-600">Category: {leftItem.category}</p>}
                    {leftItem.status && <p className="text-sm text-gray-600">Status: {leftItem.status}</p>}
                    {comparisonType === "pdfs" && (
                      <a
                        href={leftItem.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center mt-2 text-blue-600 hover:underline"
                      >
                        <PictureAsPdfIcon className="mr-1" fontSize="small" />
                        View PDF
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Right Document Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Second {comparisonType === "acts" ? "Act" : "PDF"}
                </label>
                <select
                  value={rightItem?.id || ""}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    const items = comparisonType === "acts" ? acts : pdfs;
                    setRightItem(items.find(item => item.id === selectedId) || null);
                  }}
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-800"
                >
                  <option value="">Select a {comparisonType === "acts" ? "act" : "PDF"}</option>
                  {(comparisonType === "acts" ? acts : pdfs).map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title} {item.version && `(v${item.version})`}
                    </option>
                  ))}
                </select>
                
                {rightItem && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-md">
                    <p className="font-medium">{rightItem.title}</p>
                    <p className="text-sm text-gray-600">Version: {rightItem.version}</p>
                    {rightItem.category && <p className="text-sm text-gray-600">Category: {rightItem.category}</p>}
                    {rightItem.status && <p className="text-sm text-gray-600">Status: {rightItem.status}</p>}
                    {comparisonType === "pdfs" && (
                      <a
                        href={rightItem.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center mt-2 text-blue-600 hover:underline"
                      >
                        <PictureAsPdfIcon className="mr-1" fontSize="small" />
                        View PDF
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={compareItems}
                disabled={!leftItem || !rightItem || loading}
                className="bg-black text-white px-8 py-3 rounded-md font-semibold hover:bg-gray-800 transition disabled:opacity-50 flex items-center justify-center mx-auto"
              >
                {loading ? (
                  <>
                    <CircularProgress size={20} color="inherit" className="mr-2" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <CompareArrowsIcon className="mr-2" />
                    Compare {comparisonType === "acts" ? "Acts" : "PDFs"}
                  </>
                )}
              </button>
            </div>
          </motion.div>

          {comparison && (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="max-w-6xl mx-auto"
            >
              <h2 className="text-2xl font-bold mb-6 text-center text-black">
                Comparison Results
              </h2>
              
              <div className="bg-white shadow rounded-lg p-6 mb-8">
                <h3 className="text-xl font-semibold mb-4 text-black">Comparison Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-gray-50 rounded-md">
                    <h4 className="font-semibold mb-2">{comparison.left.title}</h4>
                    <p className="text-sm text-gray-600">Version: {comparison.left.version}</p>
                    {comparison.left.category && <p className="text-sm text-gray-600">Category: {comparison.left.category}</p>}
                    {comparison.left.status && <p className="text-sm text-gray-600">Status: {comparison.left.status}</p>}
                    {comparison.type === "pdfs" && (
                      <a
                        href={comparison.left.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center mt-2 text-blue-600 hover:underline"
                      >
                        <PictureAsPdfIcon className="mr-1" fontSize="small" />
                        View PDF
                      </a>
                    )}
                  </div>
                  <div className="p-4 bg-gray-50 rounded-md">
                    <h4 className="font-semibold mb-2">{comparison.right.title}</h4>
                    <p className="text-sm text-gray-600">Version: {comparison.right.version}</p>
                    {comparison.right.category && <p className="text-sm text-gray-600">Category: {comparison.right.category}</p>}
                    {comparison.right.status && <p className="text-sm text-gray-600">Status: {comparison.right.status}</p>}
                    {comparison.type === "pdfs" && (
                      <a
                        href={comparison.right.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center mt-2 text-blue-600 hover:underline"
                      >
                        <PictureAsPdfIcon className="mr-1" fontSize="small" />
                        View PDF
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {comparison.differences.length > 0 ? (
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-4 text-black">
                    {comparison.type === "acts" ? "Content Differences" : "Metadata Differences"}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Found {comparison.differences.length} differences between the documents.
                  </p>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {comparison.type === "acts" ? (
                            <>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Line
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                First Document Content
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Second Document Content
                              </th>
                            </>
                          ) : (
                            <>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Field
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                First PDF Value
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Second PDF Value
                              </th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {comparison.differences.slice(0, 10).map((diff, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            {comparison.type === "acts" ? (
                              <>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {diff.line}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900 bg-red-100">
                                  {diff.left}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900 bg-green-100">
                                  {diff.right}
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {diff.field}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900 bg-red-100">
                                  {diff.left}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900 bg-green-100">
                                  {diff.right}
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {comparison.differences.length > 10 && (
                    <p className="mt-4 text-gray-600 text-sm">
                      Showing first 10 differences. Total differences: {comparison.differences.length}
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-white shadow rounded-lg p-6 text-center">
                  <h3 className="text-xl font-semibold mb-2 text-black">No Differences Found</h3>
                  <p className="text-gray-600">
                    {comparison.type === "acts" 
                      ? "The content of both acts appears to be identical." 
                      : "The metadata of both PDFs appears to be identical."
                    }
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
};

export default CompareActs;