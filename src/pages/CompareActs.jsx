import React, { useState, useEffect } from "react";
import { getAllActs } from "../utils/firebaseUtils";
import { motion } from "framer-motion";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";

const fadeIn = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

const CompareActs = () => {
  const [acts, setActs] = useState([]);
  const [leftAct, setLeftAct] = useState("");
  const [rightAct, setRightAct] = useState("");
  const [leftVersion, setLeftVersion] = useState("");
  const [rightVersion, setRightVersion] = useState("");
  const [comparison, setComparison] = useState(null);

  useEffect(() => {
    const fetchActs = async () => {
      try {
        const actsData = await getAllActs();
        setActs(actsData);
      } catch (error) {
        console.error("Error fetching acts:", error);
      }
    };

    fetchActs();
  }, []);

  const handleCompare = () => {
    setComparison({
      left: { title: leftAct, version: leftVersion || "Latest" },
      right: { title: rightAct, version: rightVersion || "Latest" },
    });
  };

  return (
    <div className="bg-[#DCDCDC] text-white min-h-screen">
      {/* Hero Section */}
      <section
        className="relative h-[50vh] flex flex-col items-center justify-center text-center"
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
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Compare Acts</h1>
          <p className="text-lg text-gray-200 max-w-2xl mx-auto">
            Select two acts and their versions to see how they differ.
          </p>
        </motion.div>
      </section>

      {/* Compare Form */}
      <section className="bg-gray-50 text-black py-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-8"
          >
            <h2 className="text-2xl font-bold mb-8 text-center">
              Select Acts to Compare
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Left Act */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Left Act
                </label>
                <select
                  value={leftAct}
                  onChange={(e) => setLeftAct(e.target.value)}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select an act</option>
                  {acts.map((act) => (
                    <option key={act.id} value={act.title}>
                      {act.title}
                    </option>
                  ))}
                </select>
                {leftAct && (
                  <>
                    <label className="block text-sm font-medium text-gray-700 mt-4">
                      Version
                    </label>
                    <select
                      value={leftVersion}
                      onChange={(e) => setLeftVersion(e.target.value)}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Latest</option>
                      {/* Map through versions of selected act here */}
                    </select>
                  </>
                )}
              </div>

              {/* Right Act */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Right Act
                </label>
                <select
                  value={rightAct}
                  onChange={(e) => setRightAct(e.target.value)}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select an act</option>
                  {acts.map((act) => (
                    <option key={act.id} value={act.title}>
                      {act.title}
                    </option>
                  ))}
                </select>
                {rightAct && (
                  <>
                    <label className="block text-sm font-medium text-gray-700 mt-4">
                      Version
                    </label>
                    <select
                      value={rightVersion}
                      onChange={(e) => setRightVersion(e.target.value)}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Latest</option>
                      {/* Map through versions of selected act here */}
                    </select>
                  </>
                )}
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={handleCompare}
                disabled={!leftAct || !rightAct}
                className="bg-black text-white px-6 py-3 rounded-md font-semibold hover:bg-gray-800 transition disabled:opacity-50"
              >
                Compare
              </button>
            </div>
          </motion.div>

          {/* Comparison Result */}
          {comparison && (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="mt-12 max-w-4xl mx-auto"
            >
              <h2 className="text-2xl font-bold mb-6 text-center text-black">
                Comparison Result
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-2 text-black">
                    {comparison.left.title}
                  </h3>
                  <p className="text-gray-700 mb-4">
                    Version: {comparison.left.version}
                  </p>
                  <button
                    className="bg-[#FFD100] text-black px-4 py-2 rounded-md font-semibold hover:bg-yellow-400 transition"
                  >
                    View Details
                  </button>
                </div>
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-2 text-black">
                    {comparison.right.title}
                  </h3>
                  <p className="text-gray-700 mb-4">
                    Version: {comparison.right.version}
                  </p>
                  <button
                    className="bg-[#FFD100] text-black px-4 py-2 rounded-md font-semibold hover:bg-yellow-400 transition"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
};

export default CompareActs;