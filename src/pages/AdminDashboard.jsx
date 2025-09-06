import React, { useState, useEffect } from "react";
import RichTextEditor from "../components/RichTextEditor";
import { 
  addAct, 
  addNews, 
  getAllActs, 
  getAllNews, 
  updateAct, 
  updateNews, 
  deleteAct, 
  deleteNews 
} from "../utils/firebaseUtils";
import { motion } from "framer-motion";

// Material UI Icons
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

// Animation variant consistent with Home.jsx
const fadeIn = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

// Reusable Sidebar Nav Button
const NavButton = ({ active, onClick, icon, children }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full text-left px-4 py-3 rounded-md transition ${
      active
        ? "bg-black text-white font-semibold"
        : "text-gray-800 hover:bg-gray-300"
    }`}
  >
    {icon}
    {children}
  </button>
);

// Reusable Inputs
const FormInput = ({ label, error, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      {...props}
      className={`block w-full p-3 bg-white border rounded-md focus:ring-2 focus:ring-gray-800 focus:border-transparent transition ${
        error ? "border-red-500" : "border-gray-300"
      }`}
    />
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

const FormTextarea = ({ label, error, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <textarea
      {...props}
      className={`block w-full p-3 bg-white border rounded-md focus:ring-2 focus:ring-gray-800 focus:border-transparent transition ${
        error ? "border-red-500" : "border-gray-300"
      }`}
    />
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

const FormSelect = ({ label, error, children, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <select
      {...props}
      className={`block w-full p-3 bg-white border rounded-md focus:ring-2 focus:ring-gray-800 focus:border-transparent transition ${
        error ? "border-red-500" : "border-gray-300"
      }`}
    >
      {children}
    </select>
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("acts");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [acts, setActs] = useState([]);
  const [news, setNews] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);

  const [actForm, setActForm] = useState({
    title: "",
    description: "",
    content: "",
    category: "",
    status: "Draft",
    version: "1.0.0",
  });

  // Updated news form to match act form structure
  const [newsForm, setNewsForm] = useState({
    title: "",
    description: "",
    content: "",
    category: "General",
    status: "Draft",
    version: "1.0.0",
  });

  const [errors, setErrors] = useState({
    act: {},
    news: {}
  });

  // Fetch data when component mounts or activeTab changes
  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "acts") {
        const actsData = await getAllActs();
        setActs(actsData);
      } else {
        const newsData = await getAllNews();
        setNews(newsData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setMessage({ type: "error", text: "Error fetching data" });
    } finally {
      setLoading(false);
    }
  };

  const validateActForm = () => {
    const newErrors = {};
    
    if (!actForm.title.trim()) newErrors.title = "Title is required";
    if (!actForm.description.trim()) newErrors.description = "Description is required";
    if (!actForm.content.trim() || actForm.content === "<p><br></p>") newErrors.content = "Content is required";
    if (!actForm.category) newErrors.category = "Category is required";
    
    setErrors(prev => ({ ...prev, act: newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  // Updated news validation to match act validation
  const validateNewsForm = () => {
    const newErrors = {};
    
    if (!newsForm.title.trim()) newErrors.title = "Title is required";
    if (!newsForm.description.trim()) newErrors.description = "Description is required";
    if (!newsForm.content.trim() || newsForm.content === "<p><br></p>") newErrors.content = "Content is required";
    if (!newsForm.category) newErrors.category = "Category is required";
    
    setErrors(prev => ({ ...prev, news: newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const resetForms = () => {
    setActForm({
      title: "",
      description: "",
      content: "",
      category: "",
      status: "Draft",
      version: "1.0.0",
    });
    // Updated news form reset to match act form
    setNewsForm({
      title: "",
      description: "",
      content: "",
      category: "General",
      status: "Draft",
      version: "1.0.0",
    });
    setIsEditing(false);
    setCurrentEditId(null);
  };

  const handleActSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateActForm()) {
      setMessage({ type: "error", text: "Please fix the errors in the form" });
      return;
    }
    
    setLoading(true);
    try {
      if (isEditing) {
        await updateAct(currentEditId, actForm);
        setMessage({ type: "success", text: "Act updated successfully!" });
      } else {
        await addAct(actForm);
        setMessage({ type: "success", text: "Act added successfully!" });
      }
      resetForms();
      fetchData();
    } catch (error) {
      console.error("Error saving act:", error);
      setMessage({ type: "error", text: "Error saving act. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleNewsSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateNewsForm()) {
      setMessage({ type: "error", text: "Please fix the errors in the form" });
      return;
    }
    
    setLoading(true);
    try {
      if (isEditing) {
        await updateNews(currentEditId, newsForm);
        setMessage({ type: "success", text: "News updated successfully!" });
      } else {
        await addNews(newsForm);
        setMessage({ type: "success", text: "News added successfully!" });
      }
      resetForms();
      fetchData();
    } catch (error) {
      console.error("Error saving news:", error);
      setMessage({ type: "error", text: "Error saving news. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleEditAct = (act) => {
    setActForm({
      title: act.title,
      description: act.description,
      content: act.content,
      category: act.category,
      status: act.status,
      version: act.version,
    });
    setIsEditing(true);
    setCurrentEditId(act.id);
    window.scrollTo(0, 0);
  };

  const handleEditNews = (newsItem) => {
    setNewsForm({
      title: newsItem.title,
      description: newsItem.description, // Changed from summary to description
      content: newsItem.content,
      category: newsItem.category,
      status: newsItem.status || "Draft", // Added status with default
      version: newsItem.version || "1.0.0", // Added version with default
    });
    setIsEditing(true);
    setCurrentEditId(newsItem.id);
    window.scrollTo(0, 0);
  };

  const handleDeleteAct = async (id) => {
    if (window.confirm("Are you sure you want to delete this act?")) {
      setLoading(true);
      try {
        await deleteAct(id);
        setMessage({ type: "success", text: "Act deleted successfully!" });
        fetchData();
      } catch (error) {
        console.error("Error deleting act:", error);
        setMessage({ type: "error", text: "Error deleting act. Please try again." });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteNews = async (id) => {
    if (window.confirm("Are you sure you want to delete this news article?")) {
      setLoading(true);
      try {
        await deleteNews(id);
        setMessage({ type: "success", text: "News deleted successfully!" });
        fetchData();
      } catch (error) {
        console.error("Error deleting news:", error);
        setMessage({ type: "error", text: "Error deleting news. Please try again." });
      } finally {
        setLoading(false);
      }
    }
  };

  const SidebarContent = () => (
    <>
      <h1 className="text-2xl font-bold mb-10 text-center text-black">Admin Panel</h1>
      <nav className="flex flex-col space-y-3">
        <NavButton
          active={activeTab === "acts"}
          onClick={() => {
            setActiveTab("acts");
            setSidebarOpen(false);
            setMessage({ type: "", text: "" });
            resetForms();
          }}
          icon={<MenuBookIcon className="mr-3" />}
        >
          Manage Acts
        </NavButton>
        <NavButton
          active={activeTab === "news"}
          onClick={() => {
            setActiveTab("news");
            setSidebarOpen(false);
            setMessage({ type: "", text: "" });
            resetForms();
          }}
          icon={<NewspaperIcon className="mr-3" />}
        >
          Manage News
        </NavButton>
      </nav>
    </>
  );

  return (
    <div className="flex min-h-screen bg-gray-50 text-black relative">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex w-64 bg-[#DDDDDD] text-black flex-col py-8 px-4 shadow-lg">
        <SidebarContent />
      </aside>

      {/* Mobile Topbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-[#DDDDDD] text-black flex items-center justify-between px-4 py-3 shadow z-30">
        <h1 className="text-xl font-bold">Admin Panel</h1>
        <button onClick={() => setSidebarOpen(true)} aria-label="Open menu">
          <MenuIcon />
        </button>
      </div>

      {/* Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative w-64 bg-[#DDDDDD] text-black flex flex-col py-8 px-4 shadow-lg z-50">
            <button
              className="absolute top-4 right-4"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close menu"
            >
              <CloseIcon />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto w-full mt-16 md:mt-0">
        {message.text && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 max-w-4xl mx-auto"
          >
            <Alert 
              severity={message.type === "error" ? "error" : "success"} 
              onClose={() => setMessage({ type: "", text: "" })}
            >
              {message.text}
            </Alert>
          </motion.div>
        )}
        
        {activeTab === "acts" && (
          <div className="max-w-4xl mx-auto">
            <motion.form
              key="acts-form"
              onSubmit={handleActSubmit}
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="bg-white rounded-lg shadow-md p-6 sm:p-8 space-y-6 mb-8"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-900">
                  {isEditing ? "Edit Act" : "Add New Act"}
                </h2>
                {isEditing && (
                  <button
                    type="button"
                    onClick={resetForms}
                    className="flex items-center bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md font-medium transition"
                  >
                    <AddIcon className="mr-2" />
                    Add New
                  </button>
                )}
              </div>
              <FormInput
                label="Title"
                type="text"
                value={actForm.title}
                error={errors.act.title}
                onChange={(e) => setActForm({ ...actForm, title: e.target.value })}
                required
              />
              <FormTextarea
                label="Description"
                rows="3"
                value={actForm.description}
                error={errors.act.description}
                onChange={(e) => setActForm({ ...actForm, description: e.target.value })}
                required
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormSelect
                  label="Category"
                  value={actForm.category}
                  error={errors.act.category}
                  onChange={(e) => setActForm({ ...actForm, category: e.target.value })}
                  required
                >
                  <option value="">Select a category</option>
                  <option value="Income Tax">Income Tax</option>
                  <option value="Corporate Tax">Corporate Tax</option>
                  <option value="Property Tax">Property Tax</option>
                  <option value="Sales Tax">Sales Tax</option>
                </FormSelect>
                <FormSelect
                  label="Status"
                  value={actForm.status}
                  onChange={(e) => setActForm({ ...actForm, status: e.target.value })}
                  required
                >
                  <option value="Draft">Draft</option>
                  <option value="Active">Active</option>
                  <option value="Archived">Archived</option>
                </FormSelect>
                <FormInput
                  label="Version"
                  type="text"
                  value={actForm.version}
                  onChange={(e) => setActForm({ ...actForm, version: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content {errors.act.content && <span className="text-red-600">- {errors.act.content}</span>}
                </label>
                <RichTextEditor
                  value={actForm.content}
                  onChange={(content) => setActForm({ ...actForm, content })}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-md font-semibold w-full md:w-auto transition disabled:opacity-70"
              >
                {loading ? <CircularProgress size={24} className="text-white" /> : (
                  <>
                    <SaveIcon className="mr-2" />
                    {isEditing ? "Update Act" : "Add Act"}
                  </>
                )}
              </button>
            </motion.form>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="bg-white rounded-lg shadow-md p-6 sm:p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Existing Acts</h2>
              {loading ? (
                <div className="flex justify-center py-8">
                  <CircularProgress />
                </div>
              ) : acts.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No acts found. Add your first act above.</p>
              ) : (
                <div className="space-y-4">
                  {acts.map((act) => (
                    <div key={act.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold">{act.title}</h3>
                          <p className="text-gray-600 text-sm">{act.category} • {act.status} • v{act.version}</p>
                          <p className="text-gray-700 mt-2 line-clamp-2">{act.description}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditAct(act)}
                            className="text-blue-600 hover:text-blue-800 transition"
                            aria-label="Edit"
                          >
                            <EditIcon />
                          </button>
                          <button
                            onClick={() => handleDeleteAct(act.id)}
                            className="text-red-600 hover:text-red-800 transition"
                            aria-label="Delete"
                          >
                            <DeleteIcon />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}

        {activeTab === "news" && (
          <div className="max-w-4xl mx-auto">
            <motion.form
              key="news-form"
              onSubmit={handleNewsSubmit}
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="bg-white rounded-lg shadow-md p-6 sm:p-8 space-y-6 mb-8"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-900">
                  {isEditing ? "Edit News Article" : "Add News Article"}
                </h2>
                {isEditing && (
                  <button
                    type="button"
                    onClick={resetForms}
                    className="flex items-center bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md font-medium transition"
                  >
                    <AddIcon className="mr-2" />
                    Add New
                  </button>
                )}
              </div>
              <FormInput
                label="Title"
                type="text"
                value={newsForm.title}
                error={errors.news.title}
                onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                required
              />
              <FormTextarea
                label="Description"
                rows="3"
                value={newsForm.description}
                error={errors.news.description}
                onChange={(e) => setNewsForm({ ...newsForm, description: e.target.value })}
                required
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormSelect
                  label="Category"
                  value={newsForm.category}
                  error={errors.news.category}
                  onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value })}
                  required
                >
                  <option value="">Select a category</option>
                  <option value="Tax News">Tax News</option>
                  <option value="Legislation Update">Legislation Update</option>
                  <option value="Event">Event</option>
                  <option value="General">General</option>
                </FormSelect>
                <FormSelect
                  label="Status"
                  value={newsForm.status}
                  onChange={(e) => setNewsForm({ ...newsForm, status: e.target.value })}
                  required
                >
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                  <option value="Archived">Archived</option>
                </FormSelect>
                <FormInput
                  label="Version"
                  type="text"
                  value={newsForm.version}
                  onChange={(e) => setNewsForm({ ...newsForm, version: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content {errors.news.content && <span className="text-red-600">- {errors.news.content}</span>}
                </label>
                <RichTextEditor
                  value={newsForm.content}
                  onChange={(content) => setNewsForm({ ...newsForm, content })}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-md font-semibold w-full md:w-auto transition disabled:opacity-70"
              >
                {loading ? <CircularProgress size={24} className="text-white" /> : (
                  <>
                    <SaveIcon className="mr-2" />
                    {isEditing ? "Update News" : "Add News"}
                  </>
                )}
              </button>
            </motion.form>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="bg-white rounded-lg shadow-md p-6 sm:p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Existing News Articles</h2>
              {loading ? (
                <div className="flex justify-center py-8">
                  <CircularProgress />
                </div>
              ) : news.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No news articles found. Add your first news article above.</p>
              ) : (
                <div className="space-y-4">
                  {news.map((newsItem) => (
                    <div key={newsItem.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold">{newsItem.title}</h3>
                          <p className="text-gray-600 text-sm">{newsItem.category} • {newsItem.status || "Draft"} • v{newsItem.version || "1.0.0"}</p>
                          <p className="text-gray-700 mt-2 line-clamp-2">{newsItem.description}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditNews(newsItem)}
                            className="text-blue-600 hover:text-blue-800 transition"
                            aria-label="Edit"
                          >
                            <EditIcon />
                          </button>
                          <button
                            onClick={() => handleDeleteNews(newsItem.id)}
                            className="text-red-600 hover:text-red-800 transition"
                            aria-label="Delete"
                          >
                            <DeleteIcon />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;