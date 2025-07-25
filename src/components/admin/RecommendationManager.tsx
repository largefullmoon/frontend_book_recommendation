import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const AGE_GROUPS = [
  { id: 'Below 5', label: 'Below 5' },
  { id: '6-8', label: 'Ages 6-8' },
  { id: '9-10', label: 'Ages 9-10' },
  { id: '11-12', label: 'Ages 11-12' },
  { id: '13+', label: 'Ages 13+' },
];

interface ManualBook {
  id: string;
  title: string;
  author: string;
  description?: string;
}

const RecommendationManager: React.FC = () => {
  const [recommendations, setRecommendations] = useState<ManualBook[]>([]);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState(AGE_GROUPS[0].id);
  const [form, setForm] = useState({
    title: '',
    author: '',
    description: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch recommendations for selected age group
  const fetchRecommendations = async (ageGroup: string) => {
    setIsLoading(true);
    try {
      const encodedAgeGroup = encodeURIComponent(ageGroup);
      const response = await axios.get<ManualBook[]>(`${API_BASE_URL}/recommendations/${encodedAgeGroup}`);
      setRecommendations(response.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch recommendations. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations(selectedAgeGroup);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAgeGroup]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddRecommendation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.author.trim()) {
      setError('Title and author are required.');
      return;
    }
    const newBook: ManualBook = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      title: form.title.trim(),
      author: form.author.trim(),
      description: form.description.trim(),
    };
    const updated = [...recommendations, newBook];
    setIsLoading(true);
    try {
      const encodedAgeGroup = encodeURIComponent(selectedAgeGroup);
      await axios.put(`${API_BASE_URL}/recommendations/${encodedAgeGroup}`, updated);
      setRecommendations(updated);
      setForm({ title: '', author: '', description: '' });
      setError(null);
    } catch (err) {
      setError('Failed to add recommendation.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveRecommendation = async (bookId: string) => {
    const updated = recommendations.filter(book => book.id !== bookId);
    setIsLoading(true);
    try {
      const encodedAgeGroup = encodeURIComponent(selectedAgeGroup);
      await axios.put(`${API_BASE_URL}/recommendations/${encodedAgeGroup}`, updated);
      setRecommendations(updated);
      setError(null);
    } catch (err) {
      setError('Failed to remove recommendation.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Manage Recommendations</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Age Group Selection */}
        <div className="col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Age Groups</h2>
            <div className="space-y-2">
              {AGE_GROUPS.map(group => (
                <button
                  key={group.id}
                  onClick={() => setSelectedAgeGroup(group.id)}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${selectedAgeGroup === group.id
                    ? 'brand-blue-bg text-white'
                    : 'hover:bg-gray-100'
                    }`}
                  disabled={isLoading}
                >
                  {group.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Recommendations for Selected Age Group */}
        <div className="col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Recommendations for {AGE_GROUPS.find(g => g.id === selectedAgeGroup)?.label}
            </h2>

            {/* Add Recommendation Form */}
            <form onSubmit={handleAddRecommendation} className="mb-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Book Title<span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter book title"
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Author<span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="author"
                  value={form.author}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter author name"
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter description (optional)"
                  rows={2}
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                disabled={isLoading}
              >
                <Plus className="w-5 h-5" /> Add Recommendation
              </button>
            </form>

            {/* Current Recommendations List */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Current Recommendations</h3>
              <div className="space-y-2">
                {recommendations.length === 0 && !isLoading && (
                  <div className="text-gray-400 italic">No recommendations yet.</div>
                )}
                {recommendations.map(book => (
                  <div
                    key={book.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium text-gray-900">{book.title}</h4>
                      <p className="text-sm text-gray-500">{book.author}</p>
                      {book.description && <p className="text-xs text-gray-400 mt-1">{book.description}</p>}
                    </div>
                    <button
                      onClick={() => handleRemoveRecommendation(book.id)}
                      className="text-red-600 hover:text-red-800"
                      disabled={isLoading}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendationManager; 