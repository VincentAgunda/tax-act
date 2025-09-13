import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "../supabaseClient";
import { motion } from "framer-motion";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";

// ✅ PDF.js for text extraction (Vite-friendly import)
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker?url";
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const fadeIn = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

// 📌 Extract text from PDF file_url
const extractPdfText = async (url) => {
  const loadingTask = pdfjsLib.getDocument(url);
  const pdf = await loadingTask.promise;
  let text = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map((item) => item.str);
    text += strings.join(" ") + "\n";
  }

  return text;
};

// ✨ FUNCTIONAL: Calls the Google Gemini Generative AI API
const callGenerativeAiApi = async (context, question) => {
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;

  if (!API_KEY) {
    throw new Error("API key is missing. Please add VITE_GEMINI_API_KEY to your .env.local file.");
  }

  // ✅ UPDATED PROMPT: Instructs the AI to handle one or two documents.
  const prompt = `
    Based *only* on the content of the document or documents provided below, please give a clear and direct answer to the following question.
    If two documents are provided, your answer should synthesize information from both. If only one is provided, base your answer solely on that one.
    If the answer cannot be found within the provided text, state that the information is not available in the document(s). Do not use any outside knowledge.

    --- DOCUMENT CONTEXT START ---
    ${context}
    --- DOCUMENT CONTEXT END ---

    QUESTION: "${question}"

    ANSWER:
  `;

  const payload = {
    contents: [
      {
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error:", errorData);
      throw new Error(`API request failed with status ${response.status}: ${errorData.error.message}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.error("No text found in API response:", data);
      return "The AI model did not return a valid response. Please check the console for details.";
    }

    return text;

  } catch (error) {
    console.error("Error calling Generative AI API:", error);
    return `An error occurred while contacting the AI service: ${error.message}`;
  }
};


// 📌 Strip HTML tags
const stripHtml = (html) => {
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

// 📌 Compare text line by line
const compareText = (text1, text2) => {
  const lines1 = stripHtml(text1).split("\n");
  const lines2 = stripHtml(text2).split("\n");
  const maxLines = Math.max(lines1.length, lines2.length);
  return Array.from({ length: maxLines }, (_, i) => {
    const l1 = lines1[i] || "";
    const l2 = lines2[i] || "";
    if (l1.trim() !== l2.trim()) {
      return { line: i + 1, left: l1, right: l2 };
    }
    return null;
  }).filter(Boolean);
};

// 📌 Compare PDF metadata fields
const compareMetadata = (pdf1, pdf2) => {
  const fields = ["title", "description", "category", "version", "status"];
  return fields
    .filter((f) => pdf1[f] !== pdf2[f])
    .map((f) => ({
      field: f.charAt(0).toUpperCase() + f.slice(1),
      left: pdf1[f],
      right: pdf2[f],
    }));
};

// 📌 Component for showing document details
const DocumentDetails = ({ item, type }) => {
  if (!item) return null;

  return (
    <div className="mt-4 p-3 bg-[#d6d8e0] rounded-md">
      <p className="font-medium">{item.title}</p>
      {item.version && <p className="text-sm text-gray-600">Version: {item.version}</p>}
      {item.category && <p className="text-sm text-gray-600">Category: {item.category}</p>}
      {item.status && <p className="text-sm text-gray-600">Status: {item.status}</p>}
      {type === "pdfs" && (
        <a
          href={item.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center mt-2 text-blue-600 hover:underline"
        >
          <PictureAsPdfIcon className="mr-1" fontSize="small" />
          View PDF
        </a>
      )}
    </div>
  );
};

// 📌 Component for rendering comparison table
const ComparisonTable = ({ comparison }) => {
  const [showAll, setShowAll] = useState(false);
  const diffsToShow = showAll ? comparison.differences : comparison.differences.slice(0, 10);

  return (
    <div className="bg-[#f4f3ef] shadow rounded-lg p-6">
      <h3 className="text-xl font-semibold mb-4 text-black">
        {comparison.type === "acts" ? "Content Differences" : "PDF Differences"}
      </h3>
      <p className="text-gray-600 mb-6">
        Found {comparison.differences.length} differences between the documents.
      </p>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#cacfd8]">
          <thead className="bg-[#d6d8e0]">
            <tr>
              {comparison.type === "acts" || comparison.type === "pdf-text" ? (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Line</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">First Document</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Second Document</th>
                </>
              ) : (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Field</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">First PDF</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Second PDF</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-[#cacfd8]">
            {diffsToShow.map((diff, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-[#f4f3ef]"}>
                {comparison.type === "acts" || comparison.type === "pdf-text" ? (
                  <>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{diff.line}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 bg-red-100">{diff.left}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 bg-green-100">{diff.right}</td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{diff.field}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 bg-red-100">{diff.left}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 bg-green-100">{diff.right}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {comparison.differences.length > 10 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-4 text-sm text-blue-600 hover:underline"
        >
          {showAll ? "Show Less" : `Show All (${comparison.differences.length})`}
        </button>
      )}
    </div>
  );
};

// ✅ MODIFIED Component for AI-powered PDF Analysis (Handles 1 or 2 PDFs)
const AiPdfAnalyzer = ({ pdfs }) => {
  const [selectedPdf1, setSelectedPdf1] = useState(null);
  const [selectedPdf2, setSelectedPdf2] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAsk = async () => {
    if (!selectedPdf1) {
      setError("Please select at least one PDF document to analyze.");
      return;
    }
    if (selectedPdf1 && selectedPdf2 && selectedPdf1.id === selectedPdf2.id) {
      setError("Please select two different PDF documents if you wish to compare them.");
      return;
    }
    if (!question.trim()) {
      setError("Please enter a question.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnswer("");

    try {
      // 1. Extract text from the first PDF
      const pdfText1 = await extractPdfText(selectedPdf1.file_url);
      let combinedContext = `
        --- DOCUMENT 1: ${selectedPdf1.title} (Version: ${selectedPdf1.version || 'N/A'}) START ---
        ${pdfText1}
        --- DOCUMENT 1 END ---
      `;

      // 2. If a second PDF is selected, extract its text and add it to the context
      if (selectedPdf2) {
        const pdfText2 = await extractPdfText(selectedPdf2.file_url);
        combinedContext += `
          \n--- DOCUMENT 2: ${selectedPdf2.title} (Version: ${selectedPdf2.version || 'N/A'}) START ---
          ${pdfText2}
          --- DOCUMENT 2 END ---
        `;
      }

      // 3. Call the generative AI with the context and question
      const aiResponse = await callGenerativeAiApi(combinedContext, question);
      setAnswer(aiResponse);

    } catch (err) {
      setError("An error occurred while analyzing the document(s). Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeIn}
      className="max-w-4xl mx-auto"
    >
      <div className="bg-[#f4f3ef] shadow-md rounded-lg p-8 mb-12">
        <h2 className="text-2xl font-bold mb-8 text-center">
          Ask a Question About Your PDF(s)
        </h2>

        {error && <Alert severity="error" className="mb-6">{error}</Alert>}

        <div className="space-y-6">
          {/* Selector for the First PDF */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              1. Select First PDF Document
            </label>
            <select
              value={selectedPdf1?.id || ""}
              onChange={(e) => {
                const pdf = pdfs.find((p) => p.id === e.target.value);
                setSelectedPdf1(pdf);
              }}
              className="block w-full p-3 border border-[#cacfd8] rounded-md focus:ring-2 focus:ring-gray-800 bg-white"
            >
              <option value="">Select a PDF</option>
              {pdfs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} {p.version && `(v${p.version})`}
                </option>
              ))}
            </select>
            <DocumentDetails item={selectedPdf1} type="pdfs" />
          </div>

          {/* Selector for the Second PDF */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              2. Select Second PDF Document (Optional)
            </label>
            <select
              value={selectedPdf2?.id || ""}
              onChange={(e) => {
                const pdf = pdfs.find((p) => p.id === e.target.value);
                setSelectedPdf2(pdf);
              }}
              className="block w-full p-3 border border-[#cacfd8] rounded-md focus:ring-2 focus:ring-gray-800 bg-white"
            >
              <option value="">Select a second PDF</option>
              {pdfs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} {p.version && `(v${p.version})`}
                </option>
              ))}
            </select>
            <DocumentDetails item={selectedPdf2} type="pdfs" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              3. Ask your question
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g., What are the main differences between these two documents? or Summarize the key points of the first document."
              className="block w-full p-3 border border-[#cacfd8] rounded-md focus:ring-2 focus:ring-gray-800 bg-white"
              rows={3}
            />
          </div>

          <div className="text-center">
            <button
              onClick={handleAsk}
              disabled={!selectedPdf1 || !question || isLoading}
              className="bg-black text-white px-8 py-3 rounded-md font-semibold hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center mx-auto"
            >
              {isLoading ? (
                <>
                  <CircularProgress size={20} color="inherit" className="mr-2" /> Generating Answer...
                </>
              ) : (
                <>
                  <QuestionAnswerIcon className="mr-2" /> Ask AI
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {answer && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-[#f4f3ef] shadow-md rounded-lg p-8"
        >
          <h3 className="text-xl font-semibold mb-4 text-black flex items-center">
            <SmartToyIcon className="mr-2" /> AI Generated Answer
          </h3>
          <div className="prose max-w-none text-gray-800 whitespace-pre-wrap">
            {answer}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};


const CompareActs = () => {
  const [acts, setActs] = useState([]);
  const [pdfs, setPdfs] = useState([]);
  const [leftItem, setLeftItem] = useState(null);
  const [rightItem, setRightItem] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [comparisonType, setComparisonType] = useState("acts");
  const [mode, setMode] = useState("compare");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: actsData, error: actsError } = await supabase
          .from("acts")
          .select("id, title, version, category, status, content");
        if (actsError) throw actsError;
        setActs(actsData || []);

        const { data: pdfsData, error: pdfsError } = await supabase
          .from("pdfs")
          .select("id, title, version, category, status, description, file_url");
        if (pdfsError) throw pdfsError;
        setPdfs(pdfsData || []);
      } catch (err) {
        setError("Failed to load data");
        console.error(err.message);
      }
    };
    fetchData();
  }, []);

  const items = useMemo(
    () => (comparisonType === "acts" ? acts : pdfs),
    [comparisonType, acts, pdfs]
  );

  useEffect(() => {
    setLeftItem(null);
    setRightItem(null);
    setComparison(null);
    setError(null);
  }, [comparisonType, mode]);

  const compareItems = async () => {
    if (!leftItem || !rightItem) {
      setError(`Please select two ${comparisonType} to compare`);
      return;
    }
    if (leftItem.id === rightItem.id) {
      setError("Please select two different items");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (comparisonType === "acts") {
        const differences = compareText(leftItem.content, rightItem.content);
        setComparison({ left: leftItem, right: rightItem, differences, type: "acts" });
      } else {
        const leftText = await extractPdfText(leftItem.file_url);
        const rightText = await extractPdfText(rightItem.file_url);
        const textDiffs = compareText(leftText, rightText);
        const metadataDiffs = compareMetadata(leftItem, rightItem);
        const differences = [...metadataDiffs, ...textDiffs];
        setComparison({
          left: leftItem,
          right: rightItem,
          differences,
          type: textDiffs.length ? "pdf-text" : "pdfs",
        });
      }
    } catch (err) {
      setError("Failed to extract and compare PDF text");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white text-black min-h-screen">
      {/* Hero */}
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
          <div className="mb-4 text-white">
            {mode === 'compare' ? <CompareArrowsIcon fontSize="large" /> : <SmartToyIcon fontSize="large" />}
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            {mode === 'compare' ? 'Compare Documents' : 'AI Document Analysis'}
          </h1>
          <p className="text-lg text-gray-200 max-w-2xl mx-auto">
            {mode === 'compare'
              ? 'Select two documents to see how they differ.'
              : 'Unlock insights by asking questions directly to your PDF documents.'}
          </p>
        </motion.div>
      </section>

      {/* Main */}
      <section className="bg-[#f4f3ef] py-16">
        <div className="container mx-auto px-6">
          {/* Main Tabs for Mode Selection */}
          <div className="flex justify-center mb-12">
            <div className="flex space-x-2 md:space-x-4 bg-[#d6d8e0] p-2 rounded-xl">
              <button
                onClick={() => setMode("compare")}
                className={`px-4 py-2 rounded-lg font-medium flex items-center transition-colors duration-300 ${mode === "compare" ? "bg-black text-white shadow-md" : "hover:bg-[#c9ced8]"
                  }`}
              >
                <CompareArrowsIcon className="mr-2" /> Document Comparison
              </button>
              <button
                onClick={() => setMode("ai")}
                className={`px-4 py-2 rounded-lg font-medium flex items-center transition-colors duration-300 ${mode === "ai" ? "bg-black text-white shadow-md" : "hover:bg-[#c9ced8]"
                  }`}
              >
                <SmartToyIcon className="mr-2" /> AI Analysis (PDF)
              </button>
            </div>
          </div>

          {/* Conditional Rendering based on mode */}
          {mode === 'compare' ? (
            <>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                className="max-w-4xl mx-auto bg-[#f4f3ef] shadow-md rounded-lg p-8 mb-12"
              >
                <h2 className="text-2xl font-bold mb-8 text-center">
                  Select Documents to Compare
                </h2>

                <div className="flex justify-center mb-8">
                  <div className="flex space-x-4 bg-[#d6d8e0] p-1 rounded-lg">
                    <button
                      onClick={() => setComparisonType("acts")}
                      className={`px-4 py-2 rounded-md font-medium flex items-center ${comparisonType === "acts" ? "bg-black text-white" : "hover:bg-[#c9ced8]"
                        }`}
                    >
                      <MenuBookIcon className="mr-2" /> Compare Acts
                    </button>
                    <button
                      onClick={() => setComparisonType("pdfs")}
                      className={`px-4 py-2 rounded-md font-medium flex items-center ${comparisonType === "pdfs" ? "bg-black text-white" : "hover:bg-[#c9ced8]"
                        }`}
                    >
                      <PictureAsPdfIcon className="mr-2" /> Compare PDFs
                    </button>
                  </div>
                </div>

                {error && <Alert severity="error" className="mb-6">{error}</Alert>}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {["First", "Second"].map((label, idx) => (
                    <div key={label}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {label} {comparisonType === "acts" ? "Act" : "PDF"}
                      </label>
                      <select
                        value={idx === 0 ? leftItem?.id || "" : rightItem?.id || ""}
                        onChange={(e) => {
                          const selected = items.find((i) => i.id === e.target.value);
                          idx === 0 ? setLeftItem(selected) : setRightItem(selected);
                        }}
                        className="block w-full p-3 border border-[#cacfd8] rounded-md focus:ring-2 focus:ring-gray-800 bg-white"
                      >
                        <option value="">Select a {comparisonType === "acts" ? "act" : "PDF"}</option>
                        {items.map((i) => (
                          <option key={i.id} value={i.id}>
                            {i.title} {i.version && `(v${i.version})`}
                          </option>
                        ))}
                      </select>
                      <DocumentDetails item={idx === 0 ? leftItem : rightItem} type={comparisonType} />
                    </div>
                  ))}
                </div>

                <div className="text-center">
                  <button
                    onClick={compareItems}
                    disabled={!leftItem || !rightItem || loading}
                    className="bg-black text-white px-8 py-3 rounded-md font-semibold hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center mx-auto"
                  >
                    {loading ? (
                      <>
                        <CircularProgress size={20} color="inherit" className="mr-2" /> Analyzing...
                      </>
                    ) : (
                      <>
                        <CompareArrowsIcon className="mr-2" /> Compare {comparisonType === "acts" ? "Acts" : "PDFs"}
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
                  <h2 className="text-2xl font-bold mb-6 text-center">Comparison Results</h2>
                  <div className="bg-[#f4f3ef] shadow rounded-lg p-6 mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DocumentDetails item={comparison.left} type={comparison.type} />
                    <DocumentDetails item={comparison.right} type={comparison.type} />
                  </div>
                  {comparison.differences.length > 0 ? (
                    <ComparisonTable comparison={comparison} />
                  ) : (
                    <div className="bg-[#f4f3ef] shadow rounded-lg p-6 text-center">
                      <h3 className="text-xl font-semibold mb-2">No Differences Found</h3>
                      <p className="text-gray-600">
                        {comparison.type === "acts"
                          ? "The content of both acts appears to be identical."
                          : "The PDFs appear to be identical (both text & metadata)."}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </>
          ) : (
            <AiPdfAnalyzer pdfs={pdfs} />
          )}

        </div>
      </section>
    </div>
  );
};

export default CompareActs;