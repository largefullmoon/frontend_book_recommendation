import React, { useState, useEffect } from 'react';
import { Search, Plus, X } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const AGE_GROUPS = [
  { id: '4-7', label: 'Ages 4-7' },
  { id: '8-10', label: 'Ages 8-10' },
  { id: '11+', label: 'Ages 11+' },
];

interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  genres: string[];
  ageRange: {
    min: number;
    max: number;
  };
  coverImage?: string;
}

interface Recommendations {
  [key: string]: Book[];
}

const RecommendationManager: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendations>({
    '4-7': [],
    '8-10': [],
    '11+': [],
  });
  const [selectedAgeGroup, setSelectedAgeGroup] = useState(AGE_GROUPS[0].id);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBooks = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get<Book[]>(`${API_BASE_URL}/books`);
      setBooks(response.data);
      console.log(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch books. Please try again later.');
      console.error('Error fetching books:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get<Recommendations>(`${API_BASE_URL}/recommendations`);
      setRecommendations(response.data);
      console.log(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch recommendations. Please try again later.');
      console.error('Error fetching recommendations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
    fetchRecommendations();
  }, []);

  const filteredBooks = books.filter(book =>
    (book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase())) && recommendations[selectedAgeGroup] &&
    !recommendations[selectedAgeGroup].find(rec => rec.id === book.id)
  );

  const handleAddBook = async (bookId: string) => {
    const book = books.find(b => b.id === bookId);
    if (book) {
      try {
        setIsLoading(true);
        const updatedBooks = [...recommendations[selectedAgeGroup], book];
        await axios.put(`${API_BASE_URL}/recommendations/${selectedAgeGroup}`, updatedBooks);
        setRecommendations({
          ...recommendations,
          [selectedAgeGroup]: updatedBooks
        });
        setError(null);
      } catch (err) {
        setError('Failed to add book to recommendations.');
        console.error('Error adding book:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleRemoveBook = async (bookId: string) => {
    try {
      setIsLoading(true);
      const updatedBooks = recommendations[selectedAgeGroup].filter(book => book.id !== bookId);
      await axios.put(`${API_BASE_URL}/recommendations/${selectedAgeGroup}`, updatedBooks);
      setRecommendations({
        ...recommendations,
        [selectedAgeGroup]: updatedBooks
      });
      setError(null);
    } catch (err) {
      setError('Failed to remove book from recommendations.');
      console.error('Error removing book:', err);
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

        {/* Current Recommendations */}
        <div className="col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Current Recommendations for {AGE_GROUPS.find(g => g.id === selectedAgeGroup)?.label}
            </h2>

            <div className="mb-4 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search books to add..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                disabled={isLoading}
              />
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
              </div>
            ) : (
              <>
                {/* Current Recommendations List */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Current Recommendations</h3>
                  <div className="space-y-2">
                    {recommendations[selectedAgeGroup] && recommendations[selectedAgeGroup].map(book => (
                      <div
                        key={book.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <h4 className="font-medium text-gray-900">{book.title}</h4>
                          <p className="text-sm text-gray-500">{book.author}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveBook(book.id)}
                          className="text-red-600 hover:text-red-800"
                          disabled={isLoading}
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Available Books List */}
                {searchTerm && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Available Books</h3>
                    <div className="space-y-2">
                      {filteredBooks.map(book => (
                        <div
                          key={book.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <h4 className="font-medium text-gray-900">{book.title}</h4>
                            <p className="text-sm text-gray-500">{book.author}</p>
                          </div>
                          <button
                            onClick={() => handleAddBook(book.id)}
                            className="text-green-600 hover:text-green-800"
                            disabled={isLoading}
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendationManager; 