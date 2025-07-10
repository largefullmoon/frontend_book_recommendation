import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, Upload } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

interface Book {
  id: string;
  title: string;
  author: string;
  genres: string[];
  ageRange: {
    min: number;
    max: number;
  };
  coverImage?: string;
  tags: string[];
  image?: string;
  importedAt?: string;
}

interface ImportResponse {
  message: string;
  success_count: number;
  error_count: number;
  errors: string[];
}

const BookList: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingBook, setEditingBook] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<ImportResponse | null>(null);
  const [formData, setFormData] = useState<Omit<Book, 'id'>>({
    title: '',
    author: '',
    genres: [],
    tags: [],
    ageRange: {
      min: 5,
      max: 18
    },
    image: ''
  });

  const fetchBooks = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get<Book[]>(`${API_BASE_URL}/books`);
      setBooks(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch books. Please try again later.');
      console.error('Error fetching books:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      if (editingBook) {
        const response = await axios.put<Book>(`${API_BASE_URL}/books/${editingBook}`, formData);
        setBooks(books.map(book => book.id === editingBook ? response.data : book));
      } else {
        const response = await axios.post<Book>(`${API_BASE_URL}/books`, formData);
        setBooks([...books, response.data]);
      }
      setIsModalOpen(false);
      setEditingBook(null);
      setFormData({
        title: '',
        author: '',
        genres: [],
        ageRange: {
          min: 5,
          max: 18
        },
        tags: [],
        image: ''
      });
    } catch (err) {
      setError(editingBook ? 'Failed to update book.' : 'Failed to create book.');
      console.error('Error saving book:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (book: Book) => {
    setEditingBook(book.id);
    setFormData(book);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    
    try {
      setIsLoading(true);
      await axios.delete(`${API_BASE_URL}/books/${id}`);
      setBooks(books.filter(book => book.id !== id));
    } catch (err) {
      setError('Failed to delete book.');
      console.error('Error deleting book:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file extension
    if (!file.name.endsWith('.csv')) {
      setError('Invalid file format. Please upload a CSV file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsLoading(true);
      setError(null);
      setImportResult(null);

      const response = await axios.post<ImportResponse>(
        `${API_BASE_URL}/import-books`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setImportResult(response.data);
      // Refresh the book list after successful import
      fetchBooks();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to import books. Please try again.');
      }
      console.error('Error importing books:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Book List</h1>
        <div className="flex gap-4">
          <label className="brand-blue-bg text-white px-4 py-2 rounded-lg flex items-center hover:opacity-90 cursor-pointer">
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isLoading}
            />
          </label>
          <button
            onClick={() => setIsModalOpen(true)}
            className="brand-blue-bg text-white px-4 py-2 rounded-lg flex items-center hover:opacity-90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Book
          </button>
        </div>
      </div>

      {importResult && (
        <div className="mb-4 p-4 bg-white border rounded-lg shadow">
          <h3 className="font-semibold mb-2">Import Results</h3>
          <p>Successfully imported: {importResult.success_count} books</p>
          <p>Failed to import: {importResult.error_count} books</p>
          {importResult.errors.length > 0 && (
            <div className="mt-2">
              <p className="font-semibold">Errors:</p>
              <ul className="list-disc list-inside text-sm text-red-600">
                {importResult.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search books..."
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
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Age Range
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Genres
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tags
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Imported
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBooks.map((book) => (
                  <tr key={book.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {(book.coverImage || book.image) && (
                          <img
                            src={book.coverImage || book.image}
                            alt={book.title}
                            className="w-10 h-10 rounded object-cover mr-3"
                          />
                        )}
                        <div className="text-sm font-medium text-gray-900">
                          {book.title}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {book.author}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {book.ageRange.min}-{book.ageRange.max}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {book.genres.map((genre) => (
                          <span
                            key={genre}
                            className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800"
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {book.tags?.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {book.importedAt && new Date(book.importedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(book)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                        disabled={isLoading}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(book.id)}
                        className="text-red-600 hover:text-red-900"
                        disabled={isLoading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Book Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">
              {editingBook ? 'Edit Book' : 'Add New Book'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Author
                </label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Min Age
                  </label>
                  <input
                    type="number"
                    value={formData.ageRange.min}
                    onChange={(e) => setFormData({
                      ...formData,
                      ageRange: { ...formData.ageRange, min: parseInt(e.target.value) }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    min="0"
                    max="18"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Max Age
                  </label>
                  <input
                    type="number"
                    value={formData.ageRange.max}
                    onChange={(e) => setFormData({
                      ...formData,
                      ageRange: { ...formData.ageRange, max: parseInt(e.target.value) }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    min="0"
                    max="18"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Genres (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.genres.join(', ')}
                  onChange={(e) => setFormData({
                    ...formData,
                    genres: e.target.value.split(',').map(g => g.trim()).filter(Boolean)
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.tags.join(', ')}
                  onChange={(e) => setFormData({
                    ...formData,
                    tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Cover Image URL
                </label>
                <input
                  type="url"
                  value={formData.image || ''}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingBook(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white brand-blue-bg rounded-md hover:opacity-90"
                >
                  {editingBook ? 'Save Changes' : 'Add Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookList; 