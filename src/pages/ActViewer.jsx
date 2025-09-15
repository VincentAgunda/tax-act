import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";

const ActViewer = () => {
  const { id } = useParams();
  const [act, setAct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

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
      } catch (error) {
        console.error("Error fetching act:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAct();
  }, [id]);

  const handleDownload = () => {
    if (!currentUser) {
      alert("You must be logged in to download acts.");
      return;
    }

    const blob = new Blob([act.content], { type: "text/html" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${act.title}.html`;
    link.click();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center text-lg font-medium text-gray-600">
        Loading Act...
      </div>
    );
  }

  if (!act) {
    return (
      <div className="container mx-auto px-4 py-12 text-center text-lg font-medium text-red-500">
        Act not found.
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Title */}
      <h1 className="text-4xl font-bold mb-6 text-gray-900">{act.title}</h1>

     {/* Tags */}
<div className="flex flex-wrap items-center gap-3 mb-6">
  <span className="bg-gray-100 border border-gray-300 text-gray-800 px-3 py-1 rounded-md text-sm font-medium">
    Version: {act.version}
  </span>
  <span className="bg-gray-100 border border-gray-300 text-black px-3 py-1 rounded-md text-sm font-medium">
    {act.status}
  </span>
</div>

      {/* Act Content */}
<div
  className="prose max-w-none border border-gray-200 shadow-sm rounded-xl p-6 mb-10"
  style={{ backgroundColor: "#f5f4f0" }}
  dangerouslySetInnerHTML={{ __html: act.content }}
/>


      {/* Version History */}
      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-3 text-gray-800">
          Version History
        </h2>
        <p className="text-gray-600">
          Version history would be displayed here.
        </p>
      </div>

      {/* Download Button */}
      <button
        onClick={handleDownload}
        className="bg-[#FFD600] hover:bg-yellow-400 text-black font-medium px-6 py-3 rounded-lg shadow-md transition-all"
      >
         Download Act
      </button>
    </div>
  );
};

export default ActViewer;
