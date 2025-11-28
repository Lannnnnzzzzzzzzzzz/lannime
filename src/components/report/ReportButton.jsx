import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../config/supabase';
import { FaFlag } from 'react-icons/fa';

export default function ReportButton({ animeId, episodeId }) {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [reportType, setReportType] = useState('broken_video');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert('Please login to submit a report');
      return;
    }

    setLoading(true);

    const { error } = await supabase.from('user_reports').insert({
      reporter_id: user.id,
      report_type: reportType,
      anime_id: animeId,
      episode_id: episodeId || null,
      description,
    });

    if (error) {
      alert('Error submitting report: ' + error.message);
    } else {
      alert('Report submitted successfully! Thank you.');
      setShowModal(false);
      setDescription('');
    }

    setLoading(false);
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white font-semibold transition"
      >
        <FaFlag />
        Report Issue
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a2e] rounded-lg p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Report Issue</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Issue Type</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full px-4 py-2 bg-[#16213e] text-white rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
                  required
                >
                  <option value="broken_video">Broken Video</option>
                  <option value="broken_link">Broken Link</option>
                  <option value="inappropriate_content">Inappropriate Content</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-gray-300 mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 bg-[#16213e] text-white rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
                  rows={4}
                  placeholder="Please describe the issue..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-3 rounded transition"
              >
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
