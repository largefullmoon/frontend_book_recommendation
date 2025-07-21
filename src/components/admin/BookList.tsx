import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, Upload, ChevronLeft, ChevronRight, Filter, X } from 'lucide-react';
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

interface Filters {
  author: string;
  minAge: number | '';
  maxAge: number | '';
  genre: string;
}

const BookList: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingBook, setEditingBook] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<ImportResponse | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Filter state
  const [filters, setFilters] = useState<Filters>({
    author: '',
    minAge: '',
    maxAge: '',
    genre: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  
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

  // Get unique authors and genres for filter dropdowns
  const uniqueAuthors = [...new Set(books.map(book => book.author))].sort();
  const uniqueGenres = [...new Set(books.flatMap(book => book.genres))].sort();

  // Apply filters and search
  const filteredBooks = books.filter(book => {
    const matchesSearch = 
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAuthor = !filters.author || book.author === filters.author;
    
    const matchesMinAge = filters.minAge === '' || book.ageRange.min >= Number(filters.minAge);
    const matchesMaxAge = filters.maxAge === '' || book.ageRange.max <= Number(filters.maxAge);
    
    const matchesGenre = !filters.genre || book.genres.includes(filters.genre);
    
    return matchesSearch && matchesAuthor && matchesMinAge && matchesMaxAge && matchesGenre;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBooks = filteredBooks.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, searchTerm]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  const handleFilterChange = (key: keyof Filters, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      author: '',
      minAge: '',
      maxAge: '',
      genre: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

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

  const handleDeleteClick = (book: Book) => {
    setBookToDelete(book);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!bookToDelete) return;
    
    try {
      setIsLoading(true);
      await axios.delete(`${API_BASE_URL}/books/${bookToDelete.id}`);
      setBooks(books.filter(book => book.id !== bookToDelete.id));
      setDeleteModalOpen(false);
      setBookToDelete(null);
    } catch (err) {
      setError('Failed to delete book.');
      console.error('Error deleting book:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setBookToDelete(null);
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

  // Pagination component
  const PaginationControls = () => (
    <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
      <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
        <span className="text-sm text-gray-700 text-center sm:text-left">
          Showing {startIndex + 1} to {Math.min(endIndex, filteredBooks.length)} of {filteredBooks.length} results
        </span>
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-700">Show:</label>
          <select
            value={itemsPerPage}
            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span className="text-sm text-gray-700">per page</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-1">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        {/* Show limited page numbers on mobile */}
        {totalPages <= 5 ? (
          Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-1 rounded border text-sm ${
                currentPage === page
                  ? 'bg-indigo-500 text-white'
                  : 'hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))
        ) : (
          <>
            {/* First page */}
            <button
              onClick={() => handlePageChange(1)}
              className={`px-3 py-1 rounded border text-sm ${
                currentPage === 1
                  ? 'bg-indigo-500 text-white'
                  : 'hover:bg-gray-50'
              }`}
            >
              1
            </button>
            
            {/* Ellipsis or pages around current */}
            {currentPage > 3 && <span className="px-2 text-gray-500">...</span>}
            
            {/* Pages around current page */}
            {Array.from({ length: 3 }, (_, i) => {
              const page = currentPage - 1 + i;
              if (page > 1 && page < totalPages) {
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded border text-sm ${
                      currentPage === page
                        ? 'bg-indigo-500 text-white'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              }
              return null;
            })}
            
            {currentPage < totalPages - 2 && <span className="px-2 text-gray-500">...</span>}
            
            {/* Last page */}
            {totalPages > 1 && (
              <button
                onClick={() => handlePageChange(totalPages)}
                className={`px-3 py-1 rounded border text-sm ${
                  currentPage === totalPages
                    ? 'bg-indigo-500 text-white'
                    : 'hover:bg-gray-50'
                }`}
              >
                {totalPages}
              </button>
            )}
          </>
        )}
        
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Book List</h1>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
          <label className="brand-blue-bg text-white px-4 py-2 rounded-lg flex items-center justify-center hover:opacity-90 cursor-pointer">
            <Upload className="w-4 h-4 mr-2" />
            <span className="whitespace-nowrap">Import CSV</span>
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
            className="brand-blue-bg text-white px-4 py-2 rounded-lg flex items-center justify-center hover:opacity-90"
          >
            <Plus className="w-4 h-4 mr-2" />
            <span className="whitespace-nowrap">Add New Book</span>
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
        
        {/* Search and Filter Controls */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
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
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 border rounded-lg flex items-center justify-center whitespace-nowrap ${
                showFilters || hasActiveFilters ? 'bg-indigo-50 border-indigo-300' : 'hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Filters</span>
              <span className="sm:hidden">Filter</span>
              {hasActiveFilters && (
                <span className="ml-2 bg-indigo-500 text-white text-xs rounded-full px-2 py-1">
                  {Object.values(filters).filter(value => value !== '').length}
                </span>
              )}
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Filters</h3>
                <div className="flex gap-2">
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-gray-600 hover:text-gray-800 flex items-center"
                    >
                      <X className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">Clear all</span>
                      <span className="sm:hidden">Clear</span>
                    </button>
                  )}
                  <button
                    onClick={() => setShowFilters(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Author
                  </label>
                  <select
                    value={filters.author}
                    onChange={(e) => handleFilterChange('author', e.target.value)}
                    className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">All authors</option>
                    {uniqueAuthors.map(author => (
                      <option key={author} value={author}>{author}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Genre
                  </label>
                  <select
                    value={filters.genre}
                    onChange={(e) => handleFilterChange('genre', e.target.value)}
                    className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">All genres</option>
                    {uniqueGenres.map(genre => (
                      <option key={genre} value={genre}>{genre}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Age
                  </label>
                  <input
                    type="number"
                    value={filters.minAge}
                    onChange={(e) => handleFilterChange('minAge', e.target.value)}
                    placeholder="Min age"
                    min="0"
                    max="18"
                    className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Age
                  </label>
                  <input
                    type="number"
                    value={filters.maxAge}
                    onChange={(e) => handleFilterChange('maxAge', e.target.value)}
                    placeholder="Max age"
                    min="0"
                    max="18"
                    className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Author
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Age
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Genres
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tags
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Imported
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentBooks.map((book) => (
                    <tr key={book.id}>
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          {(book.coverImage || book.image) && (
                            <img
                              src={book.coverImage || book.image}
                              alt={book.title}
                              className="w-10 h-10 rounded object-cover mr-3 flex-shrink-0"
                            />
                          )}
                          <div className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                            {book.title}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        <div className="truncate max-w-[150px]">{book.author}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {book.ageRange.min}-{book.ageRange.max}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {book.genres.slice(0, 2).map((genre) => (
                            <span
                              key={genre}
                              className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800"
                            >
                              {genre}
                            </span>
                          ))}
                          {book.genres.length > 2 && (
                            <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                              +{book.genres.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {book.tags?.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800"
                            >
                              {tag}
                            </span>
                          ))}
                          {book.tags && book.tags.length > 2 && (
                            <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                              +{book.tags.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {book.importedAt && new Date(book.importedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(book)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                          disabled={isLoading}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(book)}
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

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
              {currentBooks.map((book) => (
                <div key={book.id} className="bg-white border rounded-lg p-4 shadow-sm">
                  <div className="flex items-start space-x-3">
                    {(book.coverImage || book.image) && (
                      <img
                        src={book.coverImage || book.image}
                        alt={book.title}
                        className="w-16 h-16 rounded object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {book.title}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">
                        {book.author}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Age: {book.ageRange.min}-{book.ageRange.max}
                      </p>
                      
                      {book.genres.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {book.genres.slice(0, 3).map((genre) => (
                            <span
                              key={genre}
                              className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800"
                            >
                              {genre}
                            </span>
                          ))}
                          {book.genres.length > 3 && (
                            <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                              +{book.genres.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                      
                      {book.tags && book.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {book.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800"
                            >
                              {tag}
                            </span>
                          ))}
                          {book.tags.length > 3 && (
                            <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                              +{book.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                      
                      {book.importedAt && (
                        <p className="text-xs text-gray-400 mt-2">
                          Imported: {new Date(book.importedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => handleEdit(book)}
                        className="text-indigo-600 hover:text-indigo-900 p-1"
                        disabled={isLoading}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                                             <button
                         onClick={() => handleDeleteClick(book)}
                         className="text-red-600 hover:text-red-900 p-1"
                         disabled={isLoading}
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && <PaginationControls />}
          </>
        )}
      </div>

      {/* Add/Edit Book Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && bookToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Delete Book
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Are you sure you want to delete "{bookToDelete.title}" by {bookToDelete.author}? This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  type="button"
                  onClick={handleDeleteCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookList; 