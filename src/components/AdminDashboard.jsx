import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { API_ENDPOINTS } from '../config/api';
import { adminAuthenticatedFetch, clearAdminAuth, getAdmin } from '../utils/adminAuth';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [emailSignups, setEmailSignups] = useState([]);
  const [preOrders, setPreOrders] = useState([]);
  const [bookPreviews, setBookPreviews] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [users, setUsers] = useState([]);
  const [weeklyContent, setWeeklyContent] = useState({});
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [endorsements, setEndorsements] = useState([]);
  const [editingEndorsement, setEditingEndorsement] = useState(null);
  const [siteSettings, setSiteSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    loadAdminInfo();
    loadOverview();
  }, []);

  useEffect(() => {
    if (activeTab === 'signups') loadEmailSignups();
    if (activeTab === 'preorders') loadPreOrders();
    if (activeTab === 'previews') loadBookPreviews();
    if (activeTab === 'feedback') loadFeedback();
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'weekly-content') loadWeeklyContent();
    if (activeTab === 'endorsements') loadEndorsements();
    if (activeTab === 'settings') loadSiteSettings();
  }, [activeTab]);

  const loadAdminInfo = () => {
    const adminData = getAdmin();
    setAdmin(adminData);
  };

  const loadOverview = async () => {
    setLoading(true);
    try {
      const response = await adminAuthenticatedFetch(API_ENDPOINTS.ADMIN_STATS);
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEmailSignups = async () => {
    try {
      const response = await adminAuthenticatedFetch(API_ENDPOINTS.ADMIN_EMAIL_SIGNUPS);
      if (response.ok) {
        const data = await response.json();
        setEmailSignups(data.signups || []);
      }
    } catch (error) {
      console.error('Error loading email signups:', error);
    }
  };

  const loadPreOrders = async () => {
    try {
      const response = await adminAuthenticatedFetch(API_ENDPOINTS.ADMIN_PRE_ORDERS);
      if (response.ok) {
        const data = await response.json();
        setPreOrders(data.preOrders || []);
      }
    } catch (error) {
      console.error('Error loading pre-orders:', error);
    }
  };

  const loadBookPreviews = async () => {
    try {
      const response = await adminAuthenticatedFetch(API_ENDPOINTS.ADMIN_BOOK_PREVIEWS);
      if (response.ok) {
        const data = await response.json();
        setBookPreviews(data.previews || []);
      }
    } catch (error) {
      console.error('Error loading book previews:', error);
    }
  };

  const loadFeedback = async () => {
    try {
      const response = await adminAuthenticatedFetch(API_ENDPOINTS.ADMIN_FEEDBACK);
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          setFeedback(data.feedback || []);
        } else {
          const text = await response.text();
          console.error('Expected JSON but got:', text.substring(0, 100));
          alert('Error: Server returned invalid response. Please make sure the server has been restarted.');
        }
      } else {
        const errorText = await response.text();
        console.error('Error loading feedback:', response.status, errorText);
        if (response.status === 404) {
          alert('Feedback endpoint not found. Please restart the server to load the new endpoints.');
        }
      }
    } catch (error) {
      console.error('Error loading feedback:', error);
      alert('Error loading feedback: ' + error.message);
    }
  };

  const loadEndorsements = async () => {
    try {
      const response = await adminAuthenticatedFetch(API_ENDPOINTS.ADMIN_ENDORSEMENTS);
      if (response.ok) {
        const data = await response.json();
        // Show all endorsements (both approved and unapproved)
        const allEndorsements = data.endorsements || [];
        
        // Filter to only show pastoral endorsements in this tab
        // Also include items without a type field (for backward compatibility)
        const pastoralOnly = allEndorsements.filter(e => {
          return e.type === 'pastoral' || !e.type;
        });
        
        // Sort by created date (newest first) so new submissions appear at the top
        pastoralOnly.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.created_at || 0);
          const dateB = new Date(b.createdAt || b.created_at || 0);
          return dateB - dateA;
        });
        
        setEndorsements(pastoralOnly);
      } else {
        const errorText = await response.text();
        console.error('Error loading endorsements:', response.status, errorText);
      }
    } catch (error) {
      console.error('Error loading endorsements:', error);
    }
  };

  const approveFeedback = async (id, approved) => {
    try {
      const response = await adminAuthenticatedFetch(API_ENDPOINTS.ADMIN_FEEDBACK_APPROVE(id), {
        method: 'PUT',
        body: JSON.stringify({ approved }),
      });
      if (response.ok) {
        await loadFeedback();
      }
    } catch (error) {
      console.error('Error approving feedback:', error);
      alert('Failed to update feedback approval');
    }
  };

  const deleteFeedbackItem = async (id) => {
    if (!confirm('Are you sure you want to delete this feedback?')) return;
    try {
      const response = await adminAuthenticatedFetch(API_ENDPOINTS.ADMIN_FEEDBACK_DELETE(id), {
        method: 'DELETE',
      });
      if (response.ok) {
        await loadFeedback();
      }
    } catch (error) {
      console.error('Error deleting feedback:', error);
      alert('Failed to delete feedback');
    }
  };

  const approveEndorsement = async (id, approved) => {
    try {
      const response = await adminAuthenticatedFetch(API_ENDPOINTS.ADMIN_ENDORSEMENT_APPROVE(id), {
        method: 'PUT',
        body: JSON.stringify({ approved }),
      });
      if (response.ok) {
        await loadEndorsements();
      }
    } catch (error) {
      console.error('Error approving endorsement:', error);
      alert('Failed to update endorsement approval');
    }
  };

  const saveEndorsement = async (id, updates) => {
    try {
      const response = await adminAuthenticatedFetch(API_ENDPOINTS.ADMIN_ENDORSEMENT(id), {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      if (response.ok) {
        await loadEndorsements();
        setEditingEndorsement(null);
        return { success: true };
      } else {
        const data = await response.json();
        return { success: false, error: data.error || 'Failed to save' };
      }
    } catch (error) {
      return { success: false, error: 'Failed to save endorsement' };
    }
  };

  const deleteEndorsement = async (id) => {
    if (!confirm('Are you sure you want to delete this endorsement?')) return;
    try {
      const response = await adminAuthenticatedFetch(API_ENDPOINTS.ADMIN_ENDORSEMENT(id), {
        method: 'DELETE',
      });
      if (response.ok) {
        await loadEndorsements();
        if (editingEndorsement === id) {
          setEditingEndorsement(null);
        }
      }
    } catch (error) {
      console.error('Error deleting endorsement:', error);
      alert('Failed to delete endorsement');
    }
  };

  const loadSiteSettings = async () => {
    try {
      const response = await adminAuthenticatedFetch(API_ENDPOINTS.ADMIN_SITE_SETTINGS);
      if (response.ok) {
        const data = await response.json();
        setSiteSettings(data.settings || {});
      }
    } catch (error) {
      console.error('Error loading site settings:', error);
    }
  };

  const saveSiteSettings = async (updates) => {
    try {
      const response = await adminAuthenticatedFetch(API_ENDPOINTS.ADMIN_SITE_SETTINGS, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      if (response.ok) {
        const data = await response.json();
        setSiteSettings(data.settings);
        alert('Settings saved successfully!');
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.error || 'Failed to save settings' };
      }
    } catch (error) {
      return { success: false, error: 'Failed to save settings' };
    }
  };

  const loadUsers = async () => {
    try {
      const response = await adminAuthenticatedFetch(API_ENDPOINTS.ADMIN_USERS);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadWeeklyContent = async () => {
    try {
      const response = await adminAuthenticatedFetch(API_ENDPOINTS.ADMIN_WEEKLY_CONTENT);
      if (response.ok) {
        const data = await response.json();
        setWeeklyContent(data.content || {});
      }
    } catch (error) {
      console.error('Error loading weekly content:', error);
    }
  };

  const saveWeeklyContent = async (weekNumber, content) => {
    try {
      const response = await adminAuthenticatedFetch(
        API_ENDPOINTS.ADMIN_WEEKLY_CONTENT_WEEK(weekNumber),
        {
          method: 'POST',
          body: JSON.stringify(content),
        }
      );
      if (response.ok) {
        await loadWeeklyContent();
        setSelectedWeek(null);
        return { success: true };
      } else {
        const data = await response.json();
        return { success: false, error: data.error || 'Failed to save' };
      }
    } catch (error) {
      return { success: false, error: 'Failed to save weekly content' };
    }
  };

  const deleteWeeklyContent = async (weekNumber) => {
    if (!confirm(`Are you sure you want to delete Week ${weekNumber}? This action cannot be undone.`)) {
      return;
    }
    try {
      const response = await adminAuthenticatedFetch(
        API_ENDPOINTS.ADMIN_WEEKLY_CONTENT_WEEK(weekNumber),
        { method: 'DELETE' }
      );
      if (response.ok) {
        await loadWeeklyContent();
        if (selectedWeek === weekNumber) {
          setSelectedWeek(null);
        }
      }
    } catch (error) {
      console.error('Error deleting weekly content:', error);
      alert('Failed to delete week content');
    }
  };

  const exportData = async (type) => {
    try {
      const response = await adminAuthenticatedFetch(`${API_ENDPOINTS.ADMIN_EXPORT}/${type}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data');
    }
  };

  const handleLogout = () => {
    clearAdminAuth();
    window.location.reload();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const tabs = [
    { id: 'overview', name: 'Overview' },
    { id: 'weekly-content', name: 'Weekly Study' },
    { id: 'endorsements', name: 'Endorsements' },
    { id: 'settings', name: 'Settings' },
    { id: 'signups', name: 'Email Signups' },
    { id: 'preorders', name: 'Pre-Orders' },
    { id: 'previews', name: 'Book Previews' },
    { id: 'feedback', name: 'Feedback' },
    { id: 'users', name: 'Users' },
  ];

  if (loading && !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy to-blue-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-white/80 text-sm">Beyond Church Walls</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm">{admin?.email}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-navy text-navy'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard title="Total Email Signups" value={stats.total.emailSignups} recent={stats.recent.emailSignups} />
              <StatCard title="Total Pre-Orders" value={stats.total.preOrders} recent={stats.recent.preOrders} />
              <StatCard title="Book Preview Requests" value={stats.total.bookPreviews} recent={stats.recent.bookPreviews} />
              <StatCard title="Feedback Submissions" value={stats.total.feedback} />
              <StatCard title="Registered Users" value={stats.total.users} recent={stats.recent.users} />
            </div>

            {/* Interest Breakdown */}
            {Object.keys(stats.interestBreakdown).length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-navy mb-4">Pre-Order Interest Breakdown</h2>
                <div className="space-y-2">
                  {Object.entries(stats.interestBreakdown).map(([interest, count]) => (
                    <div key={interest} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="font-medium capitalize">{interest.replace('-', ' ')}</span>
                      <span className="text-navy font-bold">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Export Options */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-navy mb-4">Export Data</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={() => exportData('email-signups')}
                  className="px-4 py-2 bg-navy text-white rounded-lg hover:bg-blue-900 transition-colors text-sm"
                >
                  Export Signups
                </button>
                <button
                  onClick={() => exportData('pre-orders')}
                  className="px-4 py-2 bg-navy text-white rounded-lg hover:bg-blue-900 transition-colors text-sm"
                >
                  Export Pre-Orders
                </button>
                <button
                  onClick={() => exportData('book-previews')}
                  className="px-4 py-2 bg-navy text-white rounded-lg hover:bg-blue-900 transition-colors text-sm"
                >
                  Export Previews
                </button>
                <button
                  onClick={() => exportData('feedback')}
                  className="px-4 py-2 bg-navy text-white rounded-lg hover:bg-blue-900 transition-colors text-sm"
                >
                  Export Feedback
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'signups' && (
          <DataTable
            title="Email Signups"
            data={emailSignups}
            columns={[
              { key: 'timestamp', label: 'Date', render: (val) => formatDate(val) },
              { key: 'data.email', label: 'Email', render: (val, item) => item.data?.email || '' },
            ]}
            onLoad={loadEmailSignups}
            onExport={() => exportData('email-signups')}
          />
        )}

        {activeTab === 'preorders' && (
          <DataTable
            title="Pre-Orders & Interests"
            data={preOrders}
            columns={[
              { key: 'timestamp', label: 'Date', render: (val) => formatDate(val) },
              { key: 'data.name', label: 'Name', render: (val, item) => item.data?.name || '' },
              { key: 'data.email', label: 'Email', render: (val, item) => item.data?.email || '' },
              { key: 'data.phone', label: 'Phone', render: (val, item) => item.data?.phone || 'N/A' },
              { key: 'data.interest', label: 'Interest', render: (val, item) => item.data?.interest || '' },
              { key: 'data.message', label: 'Message', render: (val, item) => item.data?.message || 'N/A' },
            ]}
            onLoad={loadPreOrders}
            onExport={() => exportData('pre-orders')}
          />
        )}

        {activeTab === 'previews' && (
          <DataTable
            title="Book Preview Access Requests"
            data={bookPreviews}
            columns={[
              { key: 'timestamp', label: 'Date', render: (val) => formatDate(val) },
              { key: 'data.email', label: 'Email', render: (val, item) => item.data?.email || '' },
            ]}
            onLoad={loadBookPreviews}
            onExport={() => exportData('book-previews')}
          />
        )}

        {activeTab === 'feedback' && (
          <FeedbackTable
            feedback={feedback}
            onLoad={loadFeedback}
            onApprove={approveFeedback}
            onDelete={deleteFeedbackItem}
            onExport={() => exportData('feedback')}
          />
        )}

        {activeTab === 'endorsements' && (
          <EndorsementsManager
            endorsements={endorsements}
            editingEndorsement={editingEndorsement}
            onSelectEndorsement={setEditingEndorsement}
            onSave={saveEndorsement}
            onApprove={approveEndorsement}
            onDelete={deleteEndorsement}
            onLoad={loadEndorsements}
          />
        )}

        {activeTab === 'settings' && (
          <SiteSettingsManager
            settings={siteSettings}
            onSave={saveSiteSettings}
            onLoad={loadSiteSettings}
          />
        )}

        {activeTab === 'users' && (
          <UsersTable users={users} onLoad={loadUsers} />
        )}

        {activeTab === 'weekly-content' && (
          <WeeklyContentManager
            weeklyContent={weeklyContent}
            selectedWeek={selectedWeek}
            onSelectWeek={setSelectedWeek}
            onSave={saveWeeklyContent}
            onDelete={deleteWeeklyContent}
            onLoad={loadWeeklyContent}
          />
        )}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, recent }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-lg shadow p-6"
  >
    <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
    <p className="text-3xl font-bold text-navy">{value}</p>
    {recent !== undefined && (
      <p className="text-sm text-gray-500 mt-2">{recent} in last 30 days</p>
    )}
  </motion.div>
);

const DataTable = ({ title, data, columns, onLoad, onExport }) => {
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-xl font-bold text-navy">{title}</h2>
        <div className="flex space-x-3">
          <button
            onClick={onLoad}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
          >
            Refresh
          </button>
          <button
            onClick={onExport}
            className="px-4 py-2 bg-navy text-white rounded-lg hover:bg-blue-900 transition-colors text-sm"
          >
            Export CSV
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-4 text-center text-gray-500">
                  No data available
                </td>
              </tr>
            ) : (
              data.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  {columns.map((col) => (
                    <td key={col.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {col.render
                        ? col.render(getNestedValue(item, col.key), item)
                        : getNestedValue(item, col.key) || 'N/A'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="p-4 bg-gray-50 text-sm text-gray-600">
        Total: {data.length} {title.toLowerCase()}
      </div>
    </div>
  );
};

const FeedbackTable = ({ feedback, onLoad, onApprove, onDelete, onExport }) => {
  const [loading, setLoading] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const handleLoad = async () => {
    setLoading(true);
    await onLoad();
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-xl font-bold text-navy">Feedback Submissions</h2>
        <div className="flex space-x-3">
          <button
            onClick={handleLoad}
            disabled={loading}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
          <button
            onClick={onExport}
            className="px-4 py-2 bg-navy text-white rounded-lg hover:bg-blue-900 transition-colors text-sm"
          >
            Export CSV
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Feedback</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {feedback.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No feedback submissions yet
                </td>
              </tr>
            ) : (
              feedback.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(item.submittedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.title || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-md">
                    <div className="truncate">{item.quote}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${
                      item.approved 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.approved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onApprove(item.id, !item.approved)}
                        className={`px-3 py-1 rounded text-xs ${
                          item.approved
                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {item.approved ? 'Unapprove' : 'Approve'}
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="p-4 bg-gray-50 text-sm text-gray-600">
        Total: {feedback.length} feedback submissions
      </div>
    </div>
  );
};

const EndorsementsManager = ({ endorsements, editingEndorsement, onSelectEndorsement, onSave, onApprove, onDelete, onLoad }) => {
  const [formData, setFormData] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingEndorsement && editingEndorsement !== 'new') {
      const endorsement = endorsements.find(e => e.id === editingEndorsement);
      if (endorsement) {
        setFormData({ ...endorsement });
      }
    } else if (editingEndorsement === 'new') {
      setFormData({
        name: '',
        title: '',
        quote: '',
        type: 'pastoral',
        approved: false
      });
    } else {
      setFormData(null);
    }
  }, [editingEndorsement, endorsements]);

  const handleSave = async () => {
    if (!formData || !editingEndorsement || editingEndorsement === 'new') return;
    setSaving(true);
    const result = await onSave(editingEndorsement, formData);
    setSaving(false);
    if (result.success) {
      alert('Endorsement saved successfully!');
    } else {
      alert(result.error || 'Failed to save');
    }
  };

  const handleAddNew = () => {
    setFormData({
      name: '',
      title: '',
      quote: '',
      type: 'pastoral',
      approved: false
    });
    onSelectEndorsement('new');
  };

  const handleSaveNew = async () => {
    if (!formData) return;
    setSaving(true);
    try {
      const response = await adminAuthenticatedFetch(API_ENDPOINTS.ADMIN_ENDORSEMENTS, {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        await onLoad();
        setFormData(null);
        onSelectEndorsement(null);
        alert('Endorsement added successfully!');
      } else {
        alert('Failed to add endorsement');
      }
    } catch (error) {
      alert('Failed to add endorsement');
    } finally {
      setSaving(false);
    }
  };

  if (editingEndorsement && formData) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-navy">
            {editingEndorsement === 'new' ? 'Add New Endorsement' : 'Edit Endorsement'}
          </h2>
          <div className="flex space-x-3">
            <button
              onClick={editingEndorsement === 'new' ? handleSaveNew : handleSave}
              disabled={saving}
              className="px-4 py-2 bg-navy text-white rounded-lg hover:bg-blue-900 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={() => {
                onSelectEndorsement(null);
                setFormData(null);
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quote</label>
            <textarea
              value={formData.quote || ''}
              onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy"
              rows="4"
            />
          </div>
          <input type="hidden" value="pastoral" />
          <div className="flex items-center">
            <input
              type="checkbox"
              id="approved"
              checked={formData.approved || false}
              onChange={(e) => setFormData({ ...formData, approved: e.target.checked })}
              className="h-4 w-4 text-navy focus:ring-navy border-gray-300 rounded"
            />
            <label htmlFor="approved" className="ml-2 text-sm text-gray-700">
              Approved (visible on site)
            </label>
          </div>
        </div>
      </div>
    );
  }

  // Filter to show all pastoral endorsements (both approved and unapproved)
  const pastoralEndorsements = endorsements.filter(e => e.type === 'pastoral' || !e.type); // Include items without type as pastoral for backward compatibility

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-xl font-bold text-navy">
          Pastoral Endorsements
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({pastoralEndorsements.filter(e => !e.approved).length} pending approval)
          </span>
        </h2>
        <div className="flex space-x-3">
          <button
            onClick={onLoad}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
          >
            Refresh
          </button>
          <button
            onClick={handleAddNew}
            className="px-4 py-2 bg-navy text-white rounded-lg hover:bg-blue-900 transition-colors text-sm"
          >
            + Add Endorsement
          </button>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-3">
          {pastoralEndorsements.length === 0 ? (
            <p className="text-gray-500 text-sm">No pastoral endorsements</p>
          ) : (
            pastoralEndorsements.map((endorsement) => (
              <div key={endorsement.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-navy">{endorsement.name}</h4>
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${
                        endorsement.approved 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {endorsement.approved ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{endorsement.title}</p>
                    <p className="text-sm text-gray-700 italic line-clamp-2">{endorsement.quote}</p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => onSelectEndorsement(endorsement.id)}
                      className="px-3 py-1 bg-navy text-white rounded text-sm hover:bg-blue-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onApprove(endorsement.id, !endorsement.approved)}
                      className={`px-3 py-1 rounded text-xs ${
                        endorsement.approved
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {endorsement.approved ? 'Unapprove' : 'Approve'}
                    </button>
                    <button
                      onClick={() => onDelete(endorsement.id)}
                      className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const SiteSettingsManager = ({ settings, onSave, onLoad }) => {
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        launchDate: settings.launchDate || 'Mid-December',
        launchDateFormatted: settings.launchDateFormatted || ''
      });
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    const result = await onSave(formData);
    setSaving(false);
    if (!result.success) {
      alert(result.error || 'Failed to save settings');
    }
  };

  if (!settings) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-navy mb-4"></div>
          <p className="text-gray-500">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-xl font-bold text-navy">Site Settings</h2>
        <div className="flex space-x-3">
          <button
            onClick={onLoad}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
          >
            Refresh
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-navy text-white rounded-lg hover:bg-blue-900 transition-colors disabled:opacity-50 text-sm"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
      <div className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Launch Date
          </label>
          <input
            type="text"
            value={formData.launchDate || ''}
            onChange={(e) => setFormData({ ...formData, launchDate: e.target.value })}
            placeholder="e.g., Mid-December, December 15, 2024, etc."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent"
          />
          <p className="mt-1 text-xs text-gray-500">
            This will be displayed on the home page. You can use any format (e.g., "Mid-December", "December 15, 2024", "Coming Soon", etc.)
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Launch Date (Formatted - Optional)
          </label>
          <input
            type="date"
            value={formData.launchDateFormatted || ''}
            onChange={(e) => setFormData({ ...formData, launchDateFormatted: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent"
          />
          <p className="mt-1 text-xs text-gray-500">
            Optional: Set a specific date for internal tracking. This won't be displayed on the site.
          </p>
        </div>
      </div>
    </div>
  );
};

const UsersTable = ({ users, onLoad }) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-xl font-bold text-navy">Registered Users</h2>
        <button
          onClick={onLoad}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
        >
          Refresh
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No users registered yet
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.progress?.completedWeeks?.length || 0} weeks completed
                    {user.progress?.baselineFRIQ && (
                      <span className="ml-2 text-gray-500">
                        (FRIQ: {(user.progress.baselineFRIQ * 100).toFixed(1)})
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="p-4 bg-gray-50 text-sm text-gray-600">
        Total: {users.length} registered users
      </div>
    </div>
  );
};

const WeeklyContentManager = ({ weeklyContent, selectedWeek, onSelectWeek, onSave, onDelete, onLoad }) => {
  const [editingWeek, setEditingWeek] = useState(null);
  const [formData, setFormData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [scriptureReference, setScriptureReference] = useState('');
  const [fetchingScripture, setFetchingScripture] = useState(false);

  useEffect(() => {
    if (selectedWeek && weeklyContent[selectedWeek]) {
      setEditingWeek(selectedWeek);
      const content = JSON.parse(JSON.stringify(weeklyContent[selectedWeek]));
      // Ensure completionMessage exists
      if (!content.completionMessage) {
        content.completionMessage = {
          title: "Congratulations!",
          message: "You've completed this week's study! Keep up the great work as you continue to integrate faith into your daily work."
        };
      }
      // Ensure practicalApplications exists
      if (!content.practicalApplications) {
        content.practicalApplications = [];
      }
      setFormData(content);
      // Extract reference from existing keyScripture if it exists
      if (content.keyScripture && content.keyScripture.includes(' - ')) {
        setScriptureReference(content.keyScripture.split(' - ')[0]);
      } else {
        setScriptureReference('');
      }
    } else if (selectedWeek) {
      setEditingWeek(selectedWeek);
      setFormData({
        title: `Week ${selectedWeek}`,
        theme: '',
        keyScripture: '',
        learningObjective: '',
        startDate: '',
        endDate: '',
        questions: {
          Worship: [],
          Integrity: [],
          Service: [],
          Excellence: []
        },
        studyQuestions: [],
        reflectionQuestions: [],
        practicalApplications: [],
        completionMessage: {
          title: "Congratulations!",
          message: "You've completed this week's study! Keep up the great work as you continue to integrate faith into your daily work."
        }
      });
      setScriptureReference('');
    } else {
      setEditingWeek(null);
      setFormData(null);
      setScriptureReference('');
    }
  }, [selectedWeek, weeklyContent]);

  const handleFetchScripture = async () => {
    if (!scriptureReference.trim()) return;
    
    setFetchingScripture(true);
    try {
      const response = await fetch(`${API_ENDPOINTS.BIBLE_VERSE}?reference=${encodeURIComponent(scriptureReference)}`);
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Expected JSON but got:', text.substring(0, 200));
        alert('Server returned invalid response. Please try again.');
        setFetchingScripture(false);
        return;
      }
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setFormData({ ...formData, keyScripture: data.formatted });
      } else {
        alert(data.error || 'Failed to fetch scripture');
      }
    } catch (error) {
      console.error('Error fetching scripture:', error);
      alert('Failed to fetch scripture. Please check your connection and try again.');
    } finally {
      setFetchingScripture(false);
    }
  };

  const handleSave = async () => {
    if (!formData || !editingWeek) return;
    setSaving(true);
    const result = await onSave(editingWeek, formData);
    setSaving(false);
    if (result.success) {
      alert('Week content saved successfully!');
    } else {
      alert(result.error || 'Failed to save');
    }
  };

  const handleAddWeek = () => {
    const weekNumbers = Object.keys(weeklyContent).map(Number).sort((a, b) => a - b);
    const nextWeek = weekNumbers.length > 0 ? Math.max(...weekNumbers) + 1 : 1;
    onSelectWeek(nextWeek);
  };

  const addQuestion = (dimension) => {
    const newId = `${dimension[0].toLowerCase()}${editingWeek}-${Date.now()}`;
    const newQuestion = {
      id: newId,
      question: '',
      dimension: dimension
    };
    setFormData({
      ...formData,
      questions: {
        ...formData.questions,
        [dimension]: [...(formData.questions[dimension] || []), newQuestion]
      }
    });
  };

  const updateQuestion = (dimension, index, field, value) => {
    const updated = [...formData.questions[dimension]];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({
      ...formData,
      questions: {
        ...formData.questions,
        [dimension]: updated
      }
    });
  };

  const deleteQuestion = (dimension, index) => {
    const updated = formData.questions[dimension].filter((_, i) => i !== index);
    setFormData({
      ...formData,
      questions: {
        ...formData.questions,
        [dimension]: updated
      }
    });
  };

  const addStudyQuestion = () => {
    const newId = `sq${editingWeek}-${Date.now()}`;
    setFormData({
      ...formData,
      studyQuestions: [...(formData.studyQuestions || []), { id: newId, question: '' }]
    });
  };

  const updateStudyQuestion = (index, value) => {
    const updated = [...formData.studyQuestions];
    updated[index] = { ...updated[index], question: value };
    setFormData({ ...formData, studyQuestions: updated });
  };

  const deleteStudyQuestion = (index) => {
    setFormData({
      ...formData,
      studyQuestions: formData.studyQuestions.filter((_, i) => i !== index)
    });
  };

  const addReflectionQuestion = () => {
    const newId = `rq${editingWeek}-${Date.now()}`;
    setFormData({
      ...formData,
      reflectionQuestions: [...(formData.reflectionQuestions || []), { id: newId, question: '' }]
    });
  };

  const updateReflectionQuestion = (index, value) => {
    const updated = [...formData.reflectionQuestions];
    updated[index] = { ...updated[index], question: value };
    setFormData({ ...formData, reflectionQuestions: updated });
  };

  const deleteReflectionQuestion = (index) => {
    setFormData({
      ...formData,
      reflectionQuestions: formData.reflectionQuestions.filter((_, i) => i !== index)
    });
  };

  const addPracticalApplication = () => {
    const newId = `pa${editingWeek}-${Date.now()}`;
    setFormData({
      ...formData,
      practicalApplications: [...(formData.practicalApplications || []), { id: newId, prompt: '', description: '' }]
    });
  };

  const updatePracticalApplication = (index, field, value) => {
    const updated = [...(formData.practicalApplications || [])];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, practicalApplications: updated });
  };

  const deletePracticalApplication = (index) => {
    setFormData({
      ...formData,
      practicalApplications: (formData.practicalApplications || []).filter((_, i) => i !== index)
    });
  };

  const weekNumbers = Object.keys(weeklyContent).map(Number).sort((a, b) => a - b);

  if (editingWeek && formData) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-navy">Edit Week {editingWeek}</h2>
          <div className="flex space-x-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-navy text-white rounded-lg hover:bg-blue-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={() => onSelectWeek(null)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

        <div className="space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-navy">Basic Information</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
              <textarea
                value={formData.theme || ''}
                onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy"
                rows="2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Key Scripture</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={scriptureReference}
                  onChange={(e) => setScriptureReference(e.target.value)}
                  placeholder="e.g., Genesis 2:15 or John 3:16"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleFetchScripture();
                    }
                  }}
                />
                <button
                  onClick={handleFetchScripture}
                  disabled={!scriptureReference.trim() || fetchingScripture}
                  className="px-4 py-2 bg-navy text-white rounded-lg hover:bg-blue-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {fetchingScripture ? 'Fetching...' : 'Fetch'}
                </button>
              </div>
              <textarea
                value={formData.keyScripture || ''}
                onChange={(e) => setFormData({ ...formData, keyScripture: e.target.value })}
                placeholder="Scripture text will appear here after fetching, or enter manually"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy"
                rows="3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Learning Objective</label>
              <textarea
                value={formData.learningObjective || ''}
                onChange={(e) => setFormData({ ...formData, learningObjective: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy"
                rows="2"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={formData.startDate || ''}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={formData.endDate || ''}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy"
                />
              </div>
            </div>
          </div>

          {/* WISE Assessment Questions */}
          {['Worship', 'Integrity', 'Service', 'Excellence'].map((dimension) => (
            <div key={dimension} className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-navy">{dimension} Questions</h3>
                <button
                  onClick={() => addQuestion(dimension)}
                  className="px-3 py-1 bg-navy text-white rounded text-sm hover:bg-blue-900 transition-colors"
                >
                  + Add Question
                </button>
              </div>
              <div className="space-y-3">
                {(formData.questions[dimension] || []).map((q, idx) => (
                  <div key={q.id} className="flex gap-2 items-start">
                    <input
                      type="text"
                      value={q.question}
                      onChange={(e) => updateQuestion(dimension, idx, 'question', e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy"
                      placeholder="Enter question..."
                    />
                    <button
                      onClick={() => deleteQuestion(dimension, idx)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                      title="Delete"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Study Questions */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-navy">Study Questions</h3>
              <button
                onClick={addStudyQuestion}
                className="px-3 py-1 bg-navy text-white rounded text-sm hover:bg-blue-900 transition-colors"
              >
                + Add Question
              </button>
            </div>
            <div className="space-y-3">
              {(formData.studyQuestions || []).map((q, idx) => (
                <div key={q.id} className="flex gap-2 items-start">
                  <input
                    type="text"
                    value={q.question}
                    onChange={(e) => updateStudyQuestion(idx, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy"
                    placeholder="Enter study question..."
                  />
                  <button
                    onClick={() => deleteStudyQuestion(idx)}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Reflection Questions */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-navy">Reflection Questions</h3>
              <button
                onClick={addReflectionQuestion}
                className="px-3 py-1 bg-navy text-white rounded text-sm hover:bg-blue-900 transition-colors"
              >
                + Add Question
              </button>
            </div>
            <div className="space-y-3">
              {(formData.reflectionQuestions || []).map((q, idx) => (
                <div key={q.id} className="flex gap-2 items-start">
                  <input
                    type="text"
                    value={q.question}
                    onChange={(e) => updateReflectionQuestion(idx, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy"
                    placeholder="Enter reflection question..."
                  />
                  <button
                    onClick={() => deleteReflectionQuestion(idx)}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Practical Applications */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-navy">Practical Applications</h3>
              <button
                onClick={addPracticalApplication}
                className="px-3 py-1 bg-navy text-white rounded text-sm hover:bg-blue-900 transition-colors"
              >
                + Add Practical Application
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Add prompts or questions to guide users in applying the week's lessons to their daily work.
            </p>
            <div className="space-y-4">
              {(formData.practicalApplications || []).map((pa, idx) => (
                <div key={pa.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex gap-2 items-start">
                    <div className="flex-1 space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Prompt/Question</label>
                        <input
                          type="text"
                          value={pa.prompt || ''}
                          onChange={(e) => updatePracticalApplication(idx, 'prompt', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy"
                          placeholder="Enter practical application prompt or question..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                        <textarea
                          value={pa.description || ''}
                          onChange={(e) => updatePracticalApplication(idx, 'description', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy"
                          placeholder="Optional instructions or additional context..."
                          rows="2"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => deletePracticalApplication(idx)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                      title="Delete"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Completion Message */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-navy mb-4">Completion Message</h3>
            <p className="text-sm text-gray-600 mb-4">
              This message will be shown after a user completes this week's assessment.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.completionMessage?.title || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    completionMessage: {
                      ...(formData.completionMessage || {}),
                      title: e.target.value
                    }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy"
                  placeholder="e.g., Congratulations!"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  value={formData.completionMessage?.message || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    completionMessage: {
                      ...(formData.completionMessage || {}),
                      message: e.target.value
                    }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy"
                  rows="4"
                  placeholder="Enter a general completion message that will be shown after this week is completed..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-xl font-bold text-navy">Weekly Study</h2>
        <div className="flex space-x-3">
          <button
            onClick={onLoad}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
          >
            Refresh
          </button>
          <button
            onClick={handleAddWeek}
            className="p-2 text-gray-700 hover:text-navy hover:bg-gray-100 rounded-lg transition-colors"
            title="Add New Week"
          >
            + Week
          </button>
        </div>
      </div>
      <div className="p-6">
        {weekNumbers.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No weekly study content yet. Click "Add New Week" to get started.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {weekNumbers.map((weekNum) => (
              <div key={weekNum} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-navy">Week {weekNum}</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onSelectWeek(weekNum)}
                      className="px-3 py-1 bg-navy text-white rounded text-sm hover:bg-blue-900 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete && onDelete(weekNum)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                      title="Delete"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1">{weeklyContent[weekNum]?.title || 'Untitled'}</p>
                <p className="text-xs text-gray-500">{weeklyContent[weekNum]?.theme || 'No theme'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

