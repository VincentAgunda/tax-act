import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getAct } from '../utils/firebaseUtils';
import { useAuth } from '../context/AuthContext';



const ActViewer = () => {
  const { id } = useParams();
  const [act, setAct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchAct = async () => {
      try {
        const actData = await getAct(id);
        setAct(actData);
      } catch (error) {
        console.error('Error fetching act:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAct();
  }, [id]);

  const handleDownload = () => {
    if (!currentUser) {
      alert('You must be logged in to download acts.');
      return;
    }

    // Implement download logic here
    // This could be a download link or a function to generate a PDF
    alert('Download functionality would be implemented here.');
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (!act) {
    return <div className="container mx-auto px-4 py-8">Act not found.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{act.title}</h1>
      <div className="mb-4">
        <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-sm">
          Version: {act.version}
        </span>
        <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-sm ml-2">
          {act.status}
        </span>
      </div>

      <div className="prose max-w-none mb-8" dangerouslySetInnerHTML={{ __html: act.content }} />

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Version History</h2>
        {/* Here you would map through the version history */}
        <p>Version history would be displayed here.</p>
      </div>

      <button
        onClick={handleDownload}
        className="bg-light-blue hover:bg-light-blue-2 text-black px-4 py-2 rounded"
      >
        Download Act
      </button>
    </div>
  );
};

export default ActViewer;