import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CloseIcon from '@mui/icons-material/Close';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';

/**
 * Helper: Strips HTML tags to get raw text for comparison
 */
const stripHtml = (html) => {
  if (!html) return "";
  // A simple, standard way to strip HTML in browsers
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

/**
 * Helper: Line-by-line comparison
 */
const compareText = (text1, text2) => {
  // Split by newline, trim whitespace
  const a = (text1 || "").split(/\r?\n/).map((s) => s.trim()).filter(s => s.length > 0);
  const b = (text2 || "").split(/\r?\n/).map((s) => s.trim()).filter(s => s.length > 0);
  
  const max = Math.max(a.length, b.length);
  const diffs = [];
  
  // Simple index-based comparison
  for (let i = 0; i < max; i++) {
    const left = a[i] || "";
    const right = b[i] || "";
    // If lines don't match, record the difference
    // (Counting i+1 as the approximate line number)
    if (left !== right) {
      diffs.push({ line: i + 1, left, right });
    }
  }
  return diffs;
};


const CompareModal = ({ open, onClose, currentAct, selectedText, acts = [] }) => {
  // State for logic
  const [selectedActId, setSelectedActId] = useState("");
  const [comparison, setComparison] = useState(null);

  // Reset state when opening/closing
  useEffect(() => {
    if (!open) {
      setSelectedActId("");
      setComparison(null);
    }
  }, [open]);

  // Find the act object based on the dropdown selection
  const chosenAct = useMemo(() => acts.find((a) => a.id === selectedActId) || null, [acts, selectedActId]);

  const runCompare = () => {
    if (!chosenAct || !currentAct) return;
    
    // 1. Determine source text: either the highlighted selection OR the full current act content
    const sourceRaw = selectedText || currentAct.content;
    // 2. Strip HTML to get clean text
    const leftText = stripHtml(sourceRaw);
    
    // 3. Get target text from chosen act and strip HTML
    const rightText = stripHtml(chosenAct.content);

    // 4. Run comparison
    const diffs = compareText(leftText, rightText);
    
    setComparison({ 
        leftTitle: currentAct.title, 
        rightTitle: chosenAct.title, 
        differences: diffs,
        hasSelection: !!selectedText
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* 1. Dark Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[150]"
          />

          {/* 2. Modal Container - Centered & Responsive */}
          <div className="fixed inset-0 z-[160] flex items-end sm:items-center justify-center p-2 sm:p-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              // Max height ensures it doesn't go off screen, flex-col allows internal scrolling
              className="bg-[#111] border border-white/10 w-full max-w-5xl max-h-[85vh] sm:max-h-[90vh] rounded-t-2xl sm:rounded-xl shadow-2xl flex flex-col overflow-hidden pointer-events-auto"
            >
              
              {/* 3. Header - Sticky at top of modal */}
              <div className="flex items-center justify-between p-4 md:p-5 border-b border-white/10 bg-[#111] shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#FFD600]/10 rounded-lg text-[#FFD600]">
                        <CompareArrowsIcon />
                    </div>
                    <div>
                        <h2 className="text-lg md:text-xl font-bold text-white">Compare Documents</h2>
                        <p className="text-xs text-gray-400 hidden sm:block">
                            Compare {selectedText ? "selection" : "content"} from <strong>{currentAct?.title}</strong> against another document.
                        </p>
                    </div>
                  </div>
                  <button onClick={onClose} className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition">
                      <CloseIcon />
                  </button>
              </div>

              {/* 4. Body - Scrollable Area */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 text-gray-300 custom-scrollbar relative bg-[#0A0A0A]">
                   
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                       
                       {/* Left Col: Preview */}
                       <div className="md:col-span-2 bg-[#151515] p-4 rounded-xl border border-white/5 relative flex flex-col">
                           <h3 className="text-[10px] uppercase tracking-widest text-[#FFD600] mb-3 font-bold">
                               Source: {currentAct?.title} {selectedText ? "(Selection)" : "(Full Text)"}
                           </h3>
                           <div className="flex-1 bg-[#0A0A0A]/50 p-3 rounded-lg border border-white/5 text-sm leading-relaxed overflow-y-auto max-h-[200px] custom-scrollbar">
                             {selectedText ? (
                                 <span className="italic text-white">"{selectedText}"</span>
                             ) : (
                                 <em className="text-gray-500">No text highlighted — comparing full document content.</em>
                             )}
                           </div>
                       </div>

                       {/* Right Col: Controls */}
                       <div className="bg-[#151515] p-4 rounded-xl border border-white/5 flex flex-col justify-between">
                           <div>
                             <label className="block text-xs font-medium mb-2 text-gray-400 uppercase tracking-wider">Compare against</label>
                             <select
                               value={selectedActId}
                               onChange={(e) => setSelectedActId(e.target.value)}
                               // Dark mode styling for select dropdown
                               className="w-full p-3 bg-[#0A0A0A] border border-white/10 rounded-lg text-white text-sm focus:ring-1 focus:ring-[#FFD600] focus:border-[#FFD600] outline-none appearance-none"
                               style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em`, paddingRight: '2.5rem'}}
                             >
                               <option value="" className="text-gray-500">Select an Act...</option>
                               {acts
                                 .filter((a) => a.id !== (currentAct && currentAct.id))
                                 .map((a) => (
                                   <option key={a.id} value={a.id} className="bg-[#111]">
                                     {a.title} {a.year ? `(${a.year})` : ""}
                                   </option>
                                 ))}
                             </select>
                           </div>
                           
                           <button
                             onClick={runCompare}
                             disabled={!selectedActId}
                             className="mt-6 w-full bg-[#FFD600] hover:bg-[#E5C000] text-black font-bold px-4 py-3 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all uppercase tracking-widest text-xs shadow-lg shadow-[#FFD600]/20"
                           >
                             Run Comparison
                           </button>
                       </div>
                   </div>

                   {/* Results Area */}
                   {comparison && (
                     <div className="mt-8 pt-8 border-t border-white/10 animate-in fade-in duration-500">
                       <h4 className="font-bold text-white mb-4 flex items-center gap-3">
                           Comparison Results
                           <span className={`text-xs px-2 py-0.5 rounded-full ${comparison.differences.length > 0 ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
                            {comparison.differences.length} Differences found
                           </span>
                       </h4>
                       
                       {comparison.differences.length === 0 ? (
                         <div className="p-6 bg-[#111] border border-white/10 rounded-xl text-center">
                            <p className="text-gray-400">Does not match perfectly. Try selecting smaller sections for better context.</p>
                         </div>
                       ) : (
                         <div className="overflow-x-auto bg-[#111] border border-white/10 rounded-xl custom-scrollbar">
                           <table className="w-full text-sm text-left">
                             <thead className="text-xs text-gray-500 uppercase bg-[#1A1A1A] border-b border-white/10">
                               <tr>
                                 <th className="px-4 py-3 w-16 text-center">Line approx.</th>
                                 <th className="px-4 py-3 border-r border-white/10 w-1/2">
                                     {comparison.hasSelection ? "Selection Source" : comparison.leftTitle}
                                 </th>
                                 <th className="px-4 py-3 w-1/2">
                                     {comparison.rightTitle}
                                 </th>
                               </tr>
                             </thead>
                             <tbody className="divide-y divide-white/5">
                               {comparison.differences.map((d, idx) => (
                                 <tr key={idx} className="hover:bg-white/5 transition-colors align-top">
                                   <td className="px-4 py-3 font-mono text-gray-600 text-center">{d.line}</td>
                                   {/* whitespace-pre-wrap ensures newlines are respected */}
                                   <td className="px-4 py-3 border-r border-white/10 text-red-200/80 bg-red-900/10 whitespace-pre-wrap font-mono text-xs leading-relaxed">
                                       {d.left || <em className="text-gray-600">—</em>}
                                   </td>
                                   <td className="px-4 py-3 text-green-200/80 bg-green-900/10 whitespace-pre-wrap font-mono text-xs leading-relaxed">
                                       {d.right || <em className="text-gray-600">—</em>}
                                   </td>
                                 </tr>
                               ))}
                             </tbody>
                           </table>
                         </div>
                       )}
                     </div>
                   )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CompareModal;