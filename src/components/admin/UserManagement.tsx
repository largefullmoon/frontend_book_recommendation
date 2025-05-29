import React, { useState, useEffect } from 'react';
import { Search, Mail, Phone, BookOpen } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

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

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  childName: string;
  childAge: number;
  recommendations: string[];
  createdAt: Date;
}

const UserManagement: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBooks = async () => {
    try {
      const response = await axios.get<Book[]>(`${API_BASE_URL}/books`);
      setBooks(response.data);
    } catch (err) {
      console.error('Error fetching books:', err);
      setError('Failed to fetch books data');
    }
  };

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get<User[]>(`${API_BASE_URL}/users`);
      setUsers(response.data.map(user => ({
        ...user,
        createdAt: new Date(user.createdAt)
      })));
      setError(null);
    } catch (err) {
      setError('Failed to fetch users. Please try again later.');
      console.error('Error fetching users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchBooks();
  }, []);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.childName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">User Management</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User List */}
        <div className="col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-4 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search users..."
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
              <div className="space-y-2">
                {filteredUsers.map(user => (
                  <button
                    key={user.id}
                    onClick={() => setSelectedUser(user.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedUser === user.id
                        ? 'brand-blue-bg text-white'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-medium">{user.childName}</div>
                    <div className="text-sm opacity-80">Parent: {user.name}</div>
                    <div className="text-xs opacity-70">Age: {user.childAge}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* User Details */}
        <div className="col-span-2">
          {selectedUser ? (
            <div className="bg-white rounded-lg shadow">
              {(() => {
                const user = users.find(u => u.id === selectedUser);
                if (!user) return null;

                return (
                  <>
                    <div className="p-6 border-b">
                      <h2 className="text-xl font-semibold text-gray-800">User Details</h2>
                    </div>

                    <div className="p-6 space-y-6">
                      {/* Child Information */}
                      <div>
                        <h3 className="text-lg font-medium text-gray-800 mb-3">Child Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm text-gray-500">Name</label>
                            <div className="font-medium">{user.childName}</div>
                          </div>
                          <div>
                            <label className="text-sm text-gray-500">Age</label>
                            <div className="font-medium">{user.childAge} years old</div>
                          </div>
                        </div>
                      </div>

                      {/* Parent Information */}
                      <div>
                        <h3 className="text-lg font-medium text-gray-800 mb-3">Parent Information</h3>
                        <div className="space-y-3">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                              <Mail className="w-4 h-4 text-indigo-600" />
                            </div>
                            <div>
                              <label className="text-sm text-gray-500">Email</label>
                              <div className="font-medium">{user.email}</div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                              <Phone className="w-4 h-4 text-indigo-600" />
                            </div>
                            <div>
                              <label className="text-sm text-gray-500">Phone</label>
                              <div className="font-medium">{user.phone}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Reading History */}
                      <div>
                        <h3 className="text-lg font-medium text-gray-800 mb-3">Reading History</h3>
                        <div className="space-y-3">
                          {user.recommendations.map((bookId, index) => {
                            const book = books.find((b: Book) => b.id === bookId);
                            if (!book) return null;

                            return (
                              <div
                                key={bookId}
                                className="flex items-center p-3 bg-gray-50 rounded-lg"
                              >
                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                                  <BookOpen className="w-4 h-4 text-indigo-600" />
                                </div>
                                <div>
                                  <div className="font-medium">{book.title}</div>
                                  <div className="text-sm text-gray-500">{book.author}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Account Information */}
                      <div>
                        <h3 className="text-lg font-medium text-gray-800 mb-3">Account Information</h3>
                        <div>
                          <label className="text-sm text-gray-500">Member Since</label>
                          <div className="font-medium">{formatDate(user.createdAt)}</div>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                Select a user to view their details
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement; 