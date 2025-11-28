import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../config/supabase';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaFlag, FaChartBar, FaExclamationTriangle } from 'react-icons/fa';

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalReports: 0,
    pendingReports: 0,
  });

  useEffect(() => {
    if (user) {
      checkAdmin();
    } else {
      navigate('/');
    }
  }, [user]);

  const checkAdmin = async () => {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error || !data) {
      alert('Access denied. Admin only.');
      navigate('/');
      return;
    }

    setIsAdmin(true);
    fetchReports();
    fetchStats();
    setLoading(false);
  };

  const fetchReports = async () => {
    const { data } = await supabase
      .from('user_reports')
      .select('*, user_profiles(username)')
      .order('created_at', { ascending: false })
      .limit(50);

    if (data) {
      setReports(data);
    }
  };

  const fetchStats = async () => {
    const { count: userCount } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });

    const { count: reportCount } = await supabase
      .from('user_reports')
      .select('*', { count: 'exact', head: true });

    const { count: pendingCount } = await supabase
      .from('user_reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    setStats({
      totalUsers: userCount || 0,
      totalReports: reportCount || 0,
      pendingReports: pendingCount || 0,
    });
  };

  const updateReportStatus = async (reportId, status, notes = '') => {
    await supabase
      .from('user_reports')
      .update({
        status,
        admin_notes: notes,
        resolved_by: user.id,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', reportId);

    await supabase.from('admin_logs').insert({
      admin_id: user.id,
      action: 'update_report_status',
      target_type: 'report',
      target_id: reportId,
      details: { status, notes },
    });

    fetchReports();
    fetchStats();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f1e] pt-24 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0f0f1e] pt-24 px-4 pb-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#1a1a2e] rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <FaUsers className="text-2xl text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Users</p>
                <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#1a1a2e] rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center">
                <FaFlag className="text-2xl text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Reports</p>
                <p className="text-3xl font-bold text-white">{stats.totalReports}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#1a1a2e] rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                <FaExclamationTriangle className="text-2xl text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Pending Reports</p>
                <p className="text-3xl font-bold text-white">{stats.pendingReports}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#1a1a2e] rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-6">User Reports</h2>

          {reports.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No reports yet</p>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="bg-[#16213e] rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={`px-3 py-1 rounded text-sm font-semibold ${
                            report.status === 'pending'
                              ? 'bg-yellow-600 text-white'
                              : report.status === 'in_progress'
                              ? 'bg-blue-600 text-white'
                              : report.status === 'resolved'
                              ? 'bg-green-600 text-white'
                              : 'bg-red-600 text-white'
                          }`}
                        >
                          {report.status}
                        </span>
                        <span className="text-gray-400 text-sm">
                          {new Date(report.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-white font-semibold mb-1">
                        {report.report_type.replace('_', ' ').toUpperCase()}
                      </p>
                      <p className="text-gray-300 text-sm">
                        Reported by: {report.user_profiles?.username || 'Unknown'}
                      </p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-gray-400 text-sm mb-1">Description:</p>
                    <p className="text-white">{report.description}</p>
                  </div>

                  {report.anime_id && (
                    <p className="text-gray-400 text-sm mb-3">
                      Anime ID: {report.anime_id}
                      {report.episode_id && ` | Episode ID: ${report.episode_id}`}
                    </p>
                  )}

                  {report.admin_notes && (
                    <div className="mb-3 p-3 bg-[#1a1a2e] rounded">
                      <p className="text-gray-400 text-sm mb-1">Admin Notes:</p>
                      <p className="text-white">{report.admin_notes}</p>
                    </div>
                  )}

                  {report.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateReportStatus(report.id, 'in_progress')}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm"
                      >
                        In Progress
                      </button>
                      <button
                        onClick={() => {
                          const notes = prompt('Add resolution notes:');
                          if (notes) {
                            updateReportStatus(report.id, 'resolved', notes);
                          }
                        }}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white text-sm"
                      >
                        Resolve
                      </button>
                      <button
                        onClick={() => {
                          const notes = prompt('Add rejection reason:');
                          if (notes) {
                            updateReportStatus(report.id, 'rejected', notes);
                          }
                        }}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white text-sm"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
