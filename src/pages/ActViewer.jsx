import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import CompareModal from "../components/CompareModal";
import { getAllActs } from "../utils/supabaseUtils";
import { motion, AnimatePresence } from "framer-motion";
import MenuIcon from "@mui/icons-material/Menu";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';

/**
 * ActViewer (Premium True Black & Modern UI)
 */

const ActViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // Data State
  const [act, setAct] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Selection & Compare State
  const [selectedText, setSelectedText] = useState("");
  const [selectionRect, setSelectionRect] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [actsList, setActsList] = useState([]);
  
  const selectionTimeoutRef = useRef(null);
  const contentRef = useRef(null);
  const topRef = useRef(null);

  // --- 1. Fetch & Parse Data ---
  useEffect(() => {
    const fetchAct = async () => {
      try {
        const { data, error } = await supabase
          .from("acts")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        setAct(data);

        // Parse Content
        let parsedContent = [];
        try {
            const potentialJson = JSON.parse(data.content);
            if (Array.isArray(potentialJson)) {
                parsedContent = potentialJson;
            } else {
                throw new Error("Not an array");
            }
        } catch (e) {
            parsedContent = [{ title: "Full Document", content: data.content }];
        }
        setChapters(parsedContent);
      } catch (error) {
        console.error("Error fetching act:", error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAct();
  }, [id]);

  // --- 2. Scroll to Top on Chapter Change ---
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if(topRef.current) topRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [currentChapterIndex, loading]);

  // --- 3. Fetch Meta for Compare ---
  useEffect(() => {
    const fetchActsMeta = async () => {
      try {
        const data = await getAllActs();
        setActsList(data || []);
      } catch (err) { console.error(err); }
    };
    fetchActsMeta();
  }, []);

  // --- 4. Selection Logic ---
  const updateSelection = useCallback(() => {
    if (!contentRef.current) return;
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setShowPopup(false);
      return;
    }
    const range = selection.getRangeAt(0);
    // Ensure selection is inside content
    if (!contentRef.current.contains(range.commonAncestorContainer)) {
      setShowPopup(false);
      return;
    }

    const text = selection.toString().trim();
    if (!text) {
      setShowPopup(false);
      return;
    }

    const rect = range.getBoundingClientRect();
    setSelectionRect(rect);
    setSelectedText(text);
    setShowPopup(true);

    // Keep popup alive slightly longer or until click away
    clearTimeout(selectionTimeoutRef.current);
    selectionTimeoutRef.current = setTimeout(() => setShowPopup(false), 8000); 
  }, []);

  useEffect(() => {
    document.addEventListener("selectionchange", updateSelection);
    return () => {
        document.removeEventListener("selectionchange", updateSelection);
        clearTimeout(selectionTimeoutRef.current);
    };
  }, [updateSelection]);

  // --- Handlers ---
  const handleNext = () => {
    if (currentChapterIndex < chapters.length - 1) setCurrentChapterIndex(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentChapterIndex > 0) setCurrentChapterIndex(prev => prev - 1);
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-gray-500 font-mono tracking-widest animate-pulse">LOADING ACT...</div>;
  if (!act) return <div className="min-h-screen bg-black flex items-center justify-center text-red-500">Act not found.</div>;

  const currentChapter = chapters[currentChapterIndex];

  return (
    <div className="flex flex-col h-screen bg-black text-gray-300 overflow-hidden font-sans selection:bg-[#FFD600] selection:text-black">
        
      {/* Top Header - Premium Black & Responsive */}
      <header className="h-16 bg-black/90 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4 z-20 flex-shrink-0 sticky top-0">
        <div className="flex items-center gap-2 sm:gap-4 overflow-hidden">
             <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-white transition duration-300 flex-shrink-0">
                <KeyboardBackspaceIcon />
             </button>
             <div className="flex flex-col overflow-hidden">
                 <h1 className="text-sm md:text-base font-semibold text-white tracking-tight truncate">
                     {act.title}
                 </h1>
                 <span className="text-[10px] text-gray-600 uppercase tracking-widest font-bold truncate">
                    {act.year} Document
                 </span>
             </div>
        </div>
        
        {/* Highlight Indicator - NOW VISIBLE ON MOBILE */}
        <div className="flex items-center pl-2 flex-shrink-0">
             {/* Changed 'hidden md:flex' to 'flex' and added responsive sizing classes */}
             <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-1 sm:py-1.5 bg-[#0A0A0A] border border-white/10 rounded-full mr-2 sm:mr-0">
                <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2 flex-shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FFD600] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-[#FFD600]"></span>
                </span>
                {/* Responsive text: shorter on mobile, full on larger screens */}
                <span className="text-[10px] sm:text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    <span className="sm:hidden">Highlight to compare</span>
                    <span className="hidden sm:inline">Highlight text to compare</span>
                </span>
             </div>
             
             <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                className="lg:hidden text-gray-400 ml-2 flex-shrink-0"
             >
                <FormatListBulletedIcon />
             </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Desktop Sidebar (Table of Contents) - True Black */}
        <aside className="hidden lg:flex w-72 bg-black border-r border-white/10 flex-col flex-shrink-0">
            <div className="p-5 border-b border-white/5">
                <h3 className="text-gray-500 text-[10px] uppercase tracking-[0.2em] font-bold">Contents</h3>
            </div>
            <div className="overflow-y-auto flex-1 p-3 space-y-1 custom-scrollbar">
                {chapters.map((chap, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentChapterIndex(idx)}
                        className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all duration-300 border border-transparent ${
                            currentChapterIndex === idx 
                            ? "bg-[#0A0A0A] text-white border-white/10 shadow-lg shadow-black" 
                            : "text-gray-600 hover:text-gray-300 hover:bg-[#050505]"
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <span className={`text-[10px] font-mono ${currentChapterIndex === idx ? 'text-[#FFD600]' : 'text-gray-700'}`}>
                                {(idx + 1).toString().padStart(2, '0')}
                            </span>
                            <span className="truncate">{chap.title}</span>
                        </div>
                    </button>
                ))}
            </div>
        </aside>

        {/* Mobile Sidebar Drawer */}
        <AnimatePresence>
            {mobileMenuOpen && (
                 <>
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setMobileMenuOpen(false)}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
                    />
                    <motion.div 
                        initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed inset-y-0 left-0 w-72 bg-[#050505] border-r border-white/10 z-50 lg:hidden shadow-2xl"
                    >
                        <div className="p-5 border-b border-white/10 flex justify-between items-center">
                            <h3 className="text-white font-bold tracking-widest text-xs uppercase">Index</h3>
                            <button onClick={() => setMobileMenuOpen(false)} className="text-gray-400"><MenuIcon /></button>
                        </div>
                        <div className="overflow-y-auto h-full p-2">
                            {chapters.map((chap, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => { setCurrentChapterIndex(idx); setMobileMenuOpen(false); }}
                                    className={`w-full text-left px-4 py-4 border-b border-white/5 text-sm ${
                                        currentChapterIndex === idx ? "text-[#FFD600] font-medium" : "text-gray-500"
                                    }`}
                                >
                                    <span className="mr-3 text-xs opacity-50">{(idx + 1).toString().padStart(2, '0')}</span>
                                    {chap.title}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                 </>
            )}
        </AnimatePresence>

        {/* Main Canvas Area */}
        <main className="flex-1 overflow-y-auto relative scroll-smooth bg-black flex justify-center">
            <div className="w-full max-w-4xl px-6 sm:px-12 py-12 pb-32">
                <div ref={topRef} />
                
                {/* Chapter Title */}
                <div className="mb-10 pb-6 border-b border-white/10">
                    <p className="text-[#FFD600] text-xs font-mono mb-3 tracking-widest uppercase">Chapter {currentChapterIndex + 1}</p>
                    <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight">{currentChapter.title}</h2>
                </div>

                {/* The Content */}
                <article 
                    ref={contentRef}
                    className="prose prose-invert prose-lg max-w-none text-gray-400 leading-8 tracking-wide"
                    // Customizing prose for True Black theme
                    style={{ 
                        fontSize: '1.1rem',
                        '--tw-prose-headings': '#FFF',
                        '--tw-prose-body': '#A3A3A3',
                        '--tw-prose-bold': '#FFF',
                        '--tw-prose-links': '#FFD600',
                    }} 
                    dangerouslySetInnerHTML={{ __html: currentChapter.content }}
                />

                {/* Pagination Controls */}
                <div className="mt-20 pt-8 border-t border-white/10 flex justify-between items-center">
                    <button 
                        onClick={handlePrev} 
                        disabled={currentChapterIndex === 0}
                        className="group flex items-center gap-2 text-gray-500 hover:text-[#FFD600] disabled:opacity-20 disabled:hover:text-gray-500 transition duration-300"
                    >
                        <ArrowBackIcon className="group-hover:-translate-x-1 transition-transform" /> 
                        <span className="uppercase text-xs font-bold tracking-widest">Prev</span>
                    </button>

                    <div className="h-1 flex-1 mx-8 bg-gray-900 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-[#FFD600]" 
                            style={{ width: `${((currentChapterIndex + 1) / chapters.length) * 100}%` }}
                        ></div>
                    </div>

                    <button 
                        onClick={handleNext}
                        disabled={currentChapterIndex === chapters.length - 1}
                        className="group flex items-center gap-2 text-gray-500 hover:text-[#FFD600] disabled:opacity-20 disabled:hover:text-gray-500 transition duration-300"
                    >
                        <span className="uppercase text-xs font-bold tracking-widest">Next</span>
                        <ArrowForwardIcon className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </main>
      </div>

      {/* Modern High-Contrast Floating Selection Popup */}
      <AnimatePresence>
        {showPopup && selectionRect && (
            <div
            className="fixed z-[100] pointer-events-none"
            style={{
                top: selectionRect.top - 60,
                left: selectionRect.left + (selectionRect.width / 2),
                transform: 'translateX(-50%)'
            }}
            >
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 10 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                className="pointer-events-auto bg-[#111] border border-[#333] text-white px-2 py-1.5 rounded-lg shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] flex items-center gap-1"
            >
                <button 
                    onClick={() => setCompareOpen(true)} 
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-[#222] transition-colors group"
                >
                    <CompareArrowsIcon fontSize="small" className="text-[#FFD600]" />
                    <span className="text-sm font-medium">Compare</span>
                </button>
                
                <div className="w-px h-4 bg-gray-700 mx-1"></div>
                
                <button 
                    onClick={() => {
                        navigator.clipboard.writeText(selectedText);
                        setShowPopup(false);
                    }} 
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-[#222] transition-colors"
                >
                    <ContentCopyIcon fontSize="small" className="text-gray-400" />
                    <span className="text-sm font-medium text-gray-300">Copy</span>
                </button>

                {/* Little triangle arrow pointing down */}
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#111] border-b border-r border-[#333] rotate-45"></div>
            </motion.div>
            </div>
        )}
      </AnimatePresence>

      <CompareModal
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
        currentAct={act}
        selectedText={selectedText}
        acts={actsList}
      />
    </div>
  );
};

export default ActViewer;