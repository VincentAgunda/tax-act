import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { supabase } from "../supabaseClient";
import { motion } from "framer-motion";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";

// PDF.js for text extraction
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker?url";
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

//================================================================//
//  ✅ UTILITIES (api.js)                                          //
//================================================================//

/**
 * Extracts text from a PDF file URL.
 * @param {string} url - The URL of the PDF file.
 * @returns {Promise<string>} The extracted text content.
 */
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

/**
 * Calls the Google Gemini Generative AI API.
 * @param {string} context - The document text to provide as context.
 * @param {string} question - The user's question.
 * @returns {Promise<string>} The AI-generated answer.
 */
const callGenerativeAiApi = async (context, question) => {
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;

  if (!API_KEY) {
    throw new Error("API key is missing. Please add VITE_GEMINI_API_KEY to your .env file.");
  }

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

  const payload = { contents: [{ parts: [{ text: prompt }] }] };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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

//================================================================//
//  ✅ UTILITIES (comparison.js)                                  //
//================================================================//

/** Strips HTML tags from a string */
const stripHtml = (html) => {
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

/** Compares two texts line by line and returns differences */
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

/** Compares metadata fields of two PDF objects */
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

//================================================================//
//  ✅ CUSTOM HOOK (useDocuments.js)                               //
//================================================================//

const useDocuments = () => {
  const [acts, setActs] = useState([]);
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [actsResponse, pdfsResponse] = await Promise.all([
          supabase.from("acts").select("id, title, version, category, status, content"),
          supabase.from("pdfs").select("id, title, version, category, status, description, file_url"),
        ]);

        if (actsResponse.error) throw actsResponse.error;
        if (pdfsResponse.error) throw pdfsResponse.error;

        setActs(actsResponse.data || []);
        setPdfs(pdfsResponse.data || []);
      } catch (err) {
        setError("Failed to load documents from the database.");
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return { acts, pdfs, loading, error };
};

//================================================================//
//  ✨ REUSABLE & MODULAR COMPONENTS (components/)                 //
//================================================================//

const fadeIn = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

/**
 * Displays details for a selected document.
 * Memoized to prevent re-renders when props are unchanged.
 */
const DocumentDetails = memo(({ item, type }) => {
  if (!item) return null;

  return (
    <div className="mt-4 p-3 bg-[#d6d8e0] rounded-md">
      <p className="font-medium">{item.title}</p>
      {item.version && <p className="text-sm text-gray-600">Version: {item.version}</p>}
      {item.category && <p className="text-sm text-gray-600">Category: {item.category}</p>}
      {item.status && <p className="text-sm text-gray-600">Status: {item.status}</p>}
      {type === "pdfs" && (
        <a href={item.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center mt-2 text-blue-600 hover:underline">
          <PictureAsPdfIcon className="mr-1" fontSize="small" /> View PDF
        </a>
      )}
    </div>
  );
});

/**
 * Renders a table of differences.
 * Memoized for performance.
 */
const ComparisonTable = memo(({ comparison }) => {
  const [showAll, setShowAll] = useState(false);
  const diffsToShow = showAll ? comparison.differences : comparison.differences.slice(0, 10);
  const isTextComparison = comparison.type === "acts" || comparison.type === "pdf-text";

  return (
    <div className="bg-[#f4f3ef] shadow rounded-lg p-6">
      <h3 className="text-xl font-semibold mb-4 text-black">{isTextComparison ? "Content Differences" : "Metadata Differences"}</h3>
      <p className="text-gray-600 mb-6">Found {comparison.differences.length} differences between the documents.</p>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#cacfd8]">
          <thead className="bg-[#d6d8e0]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{isTextComparison ? "Line" : "Field"}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">First Document</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Second Document</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-[#cacfd8]">
            {diffsToShow.map((diff, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-[#f4f3ef]"}>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{isTextComparison ? diff.line : diff.field}</td>
                <td className="px-6 py-4 text-sm text-gray-900 bg-red-100">{diff.left}</td>
                <td className="px-6 py-4 text-sm text-gray-900 bg-green-100">{diff.right}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {comparison.differences.length > 10 && (
        <button onClick={() => setShowAll(!showAll)} className="mt-4 text-sm text-blue-600 hover:underline">
          {showAll ? "Show Less" : `Show All (${comparison.differences.length})`}
        </button>
      )}
    </div>
  );
});

/**
 * A reusable dropdown selector for documents.
 * Memoized for performance.
 */
const DocumentSelector = memo(({ label, items, selectedId, onChange, type }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <select
      value={selectedId || ""}
      onChange={(e) => {
        const selectedItem = items.find((i) => i.id === e.target.value);
        onChange(selectedItem);
      }}
      className="block w-full p-3 border border-[#cacfd8] rounded-md focus:ring-2 focus:ring-gray-800 bg-white"
    >
      <option value="">Select a {type}</option>
      {items.map((i) => (
        <option key={i.id} value={i.id}>
          {i.title} {i.version && `(v${i.version})`}
        </option>
      ))}
    </select>
  </div>
));

//================================================================//
//  🧠 AI ANALYSIS MODE COMPONENT                                 //
//================================================================//

const AiAnalysisMode = ({ acts, pdfs }) => {
  const [analysisType, setAnalysisType] = useState("pdfs"); // 'pdfs' or 'acts'
  const [selectedDoc1, setSelectedDoc1] = useState(null);
  const [selectedDoc2, setSelectedDoc2] = useState(null); // Optional second doc
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Reset selections when analysis type changes
  useEffect(() => {
    setSelectedDoc1(null);
    setSelectedDoc2(null);
    setAnswer("");
    setError(null);
  }, [analysisType]);

  const items = useMemo(() => (analysisType === 'acts' ? acts : pdfs), [analysisType, acts, pdfs]);

  const handleAsk = useCallback(async () => {
    if (!selectedDoc1) {
      setError("Please select at least one document to analyze.");
      return;
    }
    if (selectedDoc1 && selectedDoc2 && selectedDoc1.id === selectedDoc2.id) {
      setError("Please select two different documents for comparison.");
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
      // Get text content based on document type
      const getText = async (doc) => {
        if (!doc) return "";
        return analysisType === 'pdfs' ? await extractPdfText(doc.file_url) : doc.content;
      };

      const doc1Text = await getText(selectedDoc1);
      let combinedContext = `--- DOCUMENT 1: ${selectedDoc1.title} (Version: ${selectedDoc1.version || 'N/A'}) START ---\n${doc1Text}\n--- DOCUMENT 1 END ---`;

      if (selectedDoc2) {
        const doc2Text = await getText(selectedDoc2);
        combinedContext += `\n\n--- DOCUMENT 2: ${selectedDoc2.title} (Version: ${selectedDoc2.version || 'N/A'}) START ---\n${doc2Text}\n--- DOCUMENT 2 END ---`;
      }

      const aiResponse = await callGenerativeAiApi(combinedContext, question);
      setAnswer(aiResponse);
    } catch (err) {
      setError("An error occurred while analyzing the document(s). Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDoc1, selectedDoc2, question, analysisType]);

  const docTypeName = analysisType === 'acts' ? 'Act' : 'PDF';

  return (
    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="max-w-4xl mx-auto">
      <div className="bg-[#f4f3ef] shadow-md rounded-lg p-8 mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Ask a Question About Your Documents</h2>

        {/* NEW: Document type selector */}
        <div className="flex justify-center mb-8">
            <div className="flex space-x-4 bg-[#d6d8e0] p-1 rounded-lg">
                <button onClick={() => setAnalysisType("acts")} className={`px-4 py-2 rounded-md font-medium flex items-center ${analysisType === "acts" ? "bg-black text-white" : "hover:bg-[#c9ced8]"}`}>
                    <MenuBookIcon className="mr-2" /> Analyze Acts
                </button>
                <button onClick={() => setAnalysisType("pdfs")} className={`px-4 py-2 rounded-md font-medium flex items-center ${analysisType === "pdfs" ? "bg-black text-white" : "hover:bg-[#c9ced8]"}`}>
                    <PictureAsPdfIcon className="mr-2" /> Analyze PDFs
                </button>
            </div>
        </div>

        {error && <Alert severity="error" className="mb-6">{error}</Alert>}
        <div className="space-y-6">
          <DocumentSelector label={`1. Select First ${docTypeName}`} items={items} selectedId={selectedDoc1?.id} onChange={setSelectedDoc1} type={docTypeName}/>
          <DocumentDetails item={selectedDoc1} type={analysisType} />

          <DocumentSelector label={`2. Select Second ${docTypeName} (Optional)`} items={items} selectedId={selectedDoc2?.id} onChange={setSelectedDoc2} type={docTypeName}/>
          <DocumentDetails item={selectedDoc2} type={analysisType} />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">3. Ask your question</label>
            <textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="e.g., Summarize the key points of the first document." className="block w-full p-3 border border-[#cacfd8] rounded-md focus:ring-2 focus:ring-gray-800 bg-white" rows={3}/>
          </div>

          <div className="text-center">
            <button onClick={handleAsk} disabled={!selectedDoc1 || !question || isLoading} className="bg-black text-white px-8 py-3 rounded-md font-semibold hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center mx-auto">
              {isLoading ? (<><CircularProgress size={20} color="inherit" className="mr-2" /> Generating Answer...</>) : (<><QuestionAnswerIcon className="mr-2" /> Ask AI</>)}
            </button>
          </div>
        </div>
      </div>
      {answer && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#f4f3ef] shadow-md rounded-lg p-8">
          <h3 className="text-xl font-semibold mb-4 text-black flex items-center"><SmartToyIcon className="mr-2" /> AI Generated Answer</h3>
          <div className="prose max-w-none text-gray-800 whitespace-pre-wrap">{answer}</div>
        </motion.div>
      )}
    </motion.div>
  );
};


//================================================================//
//  🔍 COMPARISON MODE COMPONENT                                  //
//================================================================//

const ComparisonMode = ({ acts, pdfs }) => {
  const [comparisonType, setComparisonType] = useState("acts"); // 'acts' or 'pdfs'
  const [leftItem, setLeftItem] = useState(null);
  const [rightItem, setRightItem] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Reset selections when comparison type changes
  useEffect(() => {
    setLeftItem(null);
    setRightItem(null);
    setComparison(null);
    setError(null);
  }, [comparisonType]);

  const items = useMemo(() => (comparisonType === "acts" ? acts : pdfs), [comparisonType, acts, pdfs]);

  const compareItems = useCallback(async () => {
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
      let differences;
      let type;

      if (comparisonType === "acts") {
        differences = compareText(leftItem.content, rightItem.content);
        type = "acts";
      } else {
        const [leftText, rightText] = await Promise.all([
          extractPdfText(leftItem.file_url),
          extractPdfText(rightItem.file_url),
        ]);
        const textDiffs = compareText(leftText, rightText);
        const metadataDiffs = compareMetadata(leftItem, rightItem);
        differences = [...metadataDiffs, ...textDiffs];
        type = textDiffs.length ? "pdf-text" : "pdfs";
      }
      setComparison({ left: leftItem, right: rightItem, differences, type });
    } catch (err) {
      setError("Failed to extract and compare document text.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [leftItem, rightItem, comparisonType]);
  
  const docTypeName = comparisonType === 'acts' ? 'Act' : 'PDF';

  return (
    <>
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="max-w-4xl mx-auto bg-[#f4f3ef] shadow-md rounded-lg p-8 mb-12">
        <h2 className="text-2xl font-bold mb-8 text-center">Select Documents to Compare</h2>

        <div className="flex justify-center mb-8">
          <div className="flex space-x-4 bg-[#d6d8e0] p-1 rounded-lg">
            <button onClick={() => setComparisonType("acts")} className={`px-4 py-2 rounded-md font-medium flex items-center ${comparisonType === "acts" ? "bg-black text-white" : "hover:bg-[#c9ced8]"}`}>
              <MenuBookIcon className="mr-2" /> Compare Acts
            </button>
            <button onClick={() => setComparisonType("pdfs")} className={`px-4 py-2 rounded-md font-medium flex items-center ${comparisonType === "pdfs" ? "bg-black text-white" : "hover:bg-[#c9ced8]"}`}>
              <PictureAsPdfIcon className="mr-2" /> Compare PDFs
            </button>
          </div>
        </div>

        {error && <Alert severity="error" className="mb-6">{error}</Alert>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <DocumentSelector label={`First ${docTypeName}`} items={items} selectedId={leftItem?.id} onChange={setLeftItem} type={docTypeName}/>
            <DocumentDetails item={leftItem} type={comparisonType} />
          </div>
          <div>
            <DocumentSelector label={`Second ${docTypeName}`} items={items} selectedId={rightItem?.id} onChange={setRightItem} type={docTypeName} />
            <DocumentDetails item={rightItem} type={comparisonType} />
          </div>
        </div>

        <div className="text-center">
          <button onClick={compareItems} disabled={!leftItem || !rightItem || loading} className="bg-black text-white px-8 py-3 rounded-md font-semibold hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center mx-auto">
            {loading ? (<><CircularProgress size={20} color="inherit" className="mr-2" /> Analyzing...</>) : (<><CompareArrowsIcon className="mr-2" /> Compare {docTypeName}s</>)}
          </button>
        </div>
      </motion.div>

      {comparison && (
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="max-w-6xl mx-auto">
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
              <p className="text-gray-600">The documents appear to be identical.</p>
            </div>
          )}
        </motion.div>
      )}
    </>
  );
};


//================================================================//
//  🏛️ MAIN PAGE COMPONENT (CompareActs.jsx)                       //
//================================================================//

const CompareActs = () => {
  const [mode, setMode] = useState("compare"); // 'compare' or 'ai'
  const { acts, pdfs, loading: dataLoading, error: dataError } = useDocuments();

  const heroContent = {
    compare: {
      icon: <CompareArrowsIcon fontSize="large" />,
      title: "Compare Documents",
      subtitle: "Select two documents to see how they differ.",
    },
    ai: {
      icon: <SmartToyIcon fontSize="large" />,
      title: "AI Document Analysis",
      subtitle: "Unlock insights by asking questions directly to your documents.",
    },
  };
  
  const currentHero = heroContent[mode];

  return (
    <div className="bg-white text-black min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[40vh] flex flex-col items-center justify-center text-center" style={{ backgroundImage: `url(/compare-bg.jpg)`, backgroundSize: "cover", backgroundPosition: "center" }}>
        <div className="absolute inset-0 bg-black/40" />
        <motion.div initial="hidden" animate="visible" variants={fadeIn} className="relative z-10 px-4">
          <div className="mb-4 text-white">{currentHero.icon}</div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">{currentHero.title}</h1>
          <p className="text-lg text-gray-200 max-w-2xl mx-auto">{currentHero.subtitle}</p>
        </motion.div>
      </section>

      {/* Main Content Section */}
      <section className="bg-[#f4f3ef] py-16">
        <div className="container mx-auto px-6">
          {/* Mode Selection Tabs */}
          <div className="flex justify-center mb-12">
            <div className="flex space-x-2 md:space-x-4 bg-[#d6d8e0] p-2 rounded-xl">
              <button onClick={() => setMode("compare")} className={`px-4 py-2 rounded-lg font-medium flex items-center transition-colors duration-300 ${mode === "compare" ? "bg-black text-white shadow-md" : "hover:bg-[#c9ced8]"}`}>
                <CompareArrowsIcon className="mr-2" /> Document Comparison
              </button>
              <button onClick={() => setMode("ai")} className={`px-4 py-2 rounded-lg font-medium flex items-center transition-colors duration-300 ${mode === "ai" ? "bg-black text-white shadow-md" : "hover:bg-[#c9ced8]"}`}>
                <SmartToyIcon className="mr-2" /> AI Analysis
              </button>
            </div>
          </div>
          
          {/* Conditional Rendering based on mode */}
          {dataLoading && <div className="text-center"><CircularProgress /></div>}
          {dataError && <Alert severity="error" className="max-w-4xl mx-auto">{dataError}</Alert>}
          
          {!dataLoading && !dataError && (
             mode === 'compare' 
                ? <ComparisonMode acts={acts} pdfs={pdfs} /> 
                : <AiAnalysisMode acts={acts} pdfs={pdfs} />
          )}

        </div>
      </section>
    </div>
  );
};

export default CompareActs;