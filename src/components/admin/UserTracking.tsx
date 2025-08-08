import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Download, Calendar, User, Mail, Phone, Clock, BookOpen, Star, Trash2, RefreshCw, BarChart3 } from 'lucide-react';
import AnalyticsDashboard from './AnalyticsDashboard';

interface QuizUser {
  id: string;
  name?: string;
  age?: number;
  parentEmail: string;
  parentPhone: string;
  selectedGenres?: string[];
  selectedInterests?: string[];
  nonFictionInterests?: string[];
  bookSeries?: any[];
  createdAt: string;
  status: string;
  quizProgress?: {
    parentConsent: boolean;
    basicInfo: boolean;
    parentReading: boolean;
    genres: boolean;
    interests: boolean;
    bookSeries: boolean;
    completed: boolean;
  };
}

interface RecommendationPlan {
  id: string;
  name: string;
  age: number;
  parentEmail: string;
  parentPhone: string;
  selectedGenres: string[];
  selectedInterests: string[];
  nonFictionInterests: string[];
  bookSeries: any[];
  recommendations: any[];
  currentRecommendations: any[];
  futureRecommendations: any[];
  createdAt: string;
  updatedAt: string;
  status: string;
}

interface UserTrackingStats {
  total: number;
  active: number;
  inactive: number;
  recent: number;
  ageGroups: { _id: string; count: number }[];
}

const UserTracking: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'plans' | 'users' | 'analytics'>('plans');
  const [recommendationPlans, setRecommendationPlans] = useState<RecommendationPlan[]>([]);
  const [quizUsers, setQuizUsers] = useState<QuizUser[]>([]);
  const [stats, setStats] = useState<UserTrackingStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<RecommendationPlan | QuizUser | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ageFilter, setAgeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchData();
    fetchStats();
  }, [activeTab, currentPage, statusFilter, searchTerm]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'plans') {
        await fetchRecommendationPlans();
      } else {
        await fetchQuizUsers();
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendationPlans = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        status: statusFilter === 'all' ? '' : statusFilter,
        email: searchTerm
      });

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/recommendation-plans?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setRecommendationPlans(data.plans);
        setTotalItems(data.pagination.total);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching recommendation plans:', error);
    }
  };

  const fetchQuizUsers = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/quiz/users`);
      const data = await response.json();
      
      if (data.success) {
        let filteredUsers = data.users;
        
        // Apply filters
        if (searchTerm) {
          filteredUsers = filteredUsers.filter((user: QuizUser) =>
            user.parentEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.name?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        if (statusFilter !== 'all') {
          filteredUsers = filteredUsers.filter((user: QuizUser) => user.status === statusFilter);
        }
        
        setQuizUsers(filteredUsers);
        setTotalItems(filteredUsers.length);
        setTotalPages(Math.ceil(filteredUsers.length / itemsPerPage));
      }
    } catch (error) {
      console.error('Error fetching quiz users:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/recommendation-plans/stats`);
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleViewDetails = (user: RecommendationPlan | QuizUser) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this recommendation plan?')) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/recommendation-plans/${planId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        fetchData();
        fetchStats();
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
    }
  };

  const exportToCSV = () => {
    const data = activeTab === 'plans' ? recommendationPlans : quizUsers;
    const csvContent = convertToCSV(data);
    downloadCSV(csvContent, `${activeTab}_data.csv`);
  };

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]).filter(key => typeof data[0][key] !== 'object');
    const csvRows = [headers.join(',')];
    
    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header];
        return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
      });
      csvRows.push(values.join(','));
    });
    
    return csvRows.join('\n');
  };

  const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProgressPercentage = (progress: any) => {
    if (!progress) return 0;
    const steps = Object.values(progress);
    const completed = steps.filter(Boolean).length;
    return Math.round((completed / steps.length) * 100);
  };

  const renderStatsCards = () => {
    if (!stats) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Plans</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Plans</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Recent (7 days)</p>
              <p className="text-2xl font-bold text-gray-900">{stats.recent}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <Star className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Inactive Plans</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderFilters = () => (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by email or name..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="completed">Completed</option>
          <option value="consent_given">Consent Given</option>
        </select>
        <select
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          value={ageFilter}
          onChange={(e) => setAgeFilter(e.target.value)}
        >
          <option value="all">All Ages</option>
          <option value="0-5">0-5 years</option>
          <option value="6-8">6-8 years</option>
          <option value="9-10">9-10 years</option>
          <option value="11-12">11-12 years</option>
          <option value="13+">13+ years</option>
        </select>
        <div className="flex space-x-2">
          <button
            onClick={exportToCSV}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button
            onClick={() => {
              fetchData();
              fetchStats();
            }}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>
    </div>
  );

  const renderRecommendationPlansTable = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Child Info
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Parent Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Preferences
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Recommendations
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {recommendationPlans.map((plan) => (
              <tr key={plan.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{plan.name}</div>
                    <div className="text-sm text-gray-500">{plan.age} years old</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm text-gray-900 flex items-center">
                      <Mail className="w-4 h-4 mr-1" />
                      {plan.parentEmail}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      {plan.parentPhone}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    <div className="mb-1">
                      <strong>Genres:</strong> {plan.selectedGenres?.slice(0, 2).join(', ')}
                      {plan.selectedGenres?.length > 2 && ` +${plan.selectedGenres.length - 2} more`}
                    </div>
                    <div>
                      <strong>Interests:</strong> {plan.selectedInterests?.slice(0, 2).join(', ')}
                      {plan.selectedInterests?.length > 2 && ` +${plan.selectedInterests.length - 2} more`}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    <div>{plan.recommendations?.length || 0} series</div>
                    <div className="text-gray-500">{plan.currentRecommendations?.length || 0} current books</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(plan.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    plan.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {plan.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewDetails(plan)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePlan(plan.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderQuizUsersTable = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User Info
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quiz Progress
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {quizUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {user.name || 'Not provided'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {user.age ? `${user.age} years old` : 'Age not provided'}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm text-gray-900 flex items-center">
                      <Mail className="w-4 h-4 mr-1" />
                      {user.parentEmail}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      {user.parentPhone}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full" 
                          style={{ width: `${getProgressPercentage(user.quizProgress)}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="ml-2 text-sm text-gray-500">
                      {getProgressPercentage(user.quizProgress)}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(user.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.status === 'completed' 
                      ? 'bg-green-100 text-green-800'
                      : user.status === 'consent_given'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleViewDetails(user)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPagination = () => (
    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-6">
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(currentPage * itemsPerPage, totalItems)}
            </span>{' '}
            of <span className="font-medium">{totalItems}</span> results
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            {[...Array(Math.min(5, totalPages))].map((_, index) => {
              const page = index + 1;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    currentPage === page
                      ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </nav>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">User Tracking & Analytics</h1>
      </div>

      {activeTab === 'analytics' ? (
        <AnalyticsDashboard />
      ) : (
        <>
          {renderStatsCards()}
          {renderFilters()}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
          ) : (
            <>
              {activeTab === 'plans' ? renderRecommendationPlansTable() : renderQuizUsersTable()}
              {renderPagination()}
            </>
          )}
        </>
      )}

      {/* Detail Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  User Details - {'name' in selectedUser ? selectedUser.name : 'Quiz User'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Basic Information</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p><strong>Name:</strong> {'name' in selectedUser ? selectedUser.name : 'Not provided'}</p>
                    <p><strong>Age:</strong> {'age' in selectedUser ? selectedUser.age : 'Not provided'}</p>
                    <p><strong>Parent Email:</strong> {selectedUser.parentEmail}</p>
                    <p><strong>Parent Phone:</strong> {selectedUser.parentPhone}</p>
                    <p><strong>Status:</strong> {selectedUser.status}</p>
                    <p><strong>Created:</strong> {formatDate(selectedUser.createdAt)}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Preferences</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    {'selectedGenres' in selectedUser && (
                      <p><strong>Selected Genres:</strong> {selectedUser.selectedGenres?.join(', ') || 'None'}</p>
                    )}
                    {'selectedInterests' in selectedUser && (
                      <p><strong>Interests:</strong> {selectedUser.selectedInterests?.join(', ') || 'None'}</p>
                    )}
                    {'nonFictionInterests' in selectedUser && (
                      <p><strong>Non-Fiction Interests:</strong> {selectedUser.nonFictionInterests?.join(', ') || 'None'}</p>
                    )}
                  </div>
                </div>
              </div>

              {'recommendations' in selectedUser && selectedUser.recommendations && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">Generated Recommendations</h4>
                  <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                    {selectedUser.recommendations.map((rec: any, index: number) => (
                      <div key={index} className="mb-4 p-3 bg-white rounded border">
                        <h5 className="font-medium">{rec.name}</h5>
                        <p className="text-sm text-gray-600 mb-2">{rec.rationale}</p>
                        <p className="text-sm"><strong>Confidence Score:</strong> {rec.confidence_score}/10</p>
                        {rec.sample_books && (
                          <div className="mt-2">
                            <strong className="text-sm">Sample Books:</strong>
                            <ul className="list-disc list-inside text-sm text-gray-600">
                              {rec.sample_books.map((book: any, bookIndex: number) => (
                                <li key={bookIndex}>{book.title}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {'quizProgress' in selectedUser && selectedUser.quizProgress && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">Quiz Progress</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(selectedUser.quizProgress).map(([step, completed]) => (
                        <div key={step} className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-2 ${completed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span className="text-sm capitalize">{step.replace(/([A-Z])/g, ' $1').trim()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTracking; 