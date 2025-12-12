// src/pages/AdminDashboard.jsx
import { supabase } from '../supabaseClient';
import React, { useState, useEffect, memo, useRef } from "react";
import RichTextEditor from "../components/RichTextEditor";
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";

// Icons
import MenuBookIcon from "@mui/icons-material/MenuBook";
import NewspaperIcon from "@mui/icons-material/Newspaper";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import HomeIcon from '@mui/icons-material/Home';
import ArticleIcon from '@mui/icons-material/Article';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

// --- Reusable Components ---

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const NavButton = memo(({ active, onClick, icon, children }) => (
  <button onClick={onClick} className={`flex items-center w-full text-left px-4 py-3 rounded-md transition ${
    active ? "bg-black text-white font-semibold shadow-md" : "text-gray-600 hover:bg-gray-200"
  }`}>
    {icon}
    {children}
  </button>
));

const FormInput = memo(({ label, error, ...props }) => (
  <div className="w-full">
    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">{label}</label>
    <input {...props} className={`block w-full p-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition outline-none ${error ? "border-red-500" : "border-gray-300"}`} />
    {error && <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>}
  </div>
));

const FormSelect = memo(({ label, error, children, ...props }) => (
  <div className="w-full">
    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">{label}</label>
    <select {...props} className={`block w-full p-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition outline-none ${error ? "border-red-500" : "border-gray-300"}`}>
      {children}
    </select>
    {error && <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>}
  </div>
));

// --- Chapter Manager Component (The Fixed Canvas) ---
const ChapterManager = ({ chapters, setChapters, error }) => {
    const [activeChapterIndex, setActiveChapterIndex] = useState(0);
    const sidebarRef = useRef(null);

    // Helper to safely get current chapter
    const currentChapter = chapters[activeChapterIndex] || chapters[0];

    const addChapter = () => {
        const newChapter = { title: `Chapter ${chapters.length + 1}`, content: "" };
        const newChapters = [...chapters, newChapter];
        setChapters(newChapters);
        // Switch to new chapter immediately
        setActiveChapterIndex(newChapters.length - 1);
    };

    // Auto-scroll sidebar when a new chapter is added
    useEffect(() => {
        if (sidebarRef.current) {
            sidebarRef.current.scrollTop = sidebarRef.current.scrollHeight;
        }
    }, [chapters.length]);

    const removeChapter = (index) => {
        if (chapters.length === 1) return alert("You must have at least one chapter.");
        if (window.confirm("Delete this chapter?")) {
            const updated = chapters.filter((_, i) => i !== index);
            setChapters(updated);
            // Adjust index to prevent crash if deleting the currently active one
            setActiveChapterIndex(prev => (index === prev ? Math.max(0, index - 1) : prev > index ? prev - 1 : prev));
        }
    };

    const updateChapter = (key, value) => {
        const updated = [...chapters];
        updated[activeChapterIndex] = { ...updated[activeChapterIndex], [key]: value };
        setChapters(updated);
    };

    return (
        <div className="border border-gray-300 rounded-xl overflow-hidden bg-white shadow-sm mt-4 flex flex-col h-[600px]">
            {/* Header */}
            <div className="bg-gray-100 p-3 border-b border-gray-300 flex items-center justify-between flex-shrink-0">
                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                    <ArticleIcon /> Act Content ({chapters.length} Pages)
                </h3>
                <button type="button" onClick={addChapter} className="text-xs bg-black text-white px-3 py-1.5 rounded hover:bg-gray-800 transition flex items-center gap-1">
                    <AddIcon fontSize="small"/> Add Page
                </button>
            </div>
            
            <div className="flex flex-1 overflow-hidden">
                {/* Left: Chapter List - scrollable */}
                <div className="w-64 bg-gray-50 border-r border-gray-200 flex-col flex flex-shrink-0">
                    <div className="p-2 text-xs font-bold text-gray-400 uppercase bg-gray-100 border-b border-gray-200">Page Navigation</div>
                    <div ref={sidebarRef} className="overflow-y-auto flex-1 p-2 space-y-1">
                        {chapters.map((chap, idx) => (
                            <div 
                                key={idx} 
                                onClick={() => setActiveChapterIndex(idx)}
                                className={`group flex items-center gap-2 p-3 rounded-lg cursor-pointer transition border ${
                                    activeChapterIndex === idx 
                                    ? "bg-black text-white border-black shadow-md" 
                                    : "bg-white text-gray-600 border-transparent hover:bg-gray-200"
                                }`} 
                            >
                                <span className={`font-mono text-xs ${activeChapterIndex === idx ? "opacity-50" : "text-gray-400"}`}>{idx + 1}</span>
                                <span className="text-sm truncate flex-1 font-medium">
                                    {chap.title || "Untitled Page"}
                                </span>
                                <button 
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); removeChapter(idx); }}
                                    className={`p-1 rounded opacity-0 group-hover:opacity-100 transition ${
                                        activeChapterIndex === idx ? "hover:bg-gray-700 text-white" : "hover:bg-red-100 text-red-500"
                                    }`}
                                >
                                    <CloseIcon style={{ fontSize: 14 }}/>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Canvas Editor */}
                <div className="flex-1 bg-white overflow-y-auto p-6 relative">
                    {currentChapter ? (
                        /* IMPORTANT: The 'key' prop here forces React to remount the inputs when changing pages.
                           This ensures the input fields clear out or populate correctly for the new page. */
                        <div key={activeChapterIndex} className="space-y-4 animate-fadeIn max-w-4xl mx-auto">
                             <div className="flex items-center justify-between mb-2 border-b border-gray-100 pb-2">
                                <span className="text-xs font-bold text-gray-400 uppercase">Currently Editing Page {activeChapterIndex + 1}</span>
                             </div>

                             <FormInput 
                                label="Page Title" 
                                value={currentChapter.title} 
                                onChange={(e) => updateChapter('title', e.target.value)}
                                placeholder="e.g. Preliminary Provisions"
                                autoFocus={true} 
                            />
                            
                            <div className="h-full flex flex-col">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Page Content</label>
                                <RichTextEditor 
                                    value={currentChapter.content} 
                                    onChange={(val) => updateChapter('content', val)} 
                                />
                                {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            Select a page to edit
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Form Managers ---

const ActsManager = ({ formState, setFormState, errors, isEditing, loading, data, handleSubmit, handleEdit, handleDelete, resetForm }) => {
    // Local state for chapters array. Syncs with formState.content on change.
    const [chapters, setChapters] = useState([{ title: "Chapter 1", content: "" }]);

    // When editing an act, parse the content string back into JSON array
    useEffect(() => {
        if (formState.content) {
            try {
                const parsed = JSON.parse(formState.content);
                if (Array.isArray(parsed)) setChapters(parsed);
                else setChapters([{ title: "Main Content", content: formState.content }]);
            } catch (e) {
                // If standard string (legacy data)
                if (formState.content.length > 0) {
                     setChapters([{ title: "Main Content", content: formState.content }]);
                } else {
                     setChapters([{ title: "Chapter 1", content: "" }]);
                }
            }
        } else {
            // Reset
            if (!isEditing) setChapters([{ title: "Chapter 1", content: "" }]);
        }
    }, [formState.id, isEditing]); // Trigger on ID change (new selection)

    // Sync local chapters to formState string before submit
    const onSubmitProxy = (e) => {
        e.preventDefault();
        const contentString = JSON.stringify(chapters);
        // We manually inject the stringified chapters into the submit handler
        const syntheticEvent = { ...e, preventDefault: () => {} }; 
        handleSubmit(syntheticEvent, contentString);
    };

    return (
      <div className="bg-[#f5f5f7] min-h-full pb-10">
        <motion.div initial="hidden" animate="visible" variants={fadeIn} className="max-w-6xl mx-auto space-y-8">
            
            {/* Form Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                     <h2 className="text-xl font-bold text-gray-800">{isEditing ? "Edit Act" : "Create New Act"}</h2>
                     {isEditing && (
                        <button type="button" onClick={() => { resetForm(); setChapters([{ title: "Chapter 1", content: "" }]); }} className="text-sm text-gray-600 hover:text-black flex items-center gap-1">
                            <AddIcon fontSize="small"/> New
                        </button>
                     )}
                </div>
                
                <form onSubmit={(e) => onSubmitProxy(e)} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput label="Act Title" value={formState.title} error={errors.title} onChange={(e) => setFormState({ ...formState, title: e.target.value })} required />
                        <FormInput label="Act Year" type="number" value={formState.year} onChange={(e) => setFormState({ ...formState, year: e.target.value })} required />
                    </div>
                    
                    <FormInput label="Short Description" value={formState.description} error={errors.description} onChange={(e) => setFormState({ ...formState, description: e.target.value })} required />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormSelect label="Category" value={formState.category} error={errors.category} onChange={(e) => setFormState({ ...formState, category: e.target.value })} required>
                            <option value="">Select...</option>
                            <option value="Income Tax">Income Tax</option>
                            <option value="Corporate Tax">Corporate Tax</option>
                            <option value="Property Tax">Property Tax</option>
                            <option value="Sales Tax">Sales Tax</option>
                        </FormSelect>
                        <FormSelect label="Status" value={formState.status} onChange={(e) => setFormState({ ...formState, status: e.target.value })} required>
                            <option value="Draft">Draft</option>
                            <option value="Active">Active</option>
                            <option value="Archived">Archived</option>
                        </FormSelect>
                    </div>

                    {/* The New Chapter Manager */}
                    <ChapterManager chapters={chapters} setChapters={setChapters} error={errors.content} />

                    <div className="pt-4">
                        <button type="submit" disabled={loading} className="w-full md:w-auto bg-black text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-800 transition flex items-center justify-center gap-2 shadow-lg shadow-gray-400/20">
                            {loading ? <CircularProgress size={20} color="inherit" /> : <><SaveIcon fontSize="small"/> {isEditing ? "Save Changes" : "Publish Act"}</>}
                        </button>
                    </div>
                </form>
            </div>

            {/* List Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                 <h2 className="text-lg font-bold text-gray-800 mb-4">Act Library</h2>
                 {data.length === 0 ? <div className="text-center py-10 text-gray-400">No acts found</div> : (
                     <div className="grid grid-cols-1 gap-3">
                         {data.map((act) => (
                             <div key={act.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-gray-300 hover:shadow-sm transition bg-white">
                                 <div>
                                     <h3 className="font-bold text-gray-800">{act.title}</h3>
                                     <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                         <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">{act.year}</span>
                                         <span>{act.category}</span>
                                         <span className={`px-2 py-0.5 rounded ${act.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>{act.status}</span>
                                     </div>
                                 </div>
                                 <div className="flex items-center gap-2">
                                     <button onClick={() => handleEdit(act)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition"><EditIcon fontSize="small"/></button>
                                     <button onClick={() => handleDelete(act)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition"><DeleteIcon fontSize="small"/></button>
                                 </div>
                             </div>
                         ))}
                     </div>
                 )}
            </div>
        </motion.div>
      </div>
    );
};

// --- News Manager (Kept simple, no chapters needed) ---
const NewsManager = ({ formState, setFormState, errors, isEditing, loading, data, handleSubmit, handleEdit, handleDelete, resetForm }) => (
    <div className="bg-[#f5f5f7] min-h-full pb-10">
        <motion.form key="news-form" onSubmit={(e) => handleSubmit(e)} initial="hidden" animate="visible" variants={fadeIn} className="max-w-6xl mx-auto space-y-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
                <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                    <h2 className="text-xl font-bold text-gray-800">{isEditing ? "Edit News" : "Add News"}</h2>
                    {isEditing && <button type="button" onClick={resetForm} className="text-sm flex items-center gap-1"><AddIcon fontSize="small"/> New</button>}
                </div>
                
                <FormInput label="Title" value={formState.title} error={errors.title} onChange={(e) => setFormState({ ...formState, title: e.target.value })} required />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <FormSelect label="Category" value={formState.category} onChange={(e) => setFormState({ ...formState, category: e.target.value })} required>
                        <option value="General">General</option>
                        <option value="Tax News">Tax News</option>
                        <option value="Event">Event</option>
                     </FormSelect>
                     <FormSelect label="Status" value={formState.status} onChange={(e) => setFormState({ ...formState, status: e.target.value })} required>
                        <option value="Draft">Draft</option>
                        <option value="Published">Published</option>
                     </FormSelect>
                     <FormInput label="Year" type="number" value={formState.year} onChange={(e) => setFormState({ ...formState, year: e.target.value })} />
                </div>
                <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Content</label>
                     <RichTextEditor value={formState.content} onChange={(c) => setFormState({ ...formState, content: c })} />
                </div>
                <button type="submit" disabled={loading} className="bg-black text-white px-6 py-2 rounded-lg font-bold hover:bg-gray-800">{loading ? "Saving..." : "Save News"}</button>
            </div>
        </motion.form>
    </div>
);

// --- Main Dashboard Container ---

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("acts");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [acts, setActs] = useState([]);
  const [news, setNews] = useState([]);

  const [isEditing, setIsEditing] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);

  const [actForm, setActForm] = useState({ title: "", description: "", content: "", category: "", status: "Draft", year: new Date().getFullYear().toString() });
  const [newsForm, setNewsForm] = useState({ title: "", description: "", content: "", category: "General", status: "Draft", year: new Date().getFullYear().toString() });
  const [errors, setErrors] = useState({ act: {}, news: {} });

  useEffect(() => { fetchData(); }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const tableName = activeTab;
      const { data, error } = await supabase.from(tableName).select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (tableName === "acts") setActs(data || []);
      if (tableName === "news") setNews(data || []);
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (form, type) => {
      // Basic validation logic
      const errs = {};
      if(!form.title) errs.title = "Required";
      setErrors(prev => ({...prev, [type]: errs}));
      return Object.keys(errs).length === 0;
  };

  const resetForms = () => {
    setActForm({ title: "", description: "", content: "", category: "", status: "Draft", year: new Date().getFullYear().toString() });
    setNewsForm({ title: "", description: "", content: "", category: "General", status: "Draft", year: new Date().getFullYear().toString() });
    setIsEditing(false);
    setCurrentEditId(null);
  };

  // Wrapper for generic submit, now accepts optional overridden content (for Acts JSON)
  const handleGenericSubmit = async (e, form, type, overrideContent = null) => {
    if(e) e.preventDefault();
    if (!validateForm(form, type)) return;
    
    setLoading(true);
    try {
      const processedData = { ...form };
      if (overrideContent) processedData.content = overrideContent;

      const tableName = type === 'news' ? 'news' : `${type}s`;
      const { error } = isEditing
        ? await supabase.from(tableName).update(processedData).eq('id', currentEditId)
        : await supabase.from(tableName).insert([processedData]);

      if (error) throw error;
      setMessage({ type: "success", text: "Saved successfully!" });
      resetForms();
      fetchData();
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans text-gray-900">
      
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
             <h1 className="text-xl font-extrabold tracking-tight">Admin<span className="text-gray-400">Panel</span></h1>
             <button onClick={() => setSidebarOpen(false)} className="md:hidden"><CloseIcon /></button>
        </div>
        <nav className="p-4 space-y-2">
            <Link to="/" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-md transition mb-4"><HomeIcon className="mr-3 text-gray-400"/> Homepage</Link>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider px-4 mb-2">Content</div>
            <NavButton active={activeTab === "acts"} onClick={() => {setActiveTab("acts"); setSidebarOpen(false);}} icon={<MenuBookIcon className="mr-3"/>}>Acts</NavButton>
            <NavButton active={activeTab === "news"} onClick={() => {setActiveTab("news"); setSidebarOpen(false);}} icon={<NewspaperIcon className="mr-3"/>}>News</NavButton>
        </nav>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center gap-3">
             <button onClick={() => setSidebarOpen(true)}><MenuIcon /></button>
             <span className="font-bold">Dashboard</span>
        </div>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
            {message.text && (
                <div className="fixed top-4 right-4 z-50 animate-bounce">
                    <Alert severity={message.type} onClose={() => setMessage({ type: "", text: "" })}>{message.text}</Alert>
                </div>
            )}

            {activeTab === "acts" ? (
                <ActsManager 
                    formState={actForm} setFormState={setActForm} errors={errors.act} 
                    isEditing={isEditing} loading={loading} data={acts} 
                    handleSubmit={(e, contentStr) => handleGenericSubmit(e, actForm, 'act', contentStr)} 
                    handleEdit={(item) => { setActForm(item); setIsEditing(true); setCurrentEditId(item.id); }}
                    handleDelete={async (item) => { 
                        if(confirm("Delete?")) {
                            await supabase.from('acts').delete().eq('id', item.id);
                            fetchData();
                        }
                    }}
                    resetForm={resetForms}
                />
            ) : (
                <NewsManager 
                    formState={newsForm} setFormState={setNewsForm} errors={errors.news}
                    isEditing={isEditing} loading={loading} data={news}
                    handleSubmit={(e) => handleGenericSubmit(e, newsForm, 'news')}
                    handleEdit={(item) => { setNewsForm(item); setIsEditing(true); setCurrentEditId(item.id); }}
                    handleDelete={async (item) => { 
                        if(confirm("Delete?")) {
                            await supabase.from('news').delete().eq('id', item.id);
                            fetchData();
                        }
                    }}
                    resetForm={resetForms}
                />
            )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;