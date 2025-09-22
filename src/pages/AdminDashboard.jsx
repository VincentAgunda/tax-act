import { supabase } from '../supabaseClient';
import React, { useState, useEffect, memo } from "react";
import RichTextEditor from "../components/RichTextEditor";
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import NewspaperIcon from "@mui/icons-material/Newspaper";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import VisibilityIcon from '@mui/icons-material/Visibility';
import HomeIcon from '@mui/icons-material/Home';

// --- Reusable, Memoized Components for Performance ---

const fadeIn = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const NavButton = memo(({ active, onClick, icon, children }) => (
  <button onClick={onClick} className={`flex items-center w-full text-left px-4 py-3 rounded-md transition ${
    active ? "bg-black text-white font-semibold" : "text-gray-800 hover:bg-gray-300"
  }`}>
    {icon}
    {children}
  </button>
));

const FormInput = memo(({ label, error, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input {...props} className={`block w-full p-3 bg-white border rounded-md focus:ring-2 focus:ring-gray-800 focus:border-transparent transition ${error ? "border-red-500" : "border-gray-300"}`} />
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
));

const FormTextarea = memo(({ label, error, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <textarea {...props} className={`block w-full p-3 bg-white border rounded-md focus:ring-2 focus:ring-gray-800 focus:border-transparent transition ${error ? "border-red-500" : "border-gray-300"}`} />
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
));

const FormSelect = memo(({ label, error, children, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <select {...props} className={`block w-full p-3 bg-white border rounded-md focus:ring-2 focus:ring-gray-800 focus:border-transparent transition ${error ? "border-red-500" : "border-gray-300"}`}>
      {children}
    </select>
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
));

const FileUpload = memo(({ label, error, onChange, accept }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type="file" accept={accept} onChange={onChange} className={`block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-800 hover:file:bg-gray-200 transition ${error ? "border-red-500" : "border-gray-300"}`} />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
));

const PdfCard = memo(({ pdf, onEdit, onDelete }) => {
  const [showPreview, setShowPreview] = useState(false);
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{pdf.title}</h3>
          <div className="flex space-x-2">
            <button onClick={() => onEdit(pdf)} className="text-blue-600 hover:text-blue-800 transition p-1 rounded-full hover:bg-blue-50" aria-label="Edit"><EditIcon fontSize="small" /></button>
            <button onClick={() => onDelete(pdf)} className="text-red-600 hover:text-red-800 transition p-1 rounded-full hover:bg-red-50" aria-label="Delete"><DeleteIcon fontSize="small" /></button>
          </div>
        </div>
        <p className="text-gray-600 text-sm mb-2">{pdf.category} • {pdf.status} • v{pdf.version}</p>
        <p className="text-gray-700 mb-4 line-clamp-2">{pdf.description}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          <a href={pdf.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 bg-blue-50 rounded-full transition"><VisibilityIcon fontSize="small" className="mr-1" />View</a>
          <button onClick={() => setShowPreview(!showPreview)} className="text-gray-600 hover:text-gray-800 text-sm font-medium px-3 py-1 bg-gray-100 rounded-full transition">{showPreview ? 'Hide Preview' : 'Show Preview'}</button>
        </div>
      </div>
      {showPreview && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <iframe src={pdf.file_url} className="w-full h-64 rounded border border-gray-300" title={`Preview of ${pdf.title}`} />
        </div>
      )}
    </motion.div>
  );
});


// --- Tab-Specific UI Components ---

const ActsManager = ({ formState, setFormState, errors, isEditing, loading, data, handleSubmit, handleEdit, handleDelete, resetForm }) => (
    <div className="max-w-4xl mx-auto">
      <motion.form key="acts-form" onSubmit={handleSubmit} initial="hidden" animate="visible" variants={fadeIn} className="bg-white rounded-lg shadow-md p-4 sm:p-6 md:p-8 space-y-6 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{isEditing ? "Edit Act" : "Add New Act"}</h2>
          {isEditing && (
            <button type="button" onClick={resetForm} className="flex items-center bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md font-medium transition">
              <AddIcon className="mr-2" />Add New
            </button>
          )}
        </div>
        <FormInput label="Title" type="text" value={formState.title} error={errors.title} onChange={(e) => setFormState({ ...formState, title: e.target.value })} required />
        <FormTextarea label="Description" rows="3" value={formState.description} error={errors.description} onChange={(e) => setFormState({ ...formState, description: e.target.value })} required />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          <FormSelect label="Category" value={formState.category} error={errors.category} onChange={(e) => setFormState({ ...formState, category: e.target.value })} required>
            <option value="">Select a category</option>
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
          <FormInput label="Version" type="text" value={formState.version} onChange={(e) => setFormState({ ...formState, version: e.target.value })} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Content {errors.content && <span className="text-red-600">- {errors.content}</span>}</label>
          <RichTextEditor value={formState.content} onChange={(content) => setFormState({ ...formState, content })} />
        </div>
        <button type="submit" disabled={loading} className="flex items-center justify-center bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-md font-semibold w-full md:w-auto transition disabled:opacity-70">
          {loading ? <CircularProgress size={24} color="inherit" /> : <><SaveIcon className="mr-2" />{isEditing ? "Update Act" : "Add Act"}</>}
        </button>
      </motion.form>
      <motion.div initial="hidden" animate="visible" variants={fadeIn} className="bg-white rounded-lg shadow-md p-4 sm:p-6 md:p-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Existing Acts</h2>
        {data.length === 0 && !loading ? <p className="text-gray-500 text-center py-8">No acts found. Add your first act above.</p> : (
          <div className="space-y-4">
            {data.map((act) => (
              <div key={act.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{act.title}</h3>
                    <p className="text-gray-600 text-sm">{act.category} • {act.status} • v{act.version}</p>
                    <p className="text-gray-700 mt-2 line-clamp-2">{act.description}</p>
                  </div>
                  <div className="flex space-x-2 self-end sm:self-auto">
                    <button onClick={() => handleEdit(act)} className="text-blue-600 hover:text-blue-800 transition p-1" aria-label="Edit"><EditIcon /></button>
                    <button onClick={() => handleDelete(act)} className="text-red-600 hover:text-red-800 transition p-1" aria-label="Delete"><DeleteIcon /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
);

const NewsManager = ({ formState, setFormState, errors, isEditing, loading, data, handleSubmit, handleEdit, handleDelete, resetForm }) => (
    <div className="max-w-4xl mx-auto">
      <motion.form key="news-form" onSubmit={handleSubmit} initial="hidden" animate="visible" variants={fadeIn} className="bg-white rounded-lg shadow-md p-4 sm:p-6 md:p-8 space-y-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{isEditing ? "Edit News Article" : "Add News Article"}</h2>
              {isEditing && (
                  <button type="button" onClick={resetForm} className="flex items-center bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md font-medium transition">
                      <AddIcon className="mr-2" />Add New
                  </button>
              )}
          </div>
          <FormInput label="Title" type="text" value={formState.title} error={errors.title} onChange={(e) => setFormState({ ...formState, title: e.target.value })} required />
          <FormTextarea label="Description" rows="3" value={formState.description} error={errors.description} onChange={(e) => setFormState({ ...formState, description: e.target.value })} required />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              <FormSelect label="Category" value={formState.category} error={errors.category} onChange={(e) => setFormState({ ...formState, category: e.target.value })} required>
                  <option value="">Select a category</option>
                  <option value="Tax News">Tax News</option>
                  <option value="Legislation Update">Legislation Update</option>
                  <option value="Event">Event</option>
                  <option value="General">General</option>
              </FormSelect>
              <FormSelect label="Status" value={formState.status} onChange={(e) => setFormState({ ...formState, status: e.target.value })} required>
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                  <option value="Archived">Archived</option>
              </FormSelect>
              <FormInput label="Version" type="text" value={formState.version} onChange={(e) => setFormState({ ...formState, version: e.target.value })} required />
          </div>
          <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content {errors.content && <span className="text-red-600">- {errors.content}</span>}</label>
              <RichTextEditor value={formState.content} onChange={(content) => setFormState({ ...formState, content })} />
          </div>
          <button type="submit" disabled={loading} className="flex items-center justify-center bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-md font-semibold w-full md:w-auto transition disabled:opacity-70">
              {loading ? <CircularProgress size={24} color="inherit" /> : <><SaveIcon className="mr-2" />{isEditing ? "Update News" : "Add News"}</>}
          </button>
      </motion.form>
      <motion.div initial="hidden" animate="visible" variants={fadeIn} className="bg-white rounded-lg shadow-md p-4 sm:p-6 md:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Existing News Articles</h2>
          {data.length === 0 && !loading ? <p className="text-gray-500 text-center py-8">No news articles found.</p> : (
              <div className="space-y-4">
                  {data.map((newsItem) => (
                      <div key={newsItem.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                              <div className="flex-1">
                                  <h3 className="text-lg font-semibold">{newsItem.title}</h3>
                                  <p className="text-gray-600 text-sm">{newsItem.category} • {newsItem.status} • v{newsItem.version}</p>
                                  <p className="text-gray-700 mt-2 line-clamp-2">{newsItem.description}</p>
                              </div>
                              <div className="flex space-x-2 self-end sm:self-auto">
                                  <button onClick={() => handleEdit(newsItem)} className="text-blue-600 hover:text-blue-800 transition p-1" aria-label="Edit"><EditIcon /></button>
                                  <button onClick={() => handleDelete(newsItem)} className="text-red-600 hover:text-red-800 transition p-1" aria-label="Delete"><DeleteIcon /></button>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          )}
      </motion.div>
    </div>
);

const PdfsManager = ({ formState, setFormState, errors, isEditing, loading, data, handleSubmit, handleEdit, handleDelete, resetForm, handleFileChange }) => (
    <div className="max-w-6xl mx-auto">
      <motion.form key="pdfs-form" onSubmit={handleSubmit} initial="hidden" animate="visible" variants={fadeIn} className="bg-white rounded-lg shadow-md p-4 sm:p-6 md:p-8 space-y-6 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{isEditing ? "Edit PDF" : "Add New PDF"}</h2>
          {isEditing && (
            <button type="button" onClick={resetForm} className="flex items-center bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md font-medium transition">
              <AddIcon className="mr-2" />Add New
            </button>
          )}
        </div>
        <FormInput label="Title" type="text" value={formState.title} error={errors.title} onChange={(e) => setFormState({ ...formState, title: e.target.value })} required />
        <FormTextarea label="Description" rows="3" value={formState.description} error={errors.description} onChange={(e) => setFormState({ ...formState, description: e.target.value })} required />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          <FormSelect label="Category" value={formState.category} error={errors.category} onChange={(e) => setFormState({ ...formState, category: e.target.value })} required>
            <option value="">Select a category</option>
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
          <FormInput label="Version" type="text" value={formState.version} onChange={(e) => setFormState({ ...formState, version: e.target.value })} required />
        </div>
        <FileUpload label="PDF File" accept=".pdf" error={errors.file} onChange={handleFileChange} />
        {isEditing && formState.file_url && (
          <div className="mt-2"><p className="text-sm text-gray-600">Current file: <a href={formState.file_url} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 hover:underline">View PDF</a></p></div>
        )}
        <button type="submit" disabled={loading} className="flex items-center justify-center bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-md font-semibold w-full md:w-auto transition disabled:opacity-70">
          {loading ? <CircularProgress size={24} color="inherit" /> : <><SaveIcon className="mr-2" />{isEditing ? "Update PDF" : "Add PDF"}</>}
        </button>
      </motion.form>
      <motion.div initial="hidden" animate="visible" variants={fadeIn} className="bg-white rounded-lg shadow-md p-4 sm:p-6 md:p-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Existing PDFs</h2>
        {data.length === 0 && !loading ? <p className="text-gray-500 text-center py-8">No PDFs found.</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {data.map((pdf) => (
              <PdfCard key={pdf.id} pdf={pdf} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </motion.div>
    </div>
);


// --- Main Dashboard Component ---

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("acts");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [acts, setActs] = useState([]);
  const [news, setNews] = useState([]);
  const [pdfs, setPdfs] = useState([]);

  const [isEditing, setIsEditing] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);

  const [actForm, setActForm] = useState({ title: "", description: "", content: "", category: "", status: "Draft", version: "1.0.0" });
  const [newsForm, setNewsForm] = useState({ title: "", description: "", content: "", category: "General", status: "Draft", version: "1.0.0" });
  const [pdfForm, setPdfForm] = useState({ title: "", description: "", category: "", status: "Draft", version: "1.0.0", file: null });
  const [errors, setErrors] = useState({ act: {}, news: {}, pdf: {} });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // --- FIX APPLIED HERE ---
      const tableName = activeTab; // "acts", "news", or "pdfs" - This is correct as activeTab holds the correct table name.
      const { data, error } = await supabase.from(tableName).select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (tableName === "acts") setActs(data);
      if (tableName === "news") setNews(data);
      if (tableName === "pdfs") setPdfs(data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setMessage({ type: "error", text: `Error fetching ${activeTab}: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const uploadFileToSupabase = async (file) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;
      const { error: uploadError } = await supabase.storage.from('pdfs').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('pdfs').getPublicUrl(filePath);
      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      setMessage({ type: "error", text: error.message || "Error uploading file." });
      throw error;
    }
  };

  const deleteFileFromSupabase = async (fileUrl) => {
    try {
      const filePath = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
      const { error } = await supabase.storage.from('pdfs').remove([filePath]);
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting file:', error);
      setMessage({ type: "error", text: "Error deleting file." });
      throw error;
    }
  };

  const validateForm = (form, type) => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.description.trim()) newErrors.description = "Description is required";
    if (!form.category) newErrors.category = "Category is required";
    if ((type === 'act' || type === 'news') && (!form.content.trim() || form.content === "<p><br></p>")) newErrors.content = "Content is required";
    if (type === 'pdf' && !form.file && !isEditing) newErrors.file = "PDF file is required";
    setErrors(prev => ({ ...prev, [type]: newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const resetForms = () => {
    setActForm({ title: "", description: "", content: "", category: "", status: "Draft", version: "1.0.0" });
    setNewsForm({ title: "", description: "", content: "", category: "General", status: "Draft", version: "1.0.0" });
    setPdfForm({ title: "", description: "", category: "", status: "Draft", version: "1.0.0", file: null });
    setIsEditing(false);
    setCurrentEditId(null);
    setErrors({ act: {}, news: {}, pdf: {} });
  };

  const handleGenericSubmit = async (form, type, dataProcessor = (d) => d) => {
    if (!validateForm(form, type)) return;
    setLoading(true);
    try {
      const processedData = await dataProcessor(form);
      
      // --- FIX APPLIED HERE ---
      let tableName;
      if (type === 'news') {
        tableName = 'news'; // Use 'news' directly
      } else {
        tableName = `${type}s`; // Add 's' for 'act' and 'pdf'
      }

      const { error } = isEditing
        ? await supabase.from(tableName).update(processedData).eq('id', currentEditId)
        : await supabase.from(tableName).insert([processedData]);
      if (error) throw error;
      setMessage({ type: "success", text: `${type.charAt(0).toUpperCase() + type.slice(1)} ${isEditing ? 'updated' : 'added'} successfully!` });
      resetForms();
      fetchData();
    } catch (error) {
      console.error(`Error saving ${type}:`, error);
      setMessage({ type: "error", text: `Error saving ${type}: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleActSubmit = (e) => { e.preventDefault(); handleGenericSubmit(actForm, 'act'); };
  const handleNewsSubmit = (e) => { e.preventDefault(); handleGenericSubmit(newsForm, 'news'); };
  const handlePdfSubmit = async (e) => {
    e.preventDefault();
    handleGenericSubmit(pdfForm, 'pdf', async (formData) => {
      let fileUrl = formData.file_url;
      if (formData.file) {
        if (isEditing && formData.file_url) await deleteFileFromSupabase(formData.file_url);
        fileUrl = await uploadFileToSupabase(formData.file);
      }
      const { file, ...dbData } = formData;
      return { ...dbData, file_url: fileUrl };
    });
  };

  const handleEdit = (item, type) => {
    if (type === 'act') setActForm(item);
    else if (type === 'news') setNewsForm(item);
    else if (type === 'pdf') setPdfForm({ ...item, file: null });
    setIsEditing(true);
    setCurrentEditId(item.id);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (item, type) => {
    if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
      setLoading(true);
      try {
        if (type === 'pdf' && item.file_url) await deleteFileFromSupabase(item.file_url);

        // --- FIX APPLIED HERE ---
        let tableName;
        if (type === 'news') {
          tableName = 'news'; // Use 'news' directly
        } else {
          tableName = `${type}s`; // Add 's' for 'act' and 'pdf'
        }

        const { error } = await supabase.from(tableName).delete().eq('id', item.id);
        if (error) throw error;
        setMessage({ type: "success", text: `${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully!` });
        fetchData();
      } catch (error) {
        console.error(`Error deleting ${type}:`, error);
        setMessage({ type: "error", text: `Error deleting ${type}: ${error.message}` });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfForm({ ...pdfForm, file });
      setErrors(prev => ({ ...prev, pdf: { ...prev.pdf, file: null } }));
    } else {
      setErrors(prev => ({ ...prev, pdf: { ...prev.pdf, file: "Please select a valid PDF file" } }));
    }
  };

  const SidebarContent = () => (
    <>
      <h1 className="text-2xl font-bold mb-10 text-center text-black">Admin Panel</h1>
      <nav className="flex flex-col space-y-3">
        <Link to="/" className="flex items-center w-full text-left px-4 py-3 rounded-md transition text-gray-800 hover:bg-gray-300">
          <HomeIcon className="mr-3" /> Go to Homepage
        </Link>
        <hr className="my-2 border-gray-400" />
        <NavButton active={activeTab === "acts"} onClick={() => { setActiveTab("acts"); setSidebarOpen(false); resetForms(); }} icon={<MenuBookIcon className="mr-3" />}>Manage Acts</NavButton>
        <NavButton active={activeTab === "news"} onClick={() => { setActiveTab("news"); setSidebarOpen(false); resetForms(); }} icon={<NewspaperIcon className="mr-3" />}>Manage News</NavButton>
        <NavButton active={activeTab === "pdfs"} onClick={() => { setActiveTab("pdfs"); setSidebarOpen(false); resetForms(); }} icon={<PictureAsPdfIcon className="mr-3" />}>Manage PDFs</NavButton>
      </nav>
    </>
  );

  return (
    <div className="flex min-h-screen bg-gray-50 text-black relative">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-[#DDDDDD] text-black flex-col py-8 px-4 shadow-lg">
        <SidebarContent />
      </aside>
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-gray-800 text-white flex items-center justify-between px-4 py-4 shadow-lg z-50">
        <h1 className="text-xl font-bold">Admin Panel</h1>
        <button onClick={() => setSidebarOpen(true)} aria-label="Open menu" className="p-2 bg-white text-gray-800 rounded-md shadow-sm hover:bg-gray-100 transition"><MenuIcon /></button>
      </div>

      {/* Animated Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 flex md:hidden">
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/60"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              key="sidebar"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative w-64 bg-[#DDDDDD] text-black flex flex-col py-8 px-4 shadow-lg z-50"
            >
              <button className="absolute top-4 right-4 p-1 bg-gray-200 rounded-full" onClick={() => setSidebarOpen(false)} aria-label="Close menu"><CloseIcon /></button>
              <SidebarContent />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
      
      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 md:p-10 overflow-y-auto w-full mt-16 md:mt-0">
        {message.text && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 max-w-6xl mx-auto">
            <Alert severity={message.type} onClose={() => setMessage({ type: "", text: "" })}>{message.text}</Alert>
          </motion.div>
        )}
        {activeTab === "acts" && (
          <ActsManager
            formState={actForm} setFormState={setActForm} errors={errors.act} isEditing={isEditing} loading={loading}
            data={acts} handleSubmit={handleActSubmit}
            handleEdit={(item) => handleEdit(item, 'act')}
            handleDelete={(item) => handleDelete(item, 'act')}
            resetForm={resetForms}
          />
        )}
        {activeTab === "news" && (
          <NewsManager
            formState={newsForm} setFormState={setNewsForm} errors={errors.news} isEditing={isEditing} loading={loading}
            data={news} handleSubmit={handleNewsSubmit}
            handleEdit={(item) => handleEdit(item, 'news')}
            handleDelete={(item) => handleDelete(item, 'news')}
            resetForm={resetForms}
          />
        )}
        {activeTab === "pdfs" && (
          <PdfsManager
            formState={pdfForm} setFormState={setPdfForm} errors={errors.pdf} isEditing={isEditing} loading={loading}
            data={pdfs} handleSubmit={handlePdfSubmit}
            handleEdit={(item) => handleEdit(item, 'pdf')}
            handleDelete={(item) => handleDelete(item, 'pdf')}
            resetForm={resetForms} handleFileChange={handleFileChange}
          />
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;